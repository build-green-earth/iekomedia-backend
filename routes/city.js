const express = require("express")
const router = express.Router()

const { updateCity, getCity } = require("../controllers/city.js")
const { verifyToken } = require("../middleware/verifyToken")

router.post("/update-city", verifyToken, updateCity)
router.get("/get-city", verifyToken, getCity)

module.exports = router