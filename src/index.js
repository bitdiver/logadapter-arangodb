import { LogAdapterArangodb } from './LogAdapterArangodb'

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

export { getLogAdapter, LogAdapterArangodb }
