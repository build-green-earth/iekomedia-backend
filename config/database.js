const Sequelize = require("sequelize")

const db = new Sequelize.Sequelize('testdatabase', 'root', 'Aeritex124!@$iekoMedia', {
  host: '127.0.0.1',
  dialect: 'mysql'
})

module.exports = db