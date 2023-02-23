const express = require("express")
const router = express.Router()

const { createJob, getJobs, deleteJob, updateJob } = require("../controllers/job.js")
const { verifyToken } = require("../middleware/verifyToken")

router.post("/create-job", verifyToken, createJob)
router.get("/get-jobs", verifyToken, getJobs)
router.post("/update-job", verifyToken, updateJob)
router.delete("/delete-job", verifyToken, deleteJob)

module.exports = router