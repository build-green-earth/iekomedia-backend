const User = require("../models/User.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize");
const Setting = require("../models/Setting.js");
const { upload } = require("../config/multer")
const path = require('path')
const fs = require('fs')

const register = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, role, location } = req.body

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
      email: req.body.email
    });
    const match = await bcrypt.compare(req.body.password, user[0].password)
    if (!match) return res.status(400).json({ msg: "Wrong Password" });
    if (!user[0].approved) return res.status(403).json({ msg: "Your account is under review" })

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
  if (filter == "undefined") filter = undefined

  let where
  let users = []
  if (req.user.role == "Admin") {
    if (filter == "Production") {
      where = {
        role: "Production"
      }
    } else if (filter == "Corporater") {
      where = {
        $or: [
          { role: "Corporater" },
          { role: "HR" },
          { role: "Sales" },
          { role: "Accounting" },
        ]
      }
    } else {
      if (filter) {
        where = {
          location: filter,
          $or: [
            { role: "Corporater" },
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
            { role: "Corporater" },
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
    if (filter == "active-members") where = { approved: 1 }
    else if (filter == "pending-members") where = { approved: 0 }
    else {
      if (filter)
        where = { location: filter }
      if (!req.user.admin)
        where = {
          ...where,
          location: req.user.location
        }
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
  } else if (req.user.role == "Production") {
    if (filter == "active-personnel") where = { approved: 1, role: "Personnel" }
    else if (filter == "pending-personnel") where = { approved: 0, role: "Personnel" }
    where = {
      ...where,
      location: req.user.location
    }
  }

  try {
    users = await User.find(where).and({ _id: { $ne: req.user._id } }).skip((page - 1) * count).limit(count).select("id firstName lastName email role approved createdAt location admin restrict factory");
  } catch (err) { console.log(err) }


  return res.json({ users, isAdmin: req.user.admin })
}

const approveUser = async (req, res) => {
  let user = await User.findOne({
    _id: req.body.id
  })
  user.approved = 1 - user[0].approved
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
  upload(req, res, (err) => {
    res.sendStatus(200)
  })
}

module.exports = { login, logout, register, allUsers, allUsers, approveUser, updateUser, remainingTime, uploadAvatar }