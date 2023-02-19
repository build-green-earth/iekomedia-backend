const express = require("express")
const router = express.Router()

const { createJob, getJobs } = require("../controllers/job.js")
const { verifyToken } = require("../middleware/verifyToken")

router.post("/create-job", verifyToken, createJob)
router.get("/get-jobs", verifyToken, getJobs)

module.exports = router