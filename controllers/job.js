const Job = require("../models/Job")

const ITEMS_PER_PAGE = 10

const createJob = async (req, res) => {
  try {
    const job = new Job({
      ...req.body
    })
    await job.save()
    const _job = await Job.findOne({ _id: job._id }).populate("machine").populate("part").populate("user")
    res.send({ job: _job })
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}

const getJobs = async (req, res) => {
  try {
    const page = req.query.page || 1
    const count = req.query.count || 7
    let active = true
    const keyword = req.query.query || ""
    if ("tab" in req.query) active = req.query.tab
    const activeJobs = await Job.find({}).populate("machine").populate("part").populate("user").where({ active: 1 })
    const finishedJobs = await Job.find({}).populate("machine").populate("part").populate("user").where({ active: 0 })
    const totalJobs = await Job.find({}).where({ active })
      .populate("machine")
      .populate("part")
      .populate("user")
      .where({ active, name: { "$regex": keyword, "$options": "i" } })

    const jobs = await Job
      .find({})
      .populate("machine")
      .populate("part")
      .populate("user")
      .where({ active, name: { "$regex": keyword, "$options": "i" } })
      .skip((page - 1) * count)
      .limit(count)
    console.log(jobs)
    res.send({ jobs, totalActiveCount: activeJobs.length, totalFinishedCount: finishedJobs.length, resultCount: totalJobs.length })
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate({
      _id: req.body.id
    }, {
      ...req.body.update
    }, {
      new: true
    }).populate("machine").populate("user").populate("part")
    res.send({ job })
  } catch (err) {
    res.sendStatus(500)
  }
}

const deleteJob = async (req, res) => {
  try {
    await Job.findOneAndDelete({
      _id: req.body.id
    })
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
}

module.exports = { createJob, getJobs, updateJob, deleteJob }