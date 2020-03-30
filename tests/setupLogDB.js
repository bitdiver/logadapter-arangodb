const Database = require('arangojs')

/**
 * Creates the log database if not exists.
 * also creates the user
 */

const arangoSystem = {
  scheme: 'http',
  hostname: 'localhost',
  port: 8529,
  database: '_system',
  username: 'root',
  password: 'root',
}
const arangoLog = {
  database: 'log',
  username: 'log',
  password: 'log',
}

const url = `${arangoSystem.scheme}://${arangoSystem.hostname}:${arangoSystem.port}`
// eslint-disable-next-line no-console
console.log(`Connect to '${url}'`)

const db = new Database({ url })
db.useDatabase(arangoSystem.database)
db.useBasicAuth(arangoSystem.username, arangoSystem.password)

db.createDatabase(arangoLog.database, [
  {
    username: arangoLog.username,
    passwd: arangoLog.password,
    active: true,
  },
])
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Log DB created')

    return db.route().request({
      path: `/_api/user/${arangoLog.username}/database/${arangoLog.database}`,
      method: 'PUT',
      body: { grant: 'rw' },
    })
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('User rights setup')
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err)
  })
