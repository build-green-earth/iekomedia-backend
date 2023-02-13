const express = require("express")
const router = express.Router()

const { login, logout, register, allUsers, approveUser, updateUser, remainingTime, uploadAvatar } = require("../controllers/auth.js")
const { refreshToken } = require('../controllers/refreshToken.js')
const { verifyToken } = require("../middleware/verifyToken")

router.post("/login", login)
router.post("/register", register)
router.post("/logout", logout)
router.get("/token", refreshToken)
router.get("/all-users", verifyToken, allUsers)
router.post("/approve-user", approveUser)
router.post("/update-user", verifyToken, updateUser)
router.get("/remaining-time", remainingTime)
router.post("/upload-avatar", verifyToken, uploadAvatar)

module.exports = router