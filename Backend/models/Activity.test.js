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


describe("Successfully deletes Activity with deleteActivity", function() {

  test("Successfully deletes an activity", async () => {
    const activity = await Activity.addActivity({
      start_time: new Date("2023-4-21 12:00")
    }, testUser1.id);

    const da = await Activity.deleteActivity(activity.id, testUser1.id);
    expect(da).toEqual(activity);
    const query = await db.query(`SELECT * FROM activities WHERE id = $1;`, [da.id]);
    expect(query.rows).toEqual([]);
  })


  test("Throws a NotFoundError on a non-existent activity", async () => {
    await (expect(Activity.deleteActivity(9999999, testUser1.id))).rejects.toThrow(NotFoundError);
  })


  test("Throws a NotFoundError on a different user's activity", async() => {
    // first activity belongs to testUser1
    await (expect(Activity.deleteActivity(first_activity.id, testUser3.id))).rejects.toThrow(NotFoundError);
  })

})


describe("Successfully retrieves multiple activities according to search parameters with getActivities", function() {

  let testUser1Activities;
  let testUser2Activities;
  let testUser3Activities;

  // delete users and rebuild documents
  beforeAll(async () => {
    await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`);
    testUser1 = await User.createUser('testUser1', 'testUser1@email.com', 'password123');
    testUser2 = await User.createUser('testUser2', 'testUser2@email.com', 'password123');
    testUser3 = await User.createUser('testUser3', 'testUser3@email.com', 'password123');

    testUser1Activities = [
      {
        category: 'Evening Jog',
        start_time: new Date("2023-4-1 18:00"),
        end_time: new Date("2023-4-1 18:45"),
        intensity: 7,
        success_rating: 6
      },
      {
        category: 'Evening Bike Ride',
        start_time: new Date("2023-4-2 18:00"),
        end_time: new Date("2023-4-2 18:45"),
        intensity: 6,
        success_rating: 8
      },
      {
        category: 'Evening Walk',
        start_time: new Date("2023-4-3 18:00"),
        end_time: new Date("2023-4-3 18:45"),
        intensity: 3,
        success_rating: 4
      },
      {
        category: 'Evening Jog',
        start_time: new Date("2023-4-4 18:00"),
        end_time: new Date("2023-4-4 18:45"),
        intensity: 6,
        success_rating: 4
      },
      {
        category: 'Pickleball',
        start_time: new Date("2023-4-5 18:00"),
        end_time: new Date("2023-4-5 19:45"),
        intensity: 4,
        success_rating: 8
      }
    ]

    testUser2Activities = [
      {
        category: 'Morning Pushups',
        start_time: new Date("2023-4-3 6:00"),
        end_time: new Date("2023-4-3 6:20"),
        intensity: 8,
        success_rating: 7
      },
      {
        category: 'Morning Situps',
        start_time: new Date("2023-4-4 6:00"),
        end_time: new Date("2023-4-4 6:20"),
        intensity: 6,
        success_rating: 5
      },
      {
        category: 'Morning Pushups and Situps',
        start_time: new Date("2023-4-5 6:00"),
        end_time: new Date("2023-4-5 6:20"),
        intensity: 9,
        success_rating: 4
      },
      {
        category: 'Morning Pushups',
        start_time: new Date("2023-4-6 6:00"),
        end_time: new Date("2023-4-6 6:20"),
        intensity: 6,
        success_rating: 4
      },
      {
        category: 'Morning Run',
        start_time: new Date("2023-4-7 6:00"),
        end_time: new Date("2023-4-7 6:35"),
        intensity: 5,
        success_rating: 9
      }
    ]

    testUser3Activities = [
      {
        category: 'Afternoon Walk',
        start_time: new Date("2023-4-6 14:00"),
        end_time: new Date("2023-4-6 14:30"),
        intensity: 3,
        success_rating: 5
      },
      {
        category: 'Afternoon Walk',
        start_time: new Date("2023-4-7 14:00"),
        end_time: new Date("2023-4-7 14:30"),
        intensity: 4,
        success_rating: 6
      },
      {
        category: 'Afternoon Walk',
        start_time: new Date("2023-4-8 14:00"),
        end_time: new Date("2023-4-8 14:30"),
        intensity: 5,
        success_rating: 3
      },
      {
        category: 'Afternoon Walk',
        start_time: new Date("2023-4-9 14:00"),
        end_time: new Date("2023-4-9 14:30"),
        intensity: 4,
        success_rating: 2
      },
      {
        category: 'Afternoon Walk',
        start_time: new Date("2023-4-10 14:00"),
        end_time: new Date("2023-4-10 14:30"),
        intensity: 1,
        success_rating: 5
      },
      {
        category: 'Evening Muy Thai',
        start_time: new Date("2023-4-10 19:00"),
        end_time: new Date("2023-4-10 21:00"),
        intensity: 10,
        success_rating: 10
      }
    ]

    await Promise.all([
      Activity.addActivity(testUser1Activities[0], testUser1.id),
      Activity.addActivity(testUser1Activities[1], testUser1.id),
      Activity.addActivity(testUser1Activities[2], testUser1.id),
      Activity.addActivity(testUser1Activities[3], testUser1.id),
      Activity.addActivity(testUser1Activities[4], testUser1.id),

      Activity.addActivity(testUser2Activities[0], testUser2.id),
      Activity.addActivity(testUser2Activities[1], testUser2.id),
      Activity.addActivity(testUser2Activities[2], testUser2.id),
      Activity.addActivity(testUser2Activities[3], testUser2.id),
      Activity.addActivity(testUser2Activities[4], testUser2.id),

      Activity.addActivity(testUser3Activities[0], testUser3.id),
      Activity.addActivity(testUser3Activities[1], testUser3.id),
      Activity.addActivity(testUser3Activities[2], testUser3.id),
      Activity.addActivity(testUser3Activities[3], testUser3.id)

    ])

    // same day, need to do one after the other to find the day
    await Activity.addActivity(testUser3Activities[4], testUser3.id);
    await Activity.addActivity(testUser3Activities[5], testUser3.id);


  })

  test("gets all activities for testUser1", async () => {
    const activities = await Activity.getActivities([], testUser1.id);
    expect(activities.length).toBe(5);
    for (let i=0; i<activities.length; i++){
      checkActivity(activities[i], undefined, undefined, ...Object.values(testUser1Activities[i]));
    }
  })

  test("gets all activities for testUser2", async () => {
    const activities = await Activity.getActivities([], testUser2.id);
    expect(activities.length).toBe(5);
    for (let i=0; i<activities.length; i++){
      checkActivity(activities[i], undefined, undefined, ...Object.values(testUser2Activities[i]));
    }
  })

  test("gets all activities for testUser3", async () => {
    const activities = await Activity.getActivities([], testUser3.id);
    expect(activities.length).toBe(6);
    for (let i=0; i<activities.length; i++){
      checkActivity(activities[i], undefined, undefined, ...Object.values(testUser3Activities[i]));
    }
  })

  test("Gets all activities after 4/2/23 for testUser1 with intensity higher than 3", async () => {
    const activities = await Activity.getActivities([
      {
        column_name: 'start_time',
        comparison_operator: '>',
        comparison_value: new Date("4-3-2023") // midnight 4-2-23
      },
      {
        column_name: 'intensity',
        comparison_operator: '>',
        comparison_value: 3
      }
    ], testUser1.id);
    expect(activities.length).toBe(2);

    checkActivity(activities[0], undefined, undefined, ...Object.values(testUser1Activities[3]));
    checkActivity(activities[1], undefined, undefined, ...Object.values(testUser1Activities[4]));
  })

  test("Two activities on same day for testUser1 have same date_id", async () => {
    const activities = await Activity.getActivities([{
			column_name: 'start_time',
      comparison_operator: '>',
      comparison_value: new Date('4-10-23')
		}, {
			column_name: 'end_time',
      comparison_operator: '<',
      comparison_value: new Date('4-11-23')
		}], testUser3.id)
    expect(activities.length).toBe(2);
    expect(activities[0].day_id).toBe(activities[1].day_id);
  })



})