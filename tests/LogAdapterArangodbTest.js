import { getLogAdapterArangodb } from '../lib/index'

// eslint-disable-next-line no-unused-vars
import { getArangoDb, printCollections, retrieveData } from './helper'
import { clearDatabaseArangoDb } from '../lib/helper'

const TIMEOUT = 30000

const logAdapter = getLogAdapterArangodb({
  scheme: 'http',
  hostname: 'localhost',
  port: 8529,
  database: 'log',
  username: 'log',
  password: 'log',
})

logAdapter.logAdapterLogLevel = 'debug'
// const logAdapter = getLogAdapterArangodb()

test(
  'create a new logAdapter',
  async done => {
    expect(logAdapter).not.toBeNull()
    await logAdapter.initDb()
    logAdapter.reset()
    clearDatabaseArangoDb(logAdapter.db)
    done()
  },
  TIMEOUT
)

/*
 * Creates on run log entry. This must be stored in the 'run' collection
 */
test(
  'Run: create a single entry',
  async done => {
    logAdapter.reset()
    await clearDatabaseArangoDb(logAdapter.db)

    await logAdapter.log(getRunLog())

    const res = await retrieveData(logAdapter.db)
    // console.log('res',res)

    // we expect that there is only one record
    expect(res.runData.length).toBe(1)
    expect(res.runLogData.length).toBe(1)
    expect(res.tcData.length).toBe(0)
    expect(res.tcLogData.length).toBe(0)
    expect(res.stepData.length).toBe(0)
    expect(res.stepLogData.length).toBe(0)

    const runData = res.runData[0]
    expect(runData._key).toEqual('r1')
    expect(runData.data.val).toEqual('my run message')
    // console.log('runData', runData)

    done()
  },
  TIMEOUT
)

/*
 * The first entry must be stored in the 'run' collection.
 * The second entry must be stores in the 'runLog' collection
 */
test(
  'Run: create two entries',
  async done => {
    logAdapter.reset()
    await clearDatabaseArangoDb(logAdapter.db)

    await logAdapter.log(getRunLog())
    await logAdapter.log(getRunLog({ message: 'second entry' }))
    await logAdapter.log(getRunLog({ message: 'third entry' }))

    const res = await retrieveData(logAdapter.db)

    // we expect that there is only one record
    expect(res.runData.length).toBe(1)
    expect(res.runLogData.length).toBe(3)
    expect(res.tcData.length).toBe(0)
    expect(res.tcLogData.length).toBe(0)
    expect(res.stepData.length).toBe(0)
    expect(res.stepLogData.length).toBe(0)

    const runData = res.runData[0]
    expect(runData._key).toEqual('r1')
    expect(runData.data.val).toEqual('my run message')

    const runData1 = res.runLogData[1]
    // console.log('runData1', runData1)
    expect(runData1._key).not.toEqual('r1')
    expect(runData1.data.val).toEqual('second entry')

    const runData2 = res.runLogData[2]
    // console.log('runData2', runData2)
    expect(runData2._key).not.toEqual('r1')
    expect(runData2.data.val).toEqual('third entry')

    done()
  },
  TIMEOUT
)

test(
  'Testcase: create a single entry',
  async done => {
    logAdapter.reset()
    await clearDatabaseArangoDb(logAdapter.db)

    await logAdapter.log(getRunLog())
    await logAdapter.log(getTcLog())

    const res = await retrieveData(logAdapter.db)
    // console.log('res', res)

    // we expect that there is only one record
    expect(res.runData.length).toBe(1)
    expect(res.runLogData.length).toBe(1)
    expect(res.tcData.length).toBe(1)
    expect(res.tcLogData.length).toBe(1)
    expect(res.stepData.length).toBe(0)
    expect(res.stepLogData.length).toBe(0)

    const runData = res.runData[0]
    expect(runData._key).toEqual('r1')
    expect(runData.data.val).toEqual('my run message')

    const tcData = res.tcData[0]
    // console.log('tcData', tcData)
    expect(tcData._key).toEqual('tc1')
    expect(tcData.meta.tc.name).toEqual('my test case')
    expect(tcData.data.val).toEqual('my tc message')

    done()
  },
  TIMEOUT
)

test(
  'Testcase: create two entries',
  async done => {
    logAdapter.reset()
    await clearDatabaseArangoDb(logAdapter.db)

    await logAdapter.log(getRunLog())
    await logAdapter.log(getTcLog())
    await logAdapter.log(getTcLog({ message: 'my tc message 1' }))
    await logAdapter.log(getTcLog({ message: 'my tc message 2' }))

    const res = await retrieveData(logAdapter.db)
    // console.log('res', res)

    // we expect that there is only one record
    expect(res.runData.length).toBe(1)
    expect(res.runLogData.length).toBe(1)
    expect(res.tcData.length).toBe(1)
    expect(res.tcLogData.length).toBe(3)
    expect(res.stepData.length).toBe(0)
    expect(res.stepLogData.length).toBe(0)

    const runData = res.runData[0]
    expect(runData._key).toEqual('r1')
    expect(runData.data.val).toEqual('my run message')

    const tcData = res.tcData[0]
    // console.log('tcData', tcData)
    expect(tcData._key).toEqual('tc1')
    expect(tcData.meta.tc.name).toEqual('my test case')
    expect(tcData.data.val).toEqual('my tc message')

    const tcData1 = res.tcLogData[1]
    // console.log('tcData1', tcData1)
    expect(tcData1.meta.tc.name).toEqual('my test case')
    expect(tcData1.data.val).toEqual('my tc message 1')

    const tcData2 = res.tcLogData[2]
    // console.log('tcData2', tcData2)
    expect(tcData2.meta.tc.name).toEqual('my test case')
    expect(tcData2.data.val).toEqual('my tc message 2')

    done()
  },
  TIMEOUT
)

test(
  'Step: create single entry',
  async done => {
    logAdapter.reset()
    await clearDatabaseArangoDb(logAdapter.db)

    await logAdapter.log(getRunLog())
    await logAdapter.log(getTcLog())
    await logAdapter.log(getStepLog())

    const res = await retrieveData(logAdapter.db)
    // console.log('res', res)

    // we expect that there is only one record
    expect(res.runData.length).toBe(1)
    expect(res.runLogData.length).toBe(1)
    expect(res.tcData.length).toBe(1)
    expect(res.tcLogData.length).toBe(1)
    expect(res.stepData.length).toBe(1)
    expect(res.stepLogData.length).toBe(1)

    const runData = res.runData[0]
    expect(runData._key).toEqual('r1')
    expect(runData.data.val).toEqual('my run message')

    const tcData = res.tcData[0]
    // console.log('tcData', tcData)
    expect(tcData._key).toEqual('tc1')
    expect(tcData.meta.tc.name).toEqual('my test case')
    expect(tcData.data.val).toEqual('my tc message')

    const stepData = res.stepData[0]
    // console.log('tcData', tcData)
    expect(stepData._key).toEqual('step1')
    expect(stepData.meta.tc.name).toEqual('my test case')
    expect(stepData.meta.step.name).toEqual('my step')
    expect(stepData.data.val).toEqual('my step message')

    done()
  },
  TIMEOUT
)

test(
  'Step: create two entries',
  async done => {
    logAdapter.reset()
    await clearDatabaseArangoDb(logAdapter.db)

    await logAdapter.log(getRunLog())
    await logAdapter.log(getTcLog())
    await logAdapter.log(getStepLog())
    await logAdapter.log(getStepLog({ message: 'my step message 1' }))
    await logAdapter.log(getStepLog({ message: 'my step message 2' }))

    const res = await retrieveData(logAdapter.db)

    // we expect that there is only one record
    expect(res.runData.length).toBe(1)
    expect(res.runLogData.length).toBe(1)
    expect(res.tcData.length).toBe(1)
    expect(res.tcLogData.length).toBe(1)
    expect(res.stepData.length).toBe(1)
    expect(res.stepLogData.length).toBe(3)

    const runData = res.runData[0]
    expect(runData._key).toEqual('r1')
    expect(runData.data.val).toEqual('my run message')

    const tcData = res.tcData[0]
    // console.log('tcData', tcData)
    expect(tcData._key).toEqual('tc1')
    expect(tcData.meta.tc.name).toEqual('my test case')
    expect(tcData.data.val).toEqual('my tc message')

    const stepData = res.stepData[0]
    // console.log('tcData', tcData)
    expect(stepData._key).toEqual('step1')
    expect(stepData.meta.tc.name).toEqual('my test case')
    expect(stepData.meta.step.name).toEqual('my step')
    expect(stepData.data.val).toEqual('my step message')

    const stepData1 = res.stepLogData[1]
    // console.log('tcData1', tcData1)
    expect(stepData.meta.tc.name).toEqual('my test case')
    expect(stepData1.meta.step.name).toEqual('my step')
    expect(stepData1.data.val).toEqual('my step message 1')

    const stepData2 = res.stepLogData[2]
    // console.log('tcData1', tcData1)
    expect(stepData.meta.tc.name).toEqual('my test case')
    expect(stepData2.meta.step.name).toEqual('my step')
    expect(stepData2.data.val).toEqual('my step message 2')

    done()
  },
  TIMEOUT
)

test(
  'Step: simulate single step',
  async done => {
    logAdapter.reset()
    await clearDatabaseArangoDb(logAdapter.db)

    await logAdapter.log(getRunLog())
    await logAdapter.log(getTcLog())
    await logAdapter.log(getTcLog({ tcId: 'tc2' }))
    await logAdapter.log(getStepLog({ tcId: 'tc1' }))
    await logAdapter.log(getStepLog({ tcId: 'tc2' }))

    const res = await retrieveData(logAdapter.db)
    // console.log('res', res)

    // we expect that there is only one record
    expect(res.runData.length).toBe(1)
    expect(res.runLogData.length).toBe(1)
    expect(res.tcData.length).toBe(2)
    expect(res.tcLogData.length).toBe(2)
    expect(res.stepData.length).toBe(1)
    expect(res.stepLogData.length).toBe(1)

    const runData = res.runData[0]
    expect(runData._key).toEqual('r1')
    expect(runData.data.val).toEqual('my run message')

    const tcData = res.tcData[0]
    const tcData1 = res.tcData[1]

    expect(tcData.meta.tc.name).toEqual('my test case')
    expect(tcData.data.val).toEqual('my tc message')

    expect(tcData1.meta.tc.name).toEqual('my test case')
    expect(tcData1.data.val).toEqual('my tc message')

    if (tcData._key === 'tc1') {
      expect(tcData1._key).toEqual('tc2')
    } else {
      expect(tcData1._key).toEqual('tc1')
      expect(tcData._key).toEqual('tc2')
    }

    const stepData = res.stepData[0]
    // console.log('tcData', tcData)
    expect(stepData._key).toEqual('step1')
    expect(stepData.meta.tc.name).toEqual('my test case')
    expect(stepData.meta.step.name).toEqual('my step')
    expect(stepData.data.val).toEqual('my step message')

    done()
  },
  TIMEOUT
)

/**
 * Creates a run log message
 * @param runId {string} The run id.
 * @param message {string} The message for the log
 */
function getRunLog(opts = {}) {
  const options = {
    runId: 'r1',
    message: 'my run message',
    ...opts,
  }
  return {
    meta: {
      run: {
        id: options.runId,
      },
    },
    data: {
      val: options.message,
    },
    logLevel: 'error',
  }
}

/**
 * Creates a test case log message
 * @param runId {string} The run id.
 * @param tcId {string} The test case id.
 * @param message {string} The message for the log
 * @param tcName {string} The name of the test case
 */
function getTcLog(opts = {}) {
  const options = {
    runId: 'r1',
    tcId: 'tc1',
    message: 'my tc message',
    tcName: 'my test case',
    ...opts,
  }
  return {
    meta: {
      run: {
        id: options.runId,
      },
      tc: {
        id: options.tcId,
        name: options.tcName,
      },
    },
    data: {
      val: options.message,
    },
    logLevel: 'error',
  }
}

/**
 * Creates a test case log message
 * @param runId {string} The run id.
 * @param tcId {string} The test case id.
 * @param stepId {string} The step id.
 * @param message {string} The message for the log
 * @param tcName {string} The name of the test case
 * @param stepName {string} The name of the step
 * @param stepType {string} The type of the step {single|normal}
 */
function getStepLog(opts = {}) {
  const options = {
    runId: 'r1',
    tcId: 'tc1',
    stepId: 'step1',
    message: 'my step message',
    tcName: 'my test case',
    stepName: 'my step',
    stepType: 'normal',
    currentStepCount: 1,
    ...opts,
  }
  return {
    meta: {
      run: {
        id: options.runId,
      },
      tc: {
        id: options.tcId,
        name: options.tcName,
      },

      step: {
        id: options.stepId,
        name: options.stepName,
        countCurrent: options.currentStepCount,
      },
    },
    data: {
      val: options.message,
    },
    logLevel: 'error',
  }
}

/*
 *     const logMessage = {
 *       meta:{
 *         run:{
 *           start: <time>,
 *           id: 'id'
 *         },
 *         tc:{
 *           id: 'id',
 *           name: 'great tc name'
 *         },
 *         step:{
 *           id: 'id',
 *           name: 'great step name'
 *           typ: ('singel'| ''|)
 *         }
 *       }
 *       data:{},
 *       logLevel: LEVEL_INFO
 *     }
 */
