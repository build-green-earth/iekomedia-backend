const Setting = require("../models/Setting")

const startTimer = async () => {
  let setting
  try {
    setting = await Setting.findOne({
      where: {
        id: 1
      }
    })
  } catch (err) {
    console.log(err)
  }
  
  global.remaining = setting.time
  console.log(setting.time)
  setInterval(() => {
    global.remaining--
    Setting.update({
      time: global.remaining
    }, {
      where: {
      id: 1
    }})
  }, 1000)
}

module.exports = { startTimer }