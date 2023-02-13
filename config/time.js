const Setting = require("../models/Setting")

const startTimer = async () => {
  global.remaining = 2073600
  setInterval(() => {
    global.remaining--
  }, 1000)
}

module.exports = { startTimer }