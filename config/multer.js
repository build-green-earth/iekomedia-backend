const multer = require("multer")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './client/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, req.user.name+'.png')
  }
})

const upload = multer({ storage: storage, limit: 1024 * 1024 * 200 }).single('avatar')

module.exports = { upload }