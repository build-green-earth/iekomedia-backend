const express = require('express')
const authRouter = require("./auth.js")
const path = require('path');
const fileUpload = require('express-fileupload')

const router = express.Router()

router.use(fileUpload())
router.use("/api/auth", authRouter)

router.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

module.exports = router