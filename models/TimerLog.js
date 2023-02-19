const mongoose = require("mongoose")
const Schema = mongoose.Schema

const timerLogSchema = new Schema({
  timer: {
    type: Schema.Types.ObjectId,
    ref: "Timers"
  },
  startTime: Date,
  endTime: Date,
  weight: Number,
  productionTime: Number,
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

const TimerLog = mongoose.model("TimerLog", timerLogSchema)

module.exports = TimerLog