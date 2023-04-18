
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

  test("Successfully deletes a sleep", async () => {
    const sleep = await Sleep.addSleep({
      start_time: new Date("2023-04-02T22:00:00.000Z"),
      end_time: new Date("2023-04-03T06:00:00.000Z"),
      success_rating: 6
    }, testUser3.id);
    const ds = await Sleep.deleteSleep(sleep.id, testUser3.id);
    expect(ds).toEqual(sleep);

    const deletedSleep = (await db.query(`SELECT * FROM sleeps WHERE id = $1;`, [sleep.id])).rows;
    expect(deletedSleep.length).toBe(0);
  })

  test("Throws a NotFoundError on non-existent sleep", async () => {
    await (expect(Sleep.deleteSleep(999999999, testUser3)).rejects.toThrow(NotFoundError));
  })

  test("Throws a NotFoundError on a different user's sleep", async () => {
    // first_sleep belongs to testUser1
    await (expect(Sleep.deleteSleep(first_sleep.id, testUser3)).rejects.toThrow(NotFoundError));
  })
})





describe("Successfully retrieves multiple sleeps according to search paramters with getSleeps", function() {

  function checkSleep(sleep, id, day_id, start_time, end_time, success_rating, user_id) {
    if (id === undefined) {
      expect(sleep).toHaveProperty('id');
    } else expect(sleep).toHaveProperty('id', id);

    if (day_id === undefined) {
      expect(sleep).toHaveProperty('day_id');
    } else expect(sleep).toHaveProperty('day_id', day_id);

    if (start_time === undefined) {
      expect(sleep).toHaveProperty('start_time');
    } else expect(sleep).toHaveProperty('start_time', start_time);

    if (end_time === undefined) {
      expect(sleep).toHaveProperty('end_time');
    } else expect(sleep).toHaveProperty('end_time', end_time);

    if (success_rating === undefined) {
      expect(sleep).toHaveProperty('success_rating');
    } else expect(sleep).toHaveProperty('success_rating', success_rating);

    if (user_id === undefined) {
      expect(sleep).toHaveProperty('user_id');
    } else expect(sleep).toHaveProperty('user_id', user_id);
  }

  // delete users and rebuild documents
  beforeAll(async () => {
    await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`);
    testUser1 = await User.createUser('testUser1', 'testUser1@email.com', 'password123');
    testUser2 = await User.createUser('testUser2', 'testUser2@email.com', 'password123');
    testUser3 = await User.createUser('testUser3', 'testUser3@email.com', 'password123');

    testUser1Sleeps = [
      {start_time: new Date("2023-2-27 21:00"), end_time: new Date("2023-2-28 7:00"), success_rating: 5},
      {start_time: new Date("2023-2-28 21:00"), end_time: new Date("2023-3-1 7:00"), success_rating: 5},
      {start_time: new Date("2023-3-1 21:00"), end_time: new Date("2023-3-2 7:00"), success_rating: 7},
      {start_time: new Date("2023-3-2 21:00"), end_time: new Date("2023-3-3 7:00"), success_rating: 8},
      {start_time: new Date("2023-3-3 21:00"), end_time: new Date("2023-3-4 7:00"), success_rating: 3}
    ]

    await Sleep.addSleep(testUser1Sleeps[0], testUser1.id);
    await Sleep.addSleep(testUser1Sleeps[1], testUser1.id);
    await Sleep.addSleep(testUser1Sleeps[2], testUser1.id);
    await Sleep.addSleep(testUser1Sleeps[3], testUser1.id);
    await Sleep.addSleep(testUser1Sleeps[4], testUser1.id);

    await Sleep.addSleep({start_time: new Date("2023-3-1 23:00"), end_time: new Date("2023-3-2 9:00"), success_rating: 5}, testUser2.id);
    await Sleep.addSleep({start_time: new Date("2023-3-2 23:00"), end_time: new Date("2023-3-3 9:00"), success_rating: 5}, testUser2.id);
    await Sleep.addSleep({start_time: new Date("2023-3-3 23:00"), end_time: new Date("2023-3-4 9:00"), success_rating: 5}, testUser2.id);
    await Sleep.addSleep({start_time: new Date("2023-3-4 23:00"), end_time: new Date("2023-3-5 9:00"), success_rating: 5}, testUser2.id);
    await Sleep.addSleep({start_time: new Date("2023-3-5 23:00"), end_time: new Date("2023-3-6 9:00"), success_rating: 5}, testUser2.id);

    await Sleep.addSleep({start_time: new Date("2023-3-3 20:30"), end_time: new Date("2023-3-4 5:30"), success_rating: 5}, testUser3.id);
    await Sleep.addSleep({start_time: new Date("2023-3-4 20:30"), end_time: new Date("2023-3-5 5:30"), success_rating: 5}, testUser3.id);
    await Sleep.addSleep({start_time: new Date("2023-3-5 20:30"), end_time: new Date("2023-3-6 5:30"), success_rating: 5}, testUser3.id);
    await Sleep.addSleep({start_time: new Date("2023-3-6 20:30"), end_time: new Date("2023-3-7 5:30"), success_rating: 5}, testUser3.id);
    await Sleep.addSleep({start_time: new Date("2023-3-7 15:00"), end_time: new Date("2023-3-8 15:30"), success_rating: 5}, testUser3.id);
    await Sleep.addSleep({start_time: new Date("2023-3-7 20:30"), end_time: new Date("2023-3-8 5:30"), success_rating: 5}, testUser3.id);



  })


  test("Gets all sleeps for testUser1", async () => {
    const sleeps = await Sleep.getSleeps([], testUser1.id);
    expect(sleeps.length).toBe(5);
    checkSleep(sleeps[0], undefined, undefined, testUser1Sleeps[0].start_time, testUser1Sleeps[0].end_time, testUser1Sleeps[0].success_rating, testUser1.id);
    checkSleep(sleeps[1], undefined, undefined, testUser1Sleeps[1].start_time, testUser1Sleeps[1].end_time, testUser1Sleeps[1].success_rating, testUser1.id);
    checkSleep(sleeps[2], undefined, undefined, testUser1Sleeps[2].start_time, testUser1Sleeps[2].end_time, testUser1Sleeps[2].success_rating, testUser1.id);
    checkSleep(sleeps[3], undefined, undefined, testUser1Sleeps[3].start_time, testUser1Sleeps[3].end_time, testUser1Sleeps[3].success_rating, testUser1.id);
    checkSleep(sleeps[4], undefined, undefined, testUser1Sleeps[4].start_time, testUser1Sleeps[4].end_time, testUser1Sleeps[4].success_rating, testUser1.id);
    
    // expect(sleeps[0]).toHaveProperty('id')
    // expect(sleeps[0]).toHaveProperty('day_id')
    // expect(sleeps[0]).toHaveProperty('start_time', new Date("2023-2-27 21:00"))
    // expect(sleeps[0]).toHaveProperty('end_time', new Date("2023-2-28 7:00"))
    // expect(sleeps[0]).toHaveProperty('success_rating', 5)
    // expect(sleeps[0]).toHaveProperty('user_id', testUser1.id)
    // expect(sleeps[1]).toHaveProperty('id')
    // expect(sleeps[1]).toHaveProperty('day_id')
    // expect(sleeps[1]).toHaveProperty('start_time')
    // expect(sleeps[1]).toHaveProperty('end_time')
    // expect(sleeps[1]).toHaveProperty('success_rating', 5)
    // expect(sleeps[1]).toHaveProperty('user_id', testUser1.id)
    // expect(sleeps[2]).toHaveProperty('id')
    // expect(sleeps[2]).toHaveProperty('day_id')
    // expect(sleeps[2]).toHaveProperty('start_time')
    // expect(sleeps[2]).toHaveProperty('end_time')
    // expect(sleeps[2]).toHaveProperty('success_rating', 7)
    // expect(sleeps[2]).toHaveProperty('user_id', testUser1.id)
    // expect(sleeps[3]).toHaveProperty('id')
    // expect(sleeps[3]).toHaveProperty('day_id')
    // expect(sleeps[3]).toHaveProperty('start_time')
    // expect(sleeps[3]).toHaveProperty('end_time')
    // expect(sleeps[3]).toHaveProperty('success_rating', 8)
    // expect(sleeps[3]).toHaveProperty('user_id', testUser1.id)
    // expect(sleeps[4]).toHaveProperty('id')
    // expect(sleeps[4]).toHaveProperty('day_id')
    // expect(sleeps[4]).toHaveProperty('start_time')
    // expect(sleeps[4]).toHaveProperty('end_time')
    // expect(sleeps[4]).toHaveProperty('success_rating', 3)
    // expect(sleeps[4]).toHaveProperty('user_id', testUser1.id)
  })

  test("", async () => {

  })

});



describe("Successfully edits sleep with editSleep", function() {});




