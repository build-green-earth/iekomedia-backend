const Sequelize = require("sequelize")

const db = new Sequelize.Sequelize('skylitco_testdatabase', 'skylitco_Test', 'I?eKJ;{Xdn0@', {
  host: '55.28.36.18',
  dialect: 'mysql'
})

module.exports = db