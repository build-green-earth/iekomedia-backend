const Timer = require("../models/Timer")
const Part = require("../models/Part")
const Machine = require("../models/Machine")

const { factories, cities, status } = require("../config/globals")

const readExcel = require('read-excel-file/node')
const { getXlsxStream } = require("xlstream");

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
        pounds: parseInt(row[6]),
        avgTime: parseInt(row[7]) * 60,
        finishGoodWeight: checkIfNull(row[9]),
        caseWeightActuals: checkIfNull(row[10]),
        caseWeightActuals: checkIfNull(row[11]),
        preview: ""
      })

      await part.save()
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
  const machines = await Machine.find({})
  const parts = await Part.find({})
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
      console.log(machine, row[1], row[4])
    }
  });
}

module.exports = { readPartFile, readMachineFile, readTimerFile }