const mongoose = require("mongoose")
const Schema = mongoose.Schema

const machineSchema = new Schema({
  city: String,
  factory: String,
  name: String,
  details: String,
  preview: String,
  weight: Number,
  productionTime: Number,
  preview: String,
  machineClass: String
}, {
  timestamps: true
})

const Machine = mongoose.model("Machines", machineSchema)

module.exports = Machine