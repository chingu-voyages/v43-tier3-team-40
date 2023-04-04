const dotenv = require("dotenv")


/**
 * Set up constants for export to be used across the app, all 
 * a function of whether the app is in test mode or in production:
 * SECRET_KEY, a secret string to be used to sign and verify JWT
 * BCRYPT_WORK_FACTOR, number (1 or 12) to be used to generate
 * the correct number of rounds for bcrypt to use in generating a salt
 * DATABASE_URI, a string that points at the production or 
 * test version of the database to connect to
 */

// configure dotenv
dotenv.config({
  path: './.env'
});

const configObj = {
  SECRET_KEY: undefined,
  BCRYPT_WORK_FACTOR: undefined,
  DATABASE_URI: undefined
}

// default secret key
configObj.SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

// correctly set BCRYPT_WORK_FACTOR & DATABASE_URI for export, defaulting to test mode
if (process.env.MODE === "production") {
  configObj.BCRYPT_WORK_FACTOR = 12;
  configObj.DATABASE_URI = "bodybalance"
} else {
  configObj.BCRYPT_WORK_FACTOR = 1;
  configObj.DATABASE_URI = "bodybalance_test"
}



// assigning to individual constants for export 
const { SECRET_KEY, BCRYPT_WORK_FACTOR, DATABASE_URI } = configObj;

module.exports = {
  SECRET_KEY, 
  BCRYPT_WORK_FACTOR, 
  DATABASE_URI
}