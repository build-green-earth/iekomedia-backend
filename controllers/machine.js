const { uploadPartPreview, uploadMachinePreview } = require('../config/multer')
const Machine = require('../models/Machine')
const Part = require('../models/Part')
const { getModel, getCurrentTime } = require('../helpers/functions')
const Timer = require('../models/Timer')
const TimerLog = require('../models/TimerLog')

const createMachine = async (req, res) => {
  try {
    const machine = new Machine({
      ...req.body,
      preview: "/uploads/machines/"+req.file.filename
    })
    await machine.save()
    return res.send({machine})
  } catch (err) {
    res.sendStatus(500)
  }
}

const createPart = async (req, res) => {
  try {
    const part = new Part({
      ...req.body,
      preview: "/uploads/parts/"+req.file.filename
    })
    await part.save()
    return res.send({part})
  } catch (err) {
    res.sendStatus(500)
  }
}

const createTimer = async (req, res) => {
  try {
    const timer = new Timer({
      ...req.body,
      times: []
    })
    await timer.save()
    const _timer = await Timer.findOne({ _id: timer._id }).populate("machine").populate("part").lean()
    res.send({ timer: {
      ..._timer,
      time: 0,
      totalTime: 0
    }})
  } catch(err) {
    console.log(err)
    res.sendStatus(500)
  }
}

const getProducts = async(req, res) => {
  try {
    const model = getModel(req.body.type)
    let products

    if (req.body.type == "Timer") {
      products = await Timer.find({}).sort({createdAt: -1}).populate("machine").populate("part").limit(20).lean()
      let _products = []
      for (product of products) {
        let time = 0
        
        for (period of product.times) {
          if (period.endTime) {
            time += (parseInt((period.endTime.getTime() - period.startTime.getTime()) /1000 ))
          } else {
            if (product.status == "Started" && period.startTime) {
              time += (parseInt((new Date().getTime() - period.startTime.getTime()) / 1000))
            }
          }
        }

        _products.push({
          ...product,
          time,
          totalTime: time
        })
      }
      return res.send({ products: _products })
    } else {
      products = await model.find({}).sort({createdAt: -1})
    }
    res.send({ products })
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}

const deleteProduct = async (req, res) => {
  try {
    const model = getModel(req.body.type)
    await model.deleteOne({ _id: req.body.id })
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
}

const editProduct = async (req, res) => {
  try {
    const model = getModel(req.body.type)
    await model.findOneAndUpdate({
      _id: req.body.id
    }, {
      ...req.body.updates
    })
  } catch (err) {

  }
}

const startTimer = async (req, res) => {
  try {
    const timer = await Timer.findOne({ _id: req.body.id })
    const time = new Date(req.body.time)
    if (timer.status == "Pending") {
      const length = timer.times.length
      timer.times = [
        ...timer.times,
        {
          startTime: time,
          endTime: undefined
        }
      ]
    }
    timer.status = "Started"
    await timer.save()
    res.sendStatus(200)
  } catch(err) {
    res.sendStatus(500)
  }
}

const endTimer = async (req, res) => {
  try {
    const timer = await Timer.findOne({ _id: req.body.id })
    const now = new Date(req.body.time)

    if (timer.status == "Started")
      await stopTimerHandler(timer, req.body.time)
    
    const timerLog = new TimerLog({
      timer,
      startTime: timer.times[0].startTime,
      endTime: now,
      productionTime: timer.productionTime,
      weight: timer.productionTime,
      times: timer.times
    })
    await timerLog.save()

    timer.endTime = now
    timer.status = "Pending"
    timer.times = []
    await timer.save()
    
    res.sendStatus(200)
  } catch(err) {
    console.log(err)
    res.sendStatus(500)
  }
}

const stopTimerHandler = async (timer, time) => {
  if (timer.status == "Started") {
    const length = timer.times.length
    timer.times[length - 1].endTime = time
    timer.status = "Pending"
    await timer.save()
  }
}

const stopTimer = async (req, res) => {
  try {
    const timer = await Timer.findOne({ _id: req.body.id })
    const time = new Date(req.body.time)
    await stopTimerHandler(timer, time)
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
}

const updateTimer = async (req, res) => {
  try {
    await Timer.findOneAndUpdate({
      _id: req.body.id
    }, {
      ...req.body.updates
    })
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
}

module.exports = { createMachine, createPart, createTimer, getProducts, editProduct, deleteProduct, startTimer, endTimer, stopTimer, updateTimer }