// libraries
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

// local
const { BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db.js');
const { ExpressError, DuplicateUsernameError, DuplicateEmailError } = require('../expressError.js')


/** 
 * A method to create a user, and on success, return it
 * @param {String} username
 * @param {String} email
 * @param {String} password
 * @returns {Object}
 */
const createUser = async (username, email, password) => {
  try {
    const id = uuid();
    const hashed_password = bcrypt.hashSync(password, BCRYPT_WORK_FACTOR);
    const insertQuery = await db.query(`INSERT INTO users 
      (id, username, email, hashed_password) 
      VALUES($1, $2, $3, $4)
      RETURNING id, username, email, hashed_password;`, 
      [id, username, email, hashed_password]);
    return insertQuery.rows[0];
  } catch(err) {
    console.log(err.detail);
    if (err.detail === `Key (username)=(${username}) already exists.`) {
      throw new DuplicateUsernameError();
    } 
    else if (err.detail === `Key (email)=(${email}) already exists.`) {
      throw new DuplicateEmailError();
    }
    else throw new ExpressError(message=err.detail);
  }
  
}
module.exports.createUser = createUser;