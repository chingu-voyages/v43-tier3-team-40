// libraries
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

// local
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db.js');
const { ExpressError, BadRequestError, DuplicateUsernameError, DuplicateEmailError, BadUsernameError, BadEmailError, BadPasswordError, InvalidTokenError, UnauthorizedError, InvalidUserError, BadLoginError } = require('../expressError.js')


/** 
 * A method to create a user, and on success, return it *without* the
 * hashed password
 * @param {String} username
 * @param {String} email
 * @param {String} password
 * @returns {Object}
 */
const createUser = async (username, email, password) => {
  try {

    // check password
    if (password.length < 6) throw new BadPasswordError();

    // create id and hashed_password for table
    const id = uuid();
    const hashed_password = bcrypt.hashSync(password, BCRYPT_WORK_FACTOR);

    // PostgreSQL query
    const insertQuery = await db.query(`INSERT INTO users 
      (id, username, email, hashed_password) 
      VALUES($1, $2, $3, $4)
      RETURNING id, username, email;`, 
      [id, username, email, hashed_password]);
    return insertQuery.rows[0];

  } catch(err) {

    // console.log(err);
    
    // Pass along any error we've thrown higher up
    if (err instanceof ExpressError) throw err;

    else if (err.message === 'new row for relation "users" violates check constraint "email_address"' ||
      err.message === 'new row for relation "users" violates check constraint "email_length"'
    ) {
      throw new BadEmailError();
    }

    else if (err.message === 'new row for relation "users" violates check constraint "username_length"' ||
      err.message === 'new row for relation "users" violates check constraint "username_chars"'
    ) {
      throw new BadUsernameError();
    }
    
    else if (err.detail === `Key (username)=(${username}) already exists.`) {
      throw new DuplicateUsernameError();
    } 
    
    else if (err.detail === `Key (email)=(${email}) already exists.`) {
      throw new DuplicateEmailError();
    }
    
    // else throw new BadRequestError(message=err.message);
    else throw err;
  }
  
}
module.exports.createUser = createUser;




const getUserById = async (id) => {
  try {
    const searchQuery = await db.query(
      `SELECT id, username, email FROM users WHERE id=$1;`, 
      [id]
    );
    if (searchQuery.rows.length !== 1) {
      throw new InvalidUserError();
    } else return searchQuery.rows[0];
  } catch(err) {
    throw err;
  }
}
module.exports.getUserById = getUserById;



const getUserByUsername = async (username) => {
  try {
    const searchQuery = await db.query(
      `SELECT id, username, email FROM users WHERE username=$1;`, 
      [username]
    );
    if (searchQuery.rows.length !== 1) {
      throw new InvalidUserError();
    } else return searchQuery.rows[0];
  } catch(err) {
    throw err;
  }
}
module.exports.getUserByUsername = getUserByUsername;



const checkToken = async (token) => {
  try {
    // will throw "Uncaught JsonWebTokenError: invalid signature" on failure

    const {username, id} = jwt.verify(token, SECRET_KEY);

    const user = await getUserById(id);

    if (user.username !== username) throw new InvalidTokenError();

    else return user;

  } catch(err) {
    console.log(err);
    if (err.message === "Uncaught JsonWebTokenError: invalid signature") {
      throw new InvalidTokenError();
    } else throw new UnauthorizedError(message=err.message);
  }
}
module.exports.checkToken = checkToken;




const login = async (username, password) => {
  try {
    const searchQuery = await db.query(
      `SELECT id, username, email, hashed_password FROM users WHERE username=$1;`, 
      [username]
    );
    
    let user;
    
    if (searchQuery.rows.length !== 1) {
      throw new InvalidUserError();
    } else user = searchQuery.rows[0];

    if (bcrypt.compareSync(password, user.hashed_password)) {
      // sanitize user of hashed_password
      delete user.hashed_password;
      return user;
    } else {
      throw new BadLoginError();
    }

  } catch(err) {
    throw err;
  }
}
module.exports.login = login;