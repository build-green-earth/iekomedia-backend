const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const router = require("./routes/index.js")
const timer = require("./config/time.js")
const path = require('path')
const mongoose = require('mongoose')
const { readPartFile, readMachineFile, readTimerFile } = require('./convertdb/index.js')
const { getCurrentTime } = require('./helpers/functions.js')

dotenv.config({path: __dirname + '/.env'});

const port = process.env.PORT || 8000
const MONGO_URI = process.env.MONGO_URI
console.log(MONGO_URI)
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to Database'))

const app = express()
timer.startTimer()

app.use(express.static(path.join(__dirname, 'client')));
app.use(cors({ credentials: true, origin: "*" }))
app.use(cookieParser())
app.use(express.json())
app.use(router)

// readPartFile()
// readMachineFile()
// readTimerFile()
console.log(getCurrentTime())

app.listen(port, () => { console.log(`server running at port ${port}`) })