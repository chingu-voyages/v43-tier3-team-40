
const db = require('../db');
const User = require('./User');
const Day = require('./Day');
const Sleep = require('./Sleep');
const { UnauthorizedError, NotFoundError, BadDateError } = require('../expressError');


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

  test("testUser1 can add a sleep to a given day", async () => {
    day = await Day.addDay(new Date("2023-04-02T08:00:00.000Z"), testUser1.id);
    const sleep = await Sleep.addSleep({
      day_id: day.id,
      success_rating: 6
    }, testUser1.id);
    expect(sleep).toHaveProperty('id');
    expect(sleep).toHaveProperty('day_id', day.id);
    expect(sleep).toHaveProperty('start_time', null);
    expect(sleep).toHaveProperty('end_time', null);
    expect(sleep).toHaveProperty('success_rating', 6);
  });

  test("testUser2 can add a sleep to a given day", async () => {
    day = await Day.addDay(new Date("2023-04-02T08:00:00.000Z"), testUser2.id);
    const sleep = await Sleep.addSleep({
      day_id: day.id,
      start_time: new Date("2023-04-02T22:00:00.000Z"),
      end_time: new Date("2023-04-03T06:00:00.000Z"),
      success_rating: 6
    }, testUser2.id);
    expect(sleep).toHaveProperty('id');
    expect(sleep).toHaveProperty('day_id', day.id);
    expect(sleep).toHaveProperty('start_time', new Date("2023-04-02T22:00:00.000Z"));
    expect(sleep).toHaveProperty('end_time', new Date("2023-04-03T06:00:00.000Z"));
    expect(sleep).toHaveProperty('success_rating', 6);
  })

  test("throws UnauthorizedError when sleep added to day not belonging to user", async () => {
    await (expect(Sleep.addSleep({
      day_id: 9999999,
      success_rating: 6
    }, testUser1.id))).rejects.toThrow(UnauthorizedError);
  })


  test("Successfully creates day from start_time", async () => {
    const sleep = await Sleep.addSleep({
      start_time: new Date("2023-04-03T23:00:00.000Z")
    }, testUser3.id);

    const day = await Day.getDay(new Date("2023-04-03T23:00:00.000Z"), testUser3.id);

    expect(day).toHaveProperty('user_id', testUser3.id)
    expect(day).toHaveProperty('date', new Date('4-3-2023'))

    expect(sleep).toHaveProperty('id');
    expect(sleep).toHaveProperty('day_id', day.id);
    expect(sleep).toHaveProperty('start_time', new Date("2023-04-03T23:00:00.000Z"));
    expect(sleep).toHaveProperty('end_time', null);
    expect(sleep).toHaveProperty('success_rating', null);
  })


  test("Throws BadDateError when no day_id or start_time", async () => {
    await (expect(Sleep.addSleep({
      end_time: new Date("2023-04-03T23:00:00.000Z"),
      success_rating: 10
    }, testUser3.id))).rejects.toThrow(BadDateError);
  })

});



describe("Successfully deletes Sleep with deleteSleep", function() {

})





describe("Successfully retrieves multiple sleeps according to search paramters with getSleeps", function() {});



describe("Successfully edits sleep with editSleep", function() {});




