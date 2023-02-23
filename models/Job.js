const mongoose = require("mongoose")
const Schema = mongoose.Schema

const jobSchema = new Schema({
  city: String,
  factory: String,
  name: String,
  machine: {
    type: Schema.Types.ObjectId,
    ref: "Machines"
  },
  part: {
    type: Schema.Types.ObjectId,
    ref: "Parts"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users"
  },
  count: Number,
  producedCount:{
    type: Number,
    default: 0
  },
  drawingNumber: String,
  dueDate: Date,
  optional: "",
  active: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const Job = mongoose.model("Jobs", jobSchema)

module.exports = Job