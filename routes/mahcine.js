const express = require("express")
const router = express.Router()
const multer = require('multer')

const { random } = require("../helpers/functions")

const machineStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './client/uploads/machines')
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, "machine-preview-"+Date.now()+random(10000, 99999)+"."+ext)
  }
})

const partStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './client/uploads/parts')
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, "machine-preview-"+Date.now()+random(10000, 99999)+"."+ext)
  }
})

const uploadMachinePreview = multer({
  storage: machineStorage,
});

const uploadPartPreview = multer({
  storage: partStorage,
});

const { createMachine, createPart, createTimer, getProducts, deleteProduct, editProduct, startTimer, endTimer, stopTimer, updateTimer, getTimer, searchMachines, getTimerLogsOfMachine, getStartOfProductionTime, getLogsToPrint } = require("../controllers/machine")
const { verifyToken } = require("../middleware/verifyToken")

router.post("/create-machine", [verifyToken, uploadMachinePreview.single("preview")], createMachine)
router.post("/create-part", [verifyToken, uploadPartPreview.single("preview")], createPart)
router.post("/get-products", verifyToken, getProducts)
router.delete("/delete-product", verifyToken, deleteProduct)
router.post("/edit-product", verifyToken, editProduct)
router.post("/create-timer", verifyToken, createTimer)
router.post("/start-timer", verifyToken, startTimer)
router.post("/stop-timer", verifyToken, stopTimer)
router.post("/end-timer", verifyToken, endTimer)
router.post("/update-timer", verifyToken, updateTimer)
router.get("/get-timer", verifyToken, getTimer)
router.get("/search-machines", verifyToken, searchMachines)
router.get("/timer-logs-of-machine", verifyToken, getTimerLogsOfMachine)
router.get("/timer-logs-to-print", verifyToken, getLogsToPrint)
router.get("/start-of-production-time", verifyToken, getStartOfProductionTime)

module.exports = router