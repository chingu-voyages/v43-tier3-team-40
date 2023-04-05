const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const { BCRYPT_WORK_FACTOR } = require('../config');


const createUser = async (username, email, password) => {
  // stub
  const id = uuid();
  const hashed_password = bcrypt.hashSync(password, BCRYPT_WORK_FACTOR);
}