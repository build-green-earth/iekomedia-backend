const City = require("../models/City")

const updateCity = async (req, res) => {
  let city = await City.findOne({ name: req.body.city })

  if (!city) {
    city = new City({
      name: req.body.city,
      productionTime: req.body.productionTime
    })
  } else {
    city.productionTime = req.body.productionTime
  }

  await city.save()
  res.sendStatus(200)
}

const getCity = async (req, res) => {
  try {
    const cityName = req.query.city
    let city = await City.findOne({ name: cityName })
    console.log(city)
    if (!city) {
      city = new City({
        name: cityName,
        productionTime: 13,
      })
      await city.save()
    }
    res.send({ city })
  } catch (err) {
    res.sendStatus(500)
  }
}

module.exports = { updateCity, getCity }