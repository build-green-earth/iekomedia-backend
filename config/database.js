const Sequelize = require("sequelize")

const db = new Sequelize.Sequelize('skylitco_testdatabase', 'skylitco_Test', 'I?eKJ;{Xdn0@', {
  host: 'ameritexpdtk.com',
  dialect: 'mysql'
})

module.exports = db