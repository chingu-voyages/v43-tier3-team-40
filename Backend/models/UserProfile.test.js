// libraries
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

// local
const { BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db.js');
const { ExpressError, BadRequestError, DuplicateUsernameError, DuplicateEmailError, BadUsernameError, BadEmailError, BadPasswordError, InvalidUserError } = require('../expressError.js');
const User = require('./User.js');
const UserProfile = require('./UserProfile');


const testUserHash = {
  username: "mrtest",
  email: "testuser@test.com",
  password: "testpassword"
}

let testUser; // Instantiating globally, populated in beforeAll callback

beforeAll(async () => {
  await db.query(`DELETE FROM users WHERE username=$1`, [testUserHash.username]);
  const {username, email, password } = testUserHash;
  testUser = await User.createUser(username, email, password);
})


afterAll(async () => {
  await db.end();
})


describe("Successfully retrieves User profile with UserProfile.getUserProfileByUserId", function(){

  test("Gets user profile when profile is blank", async function() {
    const profile = await UserProfile.getUserProfileByUserId(testUser.id);
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('user_id', testUser.id);
    expect(profile).toHaveProperty('avatar', null);
    expect(profile).toHaveProperty('height', null);
    expect(profile).toHaveProperty('weight', null);
    expect(profile).toHaveProperty('age', null);
  })

  test("Gets updated user profile after manual edits", async function() {
    // manual query for update
    await db.query(`UPDATE user_profiles 
      SET avatar='https://www.postgresql.org/favicon.ico', 
        height=150,
        weight=300,
        age=97
      WHERE
        user_id=$1;`,
    [testUser.id])

    const profile = await UserProfile.getUserProfileByUserId(testUser.id);
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('user_id', testUser.id);
    expect(profile).toHaveProperty('avatar', 'https://www.postgresql.org/favicon.ico');
    expect(profile).toHaveProperty('height', 150);
    expect(profile).toHaveProperty('weight', 300);
    expect(profile).toHaveProperty('age', 97);
  })

  test("Throws InvalidUserError when no user", async function(){
    const badPromise = UserProfile.getUserProfileByUserId("gibberish-id");
    await expect(badPromise).rejects.toThrow(InvalidUserError);
  })

})


describe("Successfully edits user profile using UserProfile.editUserProfile", function() {

  test("successfully edits user profile", async function() {
    const profile = await UserProfile.editUserProfile({
      avatar: 'https://www.chingu.io/favicon.ico',
      height: 42,
      weight: 165,
      age: 100
    }, testUser.id);
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('user_id', testUser.id);
    expect(profile).toHaveProperty('avatar', 'https://www.chingu.io/favicon.ico');
    expect(profile).toHaveProperty('height', 42);
    expect(profile).toHaveProperty('weight', 165);
    expect(profile).toHaveProperty('age', 100);
  })


  test("successfully edits user profile filtering out bad keys", async function() {
    const profile = await UserProfile.editUserProfile({
      avatar: 'https://www.chingu.io/favicon.ico',
      height: 50,
      weight: 15,
      waist_size: 20
    }, testUser.id);
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('user_id', testUser.id);
    expect(profile).toHaveProperty('avatar', 'https://www.chingu.io/favicon.ico');
    expect(profile).toHaveProperty('height', 50);
    expect(profile).toHaveProperty('weight', 15);
    expect(profile).not.toHaveProperty('waist_size')
  })


  test("successfully edits ignoring keys with null values", async function() {
    const origProfile = await UserProfile.getUserProfileByUserId(testUser.id);
    // change only weight
    const profile = await UserProfile.editUserProfile({
      avatar: null,
      height: null,
      weight: origProfile.weight+50,
      waist_size: null,
      age: null
    }, testUser.id);
    expect(profile).toHaveProperty('id', origProfile.id);
    expect(profile).toHaveProperty('user_id', testUser.id);
    expect(profile).toHaveProperty('avatar', origProfile.avatar);
    expect(profile).toHaveProperty('height', origProfile.height);
    expect(profile).toHaveProperty('weight', origProfile.weight+50);
    expect(profile).toHaveProperty('age', origProfile.age);
  })


  test("Throws InvalidUserError when no user", async function(){
    const badPromise = UserProfile.editUserProfile({weight: 125}, "gibberish-id")
    await expect(badPromise).rejects.toThrow(InvalidUserError);
  })

  
  test("Throws BadRequestError on bad input", async function() {
    const badPromise = UserProfile.editUserProfile({weight: "one hundred"}, testUser.id)
    await expect(badPromise).rejects.toThrow(BadRequestError);
  })

})