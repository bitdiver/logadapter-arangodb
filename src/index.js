import { LogAdapterArangodb } from './LogAdapterArangodb'
import { clearDatabaseArangoDb } from './helper'

// Stores the logger instance
let logAdapter

/**
 * returns the logAdapter
 */
function getLogAdapterArangodb(opts) {
  if (logAdapter === undefined) {
    logAdapter = new LogAdapterArangodb(opts)
  }
  return logAdapter
}

export { getLogAdapterArangodb, LogAdapterArangodb, clearDatabaseArangoDb }
