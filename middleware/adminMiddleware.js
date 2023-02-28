const jwt = require("jsonwebtoken")
const User = require("../models/User")

const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization']
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403)
    req.email = decoded.email

    const user = await User.findOne({
      where: {
        email: req.email
      }
    })
    if (user.role != "admin") return res.sendStatus(403)
    next()
  })
}

module.exports = { verifyAdmin }