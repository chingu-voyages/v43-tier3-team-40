const db = require('../db');
const User = require('./User');
const Day = require('./Day');
const Activity = require('./Activity');

const { UnauthorizedError, NotFoundError, BadDateError } = require('../expressError');

let testUser1;
let testUser2;
let testUser3;
let tu1d1;
let first_activity;
let fa_category = "testing";
let fa_start_time = new Date("2023-04-21 15:00");
let fa_end_time = new Date("2023-04-21 20:00");
let fa_intensity = 3;
let fa_success_rating = 2;

function checkActivity(activity, id, day_id, category, start_time, end_time, intensity, success_rating) {
  
  if (id === undefined) {
    expect(activity).toHaveProperty('id')
  } else expect(activity).toHaveProperty('id', id)

  if (day_id === undefined) {
    expect(activity).toHaveProperty('day_id')
  } else expect(activity).toHaveProperty('day_id', day_id )

  if (category === undefined) {
    expect(activity).toHaveProperty('category')
  } else expect(activity).toHaveProperty('category', category)

  if (start_time === undefined) {
    expect(activity).toHaveProperty('start_time')
  } else expect(activity).toHaveProperty('start_time', start_time)

  if (end_time === undefined) {
    expect(activity).toHaveProperty('end_time')
  } else expect(activity).toHaveProperty('end_time', end_time)

  if (intensity === undefined) {
    expect(activity).toHaveProperty('intensity')
  } else expect(activity).toHaveProperty('intensity', intensity)

  if (success_rating === undefined) {
    expect(activity).toHaveProperty('success_rating')
  } else expect(activity).toHaveProperty('success_rating', success_rating)
}


beforeAll(async () => {
  await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`);
	testUser1 = await User.createUser('testUser1', 'testUser1@email.com', 'password123');
  testUser2 = await User.createUser('testUser2', 'testUser2@email.com', 'password123');
  testUser3 = await User.createUser('testUser3', 'testUser3@email.com', 'password123');

	tu1d1 = await Day.addDay(new Date("2023-04-01T08:00:00.000Z"), testUser1.id);

  first_activity = (await db.query(`INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, 
  [
    tu1d1.id, fa_category, fa_start_time, fa_end_time, fa_intensity, fa_success_rating
  ])).rows[0]
})

afterAll(async () => {
  await db.end();
})


describe("Successfully retrieves Activity with getActivity", () => {

  test("testUser1 successfully retrieves initial activity", async () => {
    const activity = await Activity.getActivity(first_activity.id, testUser1.id);
    expect(activity).toHaveProperty('id');
    expect(activity).toHaveProperty('day_id', tu1d1.id);
    expect(activity).toHaveProperty('category', fa_category);
    expect(activity).toHaveProperty('start_time', fa_start_time);
    expect(activity).toHaveProperty('end_time', fa_end_time);
    expect(activity).toHaveProperty('intensity', fa_intensity);
    expect(activity).toHaveProperty('success_rating', fa_success_rating);
  })

  test("Throws NotFoundError when testUser2 tries to retrieve testUser1's activity", async () => {
    await expect(Activity.getActivity(first_activity.id, testUser2.id)).rejects.toThrow(NotFoundError);
  })

  test("Throws NotFoundError when testUser1 tries to retrieve nonexistent activity", async () => {
    await expect(Activity.getActivity(9999999, testUser1.id)).rejects.toThrow(NotFoundError);
  })

})


describe("Sucessfully adds Activity with addActivity", function() {

  test("testUser1 can add an activity to a given day", async () => {
    const day = await Day.addDay(new Date("2023-04-02T08:00:00.000Z"), testUser1.id);
    const activity = await Activity.addActivity({
      day_id: day.id,
      success_rating: 7
    }, testUser1.id);
    expect(activity).toHaveProperty('id');
    expect(activity).toHaveProperty('day_id', day.id);
    expect(activity).toHaveProperty('success_rating', 7);
    expect(activity).toHaveProperty('start_time', null);
    expect(activity).toHaveProperty('end_time', null);
    expect(activity).toHaveProperty('category', null);
    expect(activity).toHaveProperty('intensity', null);
  })

  test("testUser2 can add an activity to a given day", async () => {
    day = await Day.addDay(new Date("2023-04-02T08:00:00.000Z"), testUser2.id);
    const activity = await Activity.addActivity({
      day_id: day.id,
      success_rating: 7,
      intensity: 5,
      start_time: new Date("2023-4-21 14:00"),
      end_time: new Date("2023-4-21 15:30"),
      category: "exercise bike"
    }, testUser2.id)
    expect(activity).toHaveProperty('id')
    expect(activity).toHaveProperty('day_id', day.id,)
    expect(activity).toHaveProperty('success_rating', 7,)
    expect(activity).toHaveProperty('intensity', 5,)
    expect(activity).toHaveProperty('start_time', new Date("2023-4-21 14:00"),)
    expect(activity).toHaveProperty('end_time', new Date("2023-4-21 15:30"),)
    expect(activity).toHaveProperty('category', "exercise bike")
  })

  
  test("throws UnauthorizedError when meal added to day not belonging to user", async () => {
    const badPromise = Activity.addActivity({
      day_id: 99999999,
      success_rating: 5
    }, testUser1.id)
    await (expect(badPromise)).rejects.toThrow(UnauthorizedError);
  })

  
  test("Successfully creates activity from start time", async () => {
    const activity = await Activity.addActivity({
      start_time: new Date("2023-4-3 17:00"),
      category: "jogging"
    }, testUser3.id);

    const day = await Day.getDay(new Date("2023-04-03 17:00"), testUser3.id);

    expect(day).toHaveProperty('user_id', testUser3.id);
		expect(day).toHaveProperty('date', new Date('4-3-2023'));

    expect(activity).toHaveProperty('id');
    expect(activity).toHaveProperty('day_id', day.id);
    expect(activity).toHaveProperty('category', "jogging");
    expect(activity).toHaveProperty('start_time', new Date("2023-4-3 17:00"))

  })

  


})