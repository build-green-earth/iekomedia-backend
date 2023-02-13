const User = require("../models/User.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize");
const Setting = require("../models/Setting.js");
const { upload } = require("../config/multer")
const path = require('path')
const fs = require('fs')

const register = async (req, res) => {
  const { username, email, password, confirmPassword, role, location } = req.body

  let user = await User.findAll({
    where: {
      email: req.body.email
    },
  });
  if (user.length) return res.status(400).json({msg: "Email already exists!"})

  user = await User.findAll({
    where: {
      name: req.body.username
    },
  });
  if (user.length) return res.status(400).json({msg: "Username already exists!"})

  if (password !== confirmPassword) return res.status(400).json({msg: "Password and Confirm Password does not match"})
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt)
  try {
    await User.create({
      name: username,
      email,
      password: hashPassword,
      role,
      location
    })
    res.json({msg: "Registeration Successful"});
  } catch (err) {
    console.log(err)
  }
} 

const login = async(req, res) => {
  try {
    const user = await User.findAll({
      where: {
        email: req.body.email
      },
    });
    const match = await bcrypt.compare(req.body.password, user[0].password)
    if (!match) return res.status(400).json({msg: "Wrong Password"});
    if (!user[0].approved) return res.status(403).json({msg: "Your account is under review"})

    const { id, name, email, role, approved } = user[0]
    const accessToken = jwt.sign({ id, name, email, role, approved }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    const refreshToken = jwt.sign({ id, name, email, role, approved }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
    
    await User.update({ refresh_token: refreshToken }, {
      where: {
        id
      }
    })
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

  const user = await User.findAll({
    where: {
      refresh_token: refreshToken
    }
  })
  if (!user[0]) return res.sendStatus(204)
  const userId = user[0].id
  await User.update({ refresh_token: null }, {
    where: {
      id: userId
    }
  })
  res.clearCookie('refreshToken')
  return res.sendStatus(200)
}

const allUsers = async (req, res) => {
  const filter = req.query.filter
  let where
  let users = []
  if (req.user.role == "Admin") {
    if (filter == "Production") {
      where = {
        role: "Production"
      }
    } else if (filter == "Corporate"){
      where = {
        [Op.or]: [
          { role: "Corporate" },
          { role: "HR" },
          { role: "Sales" },
          { role: "Accounting" },
        ]
      }
    } else {
      where = {
        location: filter,
        role: "Personnel"
      }
    }
  } else if (req.user.role == "HR") {
    if (filter == "active-members") where = { approved: 1, role: "Personnel" }
    else if (filter == "pending-members") where = { approved: 0, role: "Personnel" }
    else {
      where = { factory: filter }
      if (!req.user.admin)
        where = {
          ...where,
          location: req.user.location
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

  users = await User.findAll({ attributes: ["id", "name", "email", "role", "approved", "createdAt", "location", "admin", "restrict", "factory"], 
    where,
    order: [
      ['approved', 'ASC']
    ]
  })
  
  return res.json({users, isAdmin: req.user.admin})
}

const approveUser = async (req, res) => {
  const user = await User.findAll({
    where: {
      id: req.body.id
    }
  })

  await User.update({ approved: 1 - user[0].approved }, {
    where: {
      id: req.body.id
    }
  })

  return res.json({msg: "Successful"})
}

const updateUser = async(req, res) => {
  if ((req.user.role != "Production" && !req.user.admin)) return res.status(403)

  const user = await User.findOne({
    where: {
      id: req.body.id
    }
  })
  if (!user) return res.sendStatus(500)
  if (req.body.delete) {
    await User.destroy({
      where: {
        id: req.body.id
      }
    })
    return res.sendStatus(200)
  }

  if (req.user.role == "HR" && req.user.location != user.location) return

  await User.update({
    ...req.body
  }, {
    where: {
      id: req.body.id,
    }
  })

  res.sendStatus(200)
}

const remainingTime = async(req, res) => {
  res.json({ time: global.remaining })
}

const uploadAvatar = async (req, res) => {
  upload(req, res, (err) => {
  })
}

module.exports = { login, logout, register, allUsers, allUsers, approveUser, updateUser, remainingTime, uploadAvatar }