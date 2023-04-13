
// local
const Day = require('./Day');
const User = require('./User');
const db = require('../db');
const { InvalidUserError, BadRequestError, NotFoundError } = require('../expressError');


let testUser;

// populate testUser
beforeAll(async function() {
  await db.query(`DELETE FROM users WHERE username='mrtest';`);
  testUser = await User.createUser('mrtest', 'mrtest@aol.com', 'password123');
})

afterAll(async function(){
  await db.end();
})

describe("Successfully adds a day with addDay", function() {
  
  test("Adds a day with a valid user_id", async function() {
    let today = new Date();
    
    let todayDay = new Date();
    todayDay.setHours(0)
    todayDay.setMinutes(0)
    todayDay.setSeconds(0)
    todayDay.setMilliseconds(0);

    const dayPromise = await Day.addDay(today, testUser.id)
    expect(dayPromise).toHaveProperty('id');
    expect(dayPromise).toHaveProperty('date', todayDay);
    expect(dayPromise).toHaveProperty('user_id', testUser.id);
  })

  test("Maintains the day according to the time zone of the date given", async function() {
    let aprilFirst = new Date(2023, 3, 1, 23); // 2023-04-02T06:00:00.000Z
    
    let aprilFirstDay = new Date(2023, 3, 1);

    const dayPromise = await Day.addDay(aprilFirst, testUser.id)
    expect(dayPromise).toHaveProperty('id');
    expect(dayPromise).toHaveProperty('date', aprilFirstDay);
    expect(dayPromise).toHaveProperty('user_id', testUser.id);
  })

  test("Throws an InvalidUserError with an invalid user_id", async function() {
    let aprilSecond = new Date();
    aprilSecond.setMonth(3);
    aprilSecond.setDate(2);

    const badPromise = Day.addDay(aprilSecond, 'baduserid')

    await expect(badPromise).rejects.toThrow(InvalidUserError);
    
  })

  test("Throws a BadRequestError with an invalid date", async function() {

    let badDateStr = 'August 35th'
    let badDate = new Date(badDateStr);
    console.log(badDate.toString())
    console.log(testUser.id);
    console.log(badDate.toString() === "Invalid Date");

    const badDatePromise = Day.addDay(badDateStr, testUser.id);
    await expect(badDatePromise).rejects.toThrow(BadRequestError);
  })
})


describe("Successfully gets a day with getDay", function() {

  test("Successfully retrieves a day", async function() {
    const aprilFifth = new Date(2023, 3, 5);

    const createdDay = await Day.addDay(aprilFifth, testUser.id);
    const retrievedDay = await Day.getDay(aprilFifth, testUser.id);

    for (let [key, val] of Object.entries(retrievedDay)) {
      expect(val).toStrictEqual(createdDay[key]);
    }
  })

  test("Throws a NotFoundError searching for a day that does not exist", async function() {
    const badPromise = Day.getDay(new Date(1970, 0, 15), testUser.id);
    await expect(badPromise).rejects.toThrow(NotFoundError);
  })

  test("Throws a NotFoundError searching for a user that does not exist", async function() {
    // date from prior test, should exist, but cannot refer to variable
    const badPromise = Day.getDay(new Date(2023, 3, 5), 'bad-user-id');
    await expect(badPromise).rejects.toThrow(NotFoundError);
  })
})


describe("Successfully gets a day's details with getFullDay", function() {

  let firstDate;
  let secondDate;
  let secondUser;

  const testUserDay1Activities = [];
  const testUserDay1Meals = [];
  const testUserDay1Sleeps = [];

  const testUserDay2Activities = [];
  const testUserDay2Meals = [];
  const testUserDay2Sleeps = [];

  const secondUserDay1Activities = [];
  const secondUserDay1Meals = [];
  const secondUserDay1Sleeps = [];

  const secondUserDay2Activities = [];
  const secondUserDay2Meals = [];
  const secondUserDay2Sleeps = [];

  beforeAll(async function() {
    await db.query(`DELETE FROM users WHERE username=$1`, ['seconduser'])
    secondUser = await User.createUser('seconduser', 'seconduser@aol.com', 'password123');
    
    firstDate = new Date(2020, 9, 31, 15, 35, 127);
    secondDate = new Date(2021, 10, 27, 13, 541);

    const [testUserDay1, testUserDay2, secondUserDay1, secondUserDay2] = await Promise.all([
      Day.addDay(firstDate, testUser.id),
      Day.addDay(secondDate, testUser.id),
  
      Day.addDay(firstDate, secondUser.id),
      Day.addDay(secondDate, secondUser.id),
    ])



    const [tud1a1, tud1a2, tud2a1, sud1a1, sud2a2, tud1m1, sud1s1] = await Promise.all([

      db.query(`INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, [testUserDay1.id, "jogging", firstDate, new Date(firstDate.valueOf() + (30 * 60 * 1000)), 7, 9]),
      db.query(`INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, [testUserDay1.id, "pushups", new Date(firstDate.valueOf() + (30 * 60 * 1000)), new Date(firstDate.valueOf() + (60 * 60 * 1000)), 9, 6]),
      db.query(`INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, [testUserDay2.id, "jogging", secondDate, new Date(secondDate.valueOf() + (30 * 60 * 1000)), 7, 9]),
      db.query(`INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, [secondUserDay1.id, "jogging", firstDate, new Date(firstDate.valueOf() + (30 * 60 * 1000)), 7, 9]),
      db.query(`INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, [secondUserDay2.id, "jogging", secondDate, new Date(secondDate.valueOf() + (30 * 60 * 1000)), 7, 9]),

      db.query(`INSERT INTO meals (day_id, calories, carbs, protein, fat, dietary_restrictions, time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, [testUserDay1.id, 1000, 200, 200, 10, "lots of broccoli", new Date(firstDate.valueOf() - (120 * 60 * 1000))]),

      db.query(`INSERT INTO sleeps (day_id, start_time, end_time, success_rating) VALUES ($1, $2, $3, $4) RETURNING *;`, [secondUserDay1.id, new Date(firstDate.valueOf() + (180 * 60 * 1000)), new Date(firstDate.valueOf() + (640 * 60 * 1000)), 10])
    ])

    testUserDay1Activities.push(tud1a1.rows[0]);
    testUserDay1Activities.push(tud1a2.rows[0]);
    testUserDay2Activities.push(tud2a1.rows[0]);
    secondUserDay1Activities.push(sud1a1.rows[0]);
    secondUserDay2Activities.push(sud2a2.rows[0]);
    testUserDay1Meals.push(tud1m1.rows[0]);
    secondUserDay1Sleeps.push(sud1s1.rows[0]);

  })


  test("Gets all of testUser's activities, meals, and sleeps for the correct date, none for secondUser, none for other date", async function() {
    let fd = await Day.getFullDay(firstDate, testUser.id);

    expect(fd.activities).toEqual(testUserDay1Activities);
    expect(fd.meals).toEqual(testUserDay1Meals);
    expect(fd.sleeps).toEqual(testUserDay1Sleeps);

    fd = await Day.getFullDay(secondDate, testUser.id);

    expect(fd.activities).toEqual(testUserDay2Activities);
    expect(fd.meals).toEqual(testUserDay2Meals);
    expect(fd.sleeps).toEqual(testUserDay2Sleeps);


  })


  test("Gets all of secondUser's activities, meals, and sleeps for the correct date, none for testUser, none for other date", async function() {
    let fd = await Day.getFullDay(firstDate, secondUser.id);

    expect(fd.activities).toEqual(secondUserDay1Activities);
    expect(fd.meals).toEqual(secondUserDay1Meals);
    expect(fd.sleeps).toEqual(secondUserDay1Sleeps);

    fd = await Day.getFullDay(secondDate, secondUser.id);

    expect(fd.activities).toEqual(secondUserDay2Activities);
    expect(fd.meals).toEqual(secondUserDay2Meals);
    expect(fd.sleeps).toEqual(secondUserDay2Sleeps);
  })


  test("Throws a NotFoundError searching for a day that does not exist", async function() {
    const badPromise = Day.getFullDay(new Date(1970, 0, 15), testUser.id);
    await expect(badPromise).rejects.toThrow(NotFoundError);
  })

  test("Throws a NotFoundError searching for a user that does not exist", async function() {
    const badPromise = Day.getFullDay(firstDate, 'bad-user-id');
    await expect(badPromise).rejects.toThrow(NotFoundError);
  })

})