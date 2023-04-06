// libraries
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

// local
const { BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db.js');
const { ExpressError, BadRequestError, DuplicateUsernameError, DuplicateEmailError, BadUsernameError, BadEmailError, BadPasswordError } = require('../expressError.js');
const User = require('./User.js');


const testUserHash = {
  username: "mrtest",
  email: "testuser@test.com",
  password: "testpassword"
}

// clear testUser before every test
beforeEach(async () => {
  await db.query(`DELETE FROM users WHERE username=$1`, [testUserHash.username]);
  await db.query(`DELETE FROM users WHERE email=$1`, [testUserHash.email]);
})

afterAll(async () => {
  await db.end();
})



describe("createUser creates a user successfully", function() {

  test("Successfully creates and returns a valid user", async function() {
    const { username, email, password } = testUserHash;
    const createQueryResults = await User.createUser(username, email, password);
    expect(createQueryResults.username).toBe(username);
    expect(createQueryResults.email).toBe(email);
    expect(createQueryResults).toHaveProperty('id');
    expect(createQueryResults).not.toHaveProperty('password');
    expect(createQueryResults).not.toHaveProperty('hashed_password');
    
  })



})