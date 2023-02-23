const mongoose = require("mongoose")
const Schema = mongoose.Schema

const partSchema = new Schema({
  city: String,
  factory: String,
  name: String,
  pounds: Number,
  avgTime: Number,
  weight: Number,
  productionTime: Number,
  finishGoodWeight: Number,
  cageWeightScrap: Number,
  caseWeightActuals: Number,
  machineClass: String,
  preview: String
}, {
  timestamps: true
})

const Part = mongoose.model("Parts", partSchema)

module.exports = Part