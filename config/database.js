const Sequelize = require("sequelize")

const db = new Sequelize.Sequelize('testdatabase', 'root', 'Aeritex124!@$iekoMedia', {
  host: 'localhost',
  dialect: 'mysql'
})

module.exports = db