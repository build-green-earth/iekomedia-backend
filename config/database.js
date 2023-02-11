const Sequelize = require("sequelize")

const db = new Sequelize.Sequelize('testdatabase', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
})

module.exports = db