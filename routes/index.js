const express = require('express')
const authRouter = require("./auth")
const machineRouter = require("./mahcine")
const jobRouter = require("./job")
const path = require('path');

const router = express.Router()

router.use("/api/auth", authRouter)
router.use("/api/timer", machineRouter)
router.use("/api/job", jobRouter)

router.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

module.exports = router