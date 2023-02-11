const Sequelize = require("sequelize")
const db = require("../config/database.js")

const { DataTypes } = Sequelize.Sequelize

const Setting = db.define('setting', {
  time: {
    type: DataTypes.BIGINT
  },
})

module.exports = Setting