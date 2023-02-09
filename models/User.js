const Sequelize = require("sequelize")
const db = require("../config/database.js")

const { DataTypes } = Sequelize.Sequelize

const User = db.define('users', {
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  refreshToken: {
    type: DataTypes.TEXT
  },
  role: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  factory: {
    type: DataTypes.STRING
  },
  approved: {
    type: DataTypes.BOOLEAN
  },
  admin: {
    type: DataTypes.BOOLEAN
  },
  restrict: {
    type: DataTypes.BOOLEAN
  }
})

module.exports = User