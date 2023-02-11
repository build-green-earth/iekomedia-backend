const Setting = require("../models/Setting")

const startTimer = async () => {
  const setting = await Setting.findOne({
    id: 1
  })

  global.remaining = setting.time
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