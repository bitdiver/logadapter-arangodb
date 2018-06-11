'use strict'

import assert from 'assert'
import { Database } from 'arangojs'
import { LogAdapter } from '@bitdiver/model'
import { setupArango } from './helper'

export class LogAdapterArangodb extends LogAdapter {
  constructor(opts = {}) {
    super()

    const scheme = opts.scheme || 'http'
    const host = opts.hostname || 'localhost'
    const port = opts.port || 8529
    const database = opts.database || 'log'
    const username = opts.username || 'log'
    const password = opts.password || 'log'

    const url = `${scheme}://${host}:${port}`

    this.db = new Database({ url })
    this.db.useDatabase(database)
    this.db.useBasicAuth(username, password)

    // eslint-disable-next-line no-console
    console.info(`Database connection: ${scheme}://${host}:${port}`)

    // The database Id of the run
    this.runKey = undefined

    // stores all the id of the testcases
    this.testcaseSet = new Set()

    // stores all the id of the steps
    this.stepSet = new Set()
  }

  /**
   * This method will be called each time the runner
   * starts a new run
   */
  reset() {
    this.runKey = undefined
    this.testcaseSet = new Set()
    this.stepSet = new Set()
  }

  /**
   * Ensures that all the collections exists in the database
   * @param opts {object} Common options for creating the collections
   */
  async initDb(opts) {
    return setupArango(this.db, opts)
  }

  async _logRun(meta, data) {
    assert.ok(meta, `No 'meta' Object given to the log method`)
    assert.ok(data, `No 'data' Object given to the log method`)
    const key = meta.run.id

    if (this.runKey === undefined) {
      // This is the first log for this run
      this.runKey = key
      const runCollection = this.db.collection('run')
      await runCollection.save({ _key: key, meta, data })
    }
    // this is an additional log for this run
    const collection = this.db.collection('runLog')
    const rec = await collection.save({ meta, data })

    const edgeCollection = this.db.collection('runHasLog')
    await edgeCollection.save({
      _from: `run/${key}`,
      _to: rec._id,
    })
  }

  async _logTestcase(meta, data) {
    assert.ok(meta, `No 'meta' Object given to the log method`)
    assert.ok(data, `No 'data' Object given to the log method`)

    const runKey = meta.run.id
    const tcKey = meta.tc.id

    if (!this.testcaseSet.has(tcKey)) {
      // There is no entry for this test case yet
      this.testcaseSet.add(tcKey)
      const collection = this.db.collection('testcase')
      await collection.save({ _key: tcKey, meta, data })

      // add the testcase to the run
      const runHasTestcaseColl = this.db.collection('runHasTestcase')
      await runHasTestcaseColl.save({
        _from: `run/${runKey}`,
        _to: `testcase/${tcKey}`,
      })
    }
    // this is an additional log for this testcase
    const collection = this.db.collection('testcaseLog')
    const rec = await collection.save({ meta, data })

    const edgeCollection = this.db.collection('testcaseHasLog')
    await edgeCollection.save({
      _from: `testcase/${tcKey}`,
      _to: rec._id,
    })
  }

  async _logStep(meta, data) {
    assert.ok(meta, `No 'meta' Object given to the log method`)
    assert.ok(data, `No 'data' Object given to the log method`)

    const tcKey = meta.tc.id
    const stepKey = meta.step.id

    if (!this.stepSet.has(stepKey)) {
      // There is no entry for this test case yet
      this.stepSet.add(stepKey)
      const collection = this.db.collection('step')
      await collection.save({ _key: stepKey, meta, data })

      // add the step to the testcase
      const testcaseHasStepColl = this.db.collection('testcaseHasStep')
      await testcaseHasStepColl.save({
        _from: `testcase/${tcKey}`,
        _to: `step/${stepKey}`,
      })
    }
    // this is an additional log for this step
    const collection = this.db.collection('stepLog')
    const rec = await collection.save({ meta, data })

    const edgeCollection = this.db.collection('stepHasLog')
    await edgeCollection.save({
      _from: `step/${stepKey}`,
      _to: rec._id,
    })
  }
}

// Stores the logger instance
let logAdapter

/**
 * returns the logAdapter
 */
export function getLogAdapter(opts) {
  if (logAdapter === undefined) {
    logAdapter = new LogAdapterArangodb(opts)
  }
  return logAdapter
}
