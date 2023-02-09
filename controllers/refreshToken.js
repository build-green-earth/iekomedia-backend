const User = require("../models/User.js")
const jwt = require("jsonwebtoken")

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.sendStatus(401)

    const user = await User.findAll({
        where: {
            refresh_token: refreshToken
        }
    })
    if (!user[0]) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) res.sendStatus(403)
      const userId = user[0].id
      const { email, name } = user[0]
      const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15s'
      })
      res.json({ acessToken })
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports = { refreshToken }