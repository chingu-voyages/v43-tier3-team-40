const dotenv = require('dotenv');
const { Client } = require('pg');
const { DATABASE_URI } = require('./config.js');

/**
 * Customize the client for connection,
 * establish the connection and export
 */


// configure dotenv
dotenv.config({
  path: './.env'
})


// create config object for client construction
const clientConfig = { connectionString: DATABASE_URI}

// this line may be necessary on deployment
if (process.env.MODE === "production") {
  clientConfig.ssl = false;
}

// construction of client
const db = new Client(clientConfig);



db.connect();

// Confirm when connected
db.on('connect', () => {
  console.log(`Connected to: ${db.database}`)
})

// Print error when encountered
db.on('error', () => {
  console.log(err);
})

module.exports = db;