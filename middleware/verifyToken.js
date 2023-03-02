const jwt = require("jsonwebtoken")
const User = require("../models/User")

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403)
    const user = await User.findOne({
      _id: decoded._id
    })
    req.user = user
    next()
  })
}

module.exports = { verifyToken }