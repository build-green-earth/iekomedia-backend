const mongoose = require("mongoose")
const Schema = mongoose.Schema

const settingSchema = new Schema ({
  time: Number
})

module.exports = mongoose.model("Setting", settingSchema)