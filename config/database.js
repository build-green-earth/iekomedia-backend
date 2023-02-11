const Sequelize = require("sequelize")

const db = new Sequelize.Sequelize('testdatabase', 'remote', 'Star123!@#', {
  host: '146.190.160.152',
  dialect: 'mysql'
})

module.exports = db