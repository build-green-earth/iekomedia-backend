const mongoose = require("mongoose")
const Schema = mongoose.Schema
const moment = require("moment")

const ProductionClockSchema = new Schema({
  city: String,
  startedAt: {
    type: Date,
    default: Date().now
  },
})

const ProductionClock = mongoose.model("ProductionClock", ProductionClockSchema)

const startProductionLog = async (city) => {
  const today = moment().startOf('day')
  const isExist = await ProductionClock.findOne({
    startedAt: {
      $gte: today.toDate(),
      $lte: moment(today).endOf('day').toDate()
    }
  })

  if (!isExist) {
    try {
      const clockLog = new ProductionClock({
        city,
        startedAt: new Date()
      })
      await clockLog.save()
    } catch(err) {
    }    
  }
}

const getStartProductionTime = async(city) => {
  try {
    const today = moment().startOf('day')
    const clockLog = await ProductionClock.findOne({
      city,
      startedAt: {
        $gte: today.toDate(),
        $lte: moment(today).endOf('day').toDate()
      }
    })
    console.log(clockLog)
    return clockLog
  } catch (err) {
    return null
  }
}

module.exports = { ProductionClock, startProductionLog, getStartProductionTime }