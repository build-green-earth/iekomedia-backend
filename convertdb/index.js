const Timer = require("../models/Timer")
const Part = require("../models/Part")
const Machine = require("../models/Machine")

const { factories, cities, status } = require("../config/globals")

const readExcel = require('read-excel-file/node')
const { getXlsxStream } = require("xlstream");
const Job = require("../models/Job")

const checkIfNull = (v) => {
  return v=="NULL"?undefined:v;
}

const checkTime = (v) => {
  return (v!=null&&v!="NULL")?new Date(v):undefined
}

const readPartFile = async () => {
  await Part.deleteMany({})
  readExcel("./convertdb/parts.xlsx").then(async (data) => {
    for (row of data) {
      if (row[0] == "id") continue
      
      const part = new Part({
        city: cities[row[2] - 1],
        factory: "",
        name: row[1],
        pounds: parseInt(row[6])||0,
        avgTime: (parseInt(row[7]) * 60) || 0,
        finishGoodWeight: checkIfNull(row[9]),
        caseWeightActuals: checkIfNull(row[10]),
        caseWeightActuals: checkIfNull(row[11]),
        preview: ""
      })

      await part.save()
    }
  }).catch (err => console.log(err))
}

const readJobFile = async () => {
  await Job.deleteMany({})

  const jobItems = await readExcel("./convertdb/job-items.xlsx")
  const parts = await readExcel("./convertdb/parts.xlsx")
  const machines = await readExcel("./convertdb/machines.xlsx")

  readExcel("./convertdb/jobs.xlsx").then(async (data) => {
    for (row of data) {
      if (row[0] == "id") continue
      const machineIndex = machines.findIndex((m, index) => m[0] == row[7])
      let machine = undefined
      if (machineIndex != -1)
        machine = await Machine.findOne({ name: machines[machineIndex][2] })

      let _jobItems = jobItems.filter(j => row[0] == j[1])
      if (!_jobItems) _jobItems = undefined

      for(const jobItem of _jobItems) {

        const partIndex = parts.findIndex(p => p[0] == jobItem[2])
        let part = undefined
        if (partIndex != -1) part = await Part.findOne({ name: parts[partIndex][1] })

        if (!part || !machine || jobItem[3] == "NULL" || jobItem[3] == "NULL")
          continue
        const job = new Job({
          name: row[1],
          city: cities[parseInt(row[3]) - 1],
          factory: machine ? machine.factory : "",
          machine: machine,
          part: part,
          user: undefined,
          count: parseInt(jobItem[3])||0,
          producedCount: parseInt(jobItem[4])||0,
          createdAt: checkTime(row[5]),
          updatedAt: checkTime(row[6]),
          drawingNumber: jobItem[7],
          dueDate: checkTime(row[5]),
          active: jobItem[9]=="Y"?true:false
        })
        await job.save()
      }

    }
  }).catch (err => console.log(err))
}

const readMachineFile = async () => {
  await Machine.deleteMany({})
  readExcel("./convertdb/machines.xlsx").then(async (data) => {
    for (row of data) {
      if (row[0] == "id") continue
      const machine = new Machine({
        city: cities[row[1] - 1],
        factory: factories[row[5]],
        name: row[2],
        details: checkIfNull(row[3]),
        preview: ""
      })

      await machine.save()
    }
  }).catch (err => console.log(err))
}

const readTimerFile = async () => {

  const parts = await readExcel("./convertdb/parts.xlsx")
  const machines = await readExcel("./convertdb/machines.xlsx")

  await Timer.deleteMany({})
  const stream = await getXlsxStream({
    filePath: "./convertdb/timers.xlsx",
    sheet: 0,
  });
  stream.on("data", async (data, index) => {
    const row = data.formatted.arr
    if (row[0] == "id") return

    const machine = machines[row[1]?row[1]-1:0]
    const part = parts[row[4]?row[4]-1:0]
    const createdTime = checkTime(row[12])
    const startTime = checkTime(row[5])
    const endTime = checkTime(row[6])

    const startTime2 = checkTime(row[8])
    const endTime2 = checkTime(row[9])

    const _times = [{
      startTime,
      endTime
    }]
    if (startTime2) {
      _times.push({
        startTime: startTime2,
        endTime: endTime2
      })
    }

    try {
      const timer = new Timer({
        machine,
        part,
        city: machine.city,
        facotry: machine.factory,
        weight: part.pounds,
        productionTime: part.avgTime,
        status: status[row[3] - 1],
        times: [
          {
            startTime,
            endTime
          },
          {
            startTime: startTime2,
            endTime: endTime2
          }
        ],
        createdAt: createdTime
      })
  
      await timer.save()
    } catch (err) {
    }
  });
}

module.exports = { readPartFile, readMachineFile, readTimerFile, readJobFile }