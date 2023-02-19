const mongoose = require("mongoose")
const Schema = mongoose.Schema

const timerSchema = new Schema({
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
  weight: Number,
  productionTime: Number,
  status: {
    type: String,
    default: "Pending"
  },
  times: [
    {
      startTime: {
        type: Date
      },
      endTime: {
        type: Date
      }
    }
  ]
}, {
  timestamps: true
})

const Timer = mongoose.model("Timers", timerSchema)

module.exports = Timer