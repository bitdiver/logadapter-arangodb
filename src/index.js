import { LogAdapterArangodb } from './LogAdapterArangodb'
import { clearDatabase } from './helper'

// Stores the logger instance
let logAdapter

/**
 * returns the logAdapter
 */
function getLogAdapter(opts) {
  if (logAdapter === undefined) {
    logAdapter = new LogAdapterArangodb(opts)
  }
  return logAdapter
}

export { getLogAdapter, LogAdapterArangodb, clearDatabase }
