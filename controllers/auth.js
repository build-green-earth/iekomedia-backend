const User = require("../models/User.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize");
const Setting = require("../models/Setting.js");
const { upload } = require("../config/multer")
const path = require('path')
const fs = require('fs')

const emailChecker = (email) => {
  return email.includes("iekomedia") || email.includes("ameritex")
}
const register = async (req, res) => {
  let { firstName, lastName, email, password, confirmPassword, role, location } = req.body
  email = email.toLowerCase()

  let user = await User.find({
    email: req.body.email
  });
  if (user.length) return res.status(400).json({ msg: "Email already exists!" })


  if (password !== confirmPassword) return res.status(400).json({ msg: "Password and Confirm Password does not match" })
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt)
  try {
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
      role,
      location,
      approved: emailChecker(email) ? -1 : 0
    })
    await newUser.save()
    res.json({ msg: "Registeration Successful" });
  } catch (err) {
    console.log(err)
  }
}

const login = async (req, res) => {
  try {
    const user = await User.find({
      email: req.body.email.toLowerCase()
    });
    const match = await bcrypt.compare(req.body.password, user[0].password)
    if (!match) return res.status(400).json({ msg: "Wrong Password" });
    if (user[0].approved !== 1) return res.status(403).json({ msg: "Your account is under review" })

    const { _id, firstName, lastName, email, role, approved } = user[0]
    const accessToken = jwt.sign({ _id, firstName, lastName, email, role, approved }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    const refreshToken = jwt.sign({ _id, firstName, lastName, email, role, approved }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })

    res.cookie('refreshToken', refreshToken, {
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.json({ accessToken, refreshToken })
  } catch (err) {
    console.log(err)
    res.status(404).json({ msg: "Email not found", err })
  }
}

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) return res.sendStatus(204)

  if (!user[0]) return res.sendStatus(204)
  const userId = user[0].id
  res.clearCookie('refreshToken')
  return res.sendStatus(200)
}

const allUsers = async (req, res) => {
  let filter = req.query.filter
  const page = req.query.page || 1
  const count = req.query.count || 7
  const queries = req.query.query.split(" ")
  let where
  let _users = []
  let users = []
  if (req.user.role == "Admin") {
    if (filter == "Production") {
      where = {
        role: "Production"
      }

    }
    else if (filter == "Personnel") {
      where = {
        role: "Personnel"
      }
    }
    else if (filter == "Pending") {
      where = {
        approved: -1
      }
    }
    else if (filter == "Approved") {
      where = {
        approved: 1
      }
    }
    else if (filter == "Rejected") {
      where = {
        approved: 0
      }
    }
    else if (filter == "Corporate") {
      where = {
        $or: [
          { role: "Corporate" },
          { role: "HR" },
          { role: "Sales" },
          { role: "Accounting" },
          { role: "Admin" },
        ]
      }

    } else {
      if (filter) {
        where = {
          location: filter,
          $or: [
            { role: "Corporate" },
            { role: "HR" },
            { role: "Sales" },
            { role: "Accounting" },
            { role: "Production" },
            { role: "Personnel" },
            { role: "Admin" },
          ]
        }
      }
      else
        where = {
          $or: [
            { role: "Corporate" },
            { role: "HR" },
            { role: "Sales" },
            { role: "Accounting" },
            { role: "Production" },
            { role: "Personnel" },
            { role: "Admin" },
          ]
        }
    }
  } else if (req.user.role == "HR") {
    if (filter == "Personnel" || filter == "Production") {
      where = {
        ...where,
        role: filter
      }
      if (!req.user.admin) {
        where = {
          ...where,
          location: req.user.location
        }
      }
    }
    else if (filter == "Corporate") where = {
      $or: [
        { role: "Corporate" },
        { role: "HR" },
        { role: "Sales" },
        { role: "Accounting" },
      ]
    }
    else {
      if (filter == "Approved") where = { ...where, approved: 1 }
      else if (filter == "Pending") where = { ...where, approved: -1 }
      else if (filter == "Rejected") where = { ...where, approved: 0 }
      else if (filter)
        where = { location: filter }
      if (!req.user.admin)
        where = {
          ...where,
          location: req.user.location
        }
      if (req.user.admin) {
        where = {
          ...where,
          role: { $ne: "Admin" }
        }
      } else {
        where = {
          ...where,
          $or: [
            { role: "Personnel" },
            { role: "Production" },
          ]
        }
      }
    }
  } else if (req.user.role == "Production") {
    if (filter == "Approved") where = { approved: 1 }
    if (filter == "Pending") where = { approved: -1 }
    else if (filter == "Rejected") where = { approved: 0 }
    where = {
      ...where,
      role: "Personnel",
      location: req.user.location
    }
  }
  if (queries[1])
    where = {
      ...where,
      firstName: { "$regex": queries[0] || "", "$options": "i" },
      lastName: { "$regex": queries[1] || "", "$options": "i" }
    }
  else {
    where = {
      ...where,
      $and: [
        {
          $or: [
            { firstName: { "$regex": queries[0] || "", "$options": "i" } },
            { lastName: { "$regex": queries[0] || "", "$options": "i" } }
          ]
        }
      ]
    }
  }

  try {
    _users = await User.find(where).and({ _id: { $ne: req.user._id } })
    users = await User.find(where).and({ _id: { $ne: req.user._id } }).skip((page - 1) * count).limit(count).select("id firstName lastName email role approved createdAt location admin restrict factory");
  } catch (err) { console.log(err) }

  return res.json({ users, isAdmin: req.user.admin, totalCount: _users.length })
}

const approveUser = async (req, res) => {
  let user = await User.findOne({
    _id: req.body.id
  })

  user.approved = user.approved == -1 ? user.approved == 1 : !user.approved
  await user.save()

  return res.json({ msg: "Successful" })
}

const updateUser = async (req, res) => {
  if ((req.user.role != "Production" && !req.user.admin)) return res.status(403)

  const user = await User.findOne({
    _id: req.body.id
  })
  if (!user) return res.sendStatus(500)
  if (req.body.delete) {
    await User.deleteOne({
      _id: req.body.id
    })
    return res.sendStatus(200)
  }

  if (req.user.role == "HR" && req.user.location != user.location) return

  await User.updateOne({
    _id: req.body.id
  }, {
    ...req.body
  })

  res.sendStatus(200)
}

const remainingTime = async (req, res) => {
  res.json({ time: global.remaining })
}

const uploadAvatar = async (req, res) => {
  const avatar = req.file ? "/uploads/users/"+req.file.filename : ""
  await User.updateOne({
    _id: req.user._id
  }, {
    avatar
  })
  res.send({avatar})
}

const updateProfile = async (req, res) => {
  console.log(req.body.updates)
  try {
    await User.updateOne({
      _id: req.user._id
    }, {
      ...req.body.updates
    })
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }  
}

const getProfile = async (req, res) => {
  const user = req.user
  res.send({ user })
}

module.exports = { 
  login, 
  logout, 
  register, 
  allUsers, 
  approveUser, 
  updateUser, 
  remainingTime, 
  uploadAvatar,
  updateProfile,
  getProfile
}