const Sequelize = require("sequelize")
const db = require("../config/database.js")

const { DataTypes } = Sequelize.Sequelize

const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  refreshToken: String,
  role: String,
  location: String,
  factory: String,
  approved: Boolean,
  admin: Boolean,
  restrict: Boolean,
})

module.exports = mongoose.model("Users", userSchema)