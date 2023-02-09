const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const db = require('./config/database.js')
const router = require("./routes/index.js")

const port = process.env.PORT || 8000

dotenv.config({path: __dirname + '/.env'});

const app = express()

app.use(express.static('client'));
app.use(cors({ credentials: true, origin: "http://ameritexpdtk.com" }))
app.use(cookieParser())
app.use(express.json())
app.use(router)

app.listen(port, () => { console.log(`server running at port ${port}`) })