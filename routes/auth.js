const express = require("express")
const router = express.Router()
const multer = require('multer')
const { random } = require("../helpers/functions")

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './client/uploads/users')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+random(10000, 99999)+".png")
  }
})
const uploadAvatarMulter = multer({
  storage: avatarStorage,
});

const { login, logout, register, allUsers, approveUser, updateUser, remainingTime, uploadAvatar, updateProfile, getProfile } = require("../controllers/auth.js")
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
router.post("/upload-avatar", [verifyToken, uploadAvatarMulter.single("avatar")], uploadAvatar)
router.post("/update-profile", verifyToken, updateProfile)
router.get("/get-profile", verifyToken, getProfile)

module.exports = router