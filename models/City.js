const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = new Schema({
  name: String,
  productionTime: Number
})

const City = mongoose.model("cities", citySchema)

module.exports = City