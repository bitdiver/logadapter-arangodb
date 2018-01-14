import assert from 'assert'

/**
 * Defines all the collections neeeded for the logger
 */
export const COLLECTIONS = [
  { name: 'run', type: 'Document' },
  { name: 'runLog', type: 'Document' },
  { name: 'testcase', type: 'Document' },
  { name: 'testcaseLog', type: 'Document' },
  { name: 'step', type: 'Document' },
  { name: 'stepLog', type: 'Document' },

  { name: 'runHasLog', type: 'Edge' },
  { name: 'runHasTestcase', type: 'Edge' },
  { name: 'testcaseHasLog', type: 'Edge' },
  { name: 'testcaseHasStep', type: 'Edge' },
  { name: 'stepHasLog', type: 'Edge' },
]

/**
 * Setup the arangoDB as needed.
 * Creates all the required collections
 * @param arangoDb {object} The connection to the ArangoDB
 * @param collectionOptions {object} Common options for creating the collections
 */
export async function setupArango(arangoDb, collectionOptions = {}) {
  assert.ok(arangoDb, 'No database given')
  for (const definition of COLLECTIONS) {
    // eslint-disable-next-line no-console
    console.log(`Check collection '${definition.name}'`)

    let dbCollection
    if (definition.type === 'Edge') {
      dbCollection = arangoDb.edgeCollection(definition.name)
    } else {
      dbCollection = arangoDb.collection(definition.name)
    }

    try {
      // try to get details for this collection
      await dbCollection.get()
    } catch (err) {
      if (err.errorNum === 1203) {
        // The collection does not exists
        // eslint-disable-next-line no-console
        console.log(`    Create collection '${definition.name}'`)
        try {
          await dbCollection.create({
            waitForSync: true, // always sync document changes to disk
            type: definition.type,
            name: definition.name,
            ...collectionOptions,
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ERROR creating the collection: ', e)
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('ERROR checking the collection: ', err)
      }
    }
  }
}

/**
 * This function will clear all the collections.
 * This is only usefull in testing environments to test the logger.
 * @param arangoDb {object} The connection to the ArangoDB
 */
export async function clearDatabase(arangoDb) {
  assert.ok(arangoDb, 'No database given')
  for (const definition of COLLECTIONS) {
    const collection = arangoDb.collection(definition.name)
    await collection.truncate()
  }
}
