
const db = require('../db');
const User = require('./User');
const Day = require('./Day');
const Sleep = require('./Sleep');
const { UnauthorizedError, NotFoundError } = require('../expressError');


let testUser1;
let testUser2;
let testUser3;
let tu1d1;
let fs_start_time = new Date("2023-04-01 20:00");
let fs_end_time = new Date("2023-04-02 06:00");
let fs_success_rating = 7;

beforeAll(async () => {
  await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`);
  testUser1 = await User.createUser('testUser1', 'testUser1@email.com', 'password123');
  testUser2 = await User.createUser('testUser2', 'testUser2@email.com', 'password123');
  testUser3 = await User.createUser('testUser3', 'testUser3@email.com', 'password123');

  tu1d1 = await Day.addDay(new Date("2023-04-01T08:00:00.000Z"), testUser1.id);

  // first sleep manually inserted
  first_sleep = (await db.query(`INSERT INTO sleeps (day_id, start_time, end_time, success_rating) VALUES ($1, $2, $3, $4) RETURNING *;`, 
  [tu1d1.id, fs_start_time, fs_end_time, fs_success_rating])).rows[0];
})


afterAll(async () => {
  await db.end();
})



describe("Successfully retrieves Sleep with getSleep", function() {

  test("Placeholder", async () => {
    expect(2).toBe(2);
  })


  test("testUser1 retrieves successfully retrieves initial sleep", async () => {
    const sleep = await Sleep.getSleep(first_sleep.id, testUser1.id);
    expect(sleep).toHaveProperty('id');
    expect(sleep).toHaveProperty('day_id', tu1d1.id);
    expect(sleep).toHaveProperty('start_time', fs_start_time);
    expect(sleep).toHaveProperty('end_time', fs_end_time);
    expect(sleep).toHaveProperty('success_rating', fs_success_rating);
  })


  test("Throws NotFoundError when testUser2 tries to retrieve testUser1's sleep", async () => {
    await expect(Sleep.getSleep(first_sleep.id, testUser2.id)).rejects.toThrow(NotFoundError);
  })


  test("Throws NotFoundError when testUser1 tries to retrieve nonexistent sleep", async () => {
    await expect(Sleep.getSleep(99999999, testUser1.id)).rejects.toThrow(NotFoundError);
  })

});



describe("Successfully adds Sleep with addSleep", function() {

});



describe("Successfully deletes Sleep with deleteSleep", function() {

})





describe("Successfully retrieves multiple sleeps according to search paramters with getSleeps", function() {});



describe("Successfully edits sleep with editSleep", function() {});




