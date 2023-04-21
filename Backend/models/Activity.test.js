const db = require('../db')
const User = require('./User')
const Day = require('./Day')
const Activity = require('./activity')
const {
  UnauthorizedError,
  NotFoundError,
  BadDateError,
} = require('../expressError')

let testUser1
let testUser2
let testUser3
let tu1d1
let fs_category = 'Walking'
let fs_start_time = new Date('2023-04-01 20:00')
let fs_end_time = new Date('2023-04-02 06:00')
let fs_intensity = 3
let fs_success_rating = 7

// easier way of checking when going through high volume
function checkActivity(
  activity,
  id,
  day_id,
  category,
  start_time,
  end_time,
  intensity,
  success_rating,
  user_id
) {
  if (id === undefined) {
    expect(activity).toHaveProperty('id')
  } else expect(activity).toHaveProperty('id', id)

  if (day_id === undefined) {
    expect(activity).toHaveProperty('day_id')
  } else expect(activity).toHaveProperty('day_id', day_id)

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

  if (user_id === undefined) {
    expect(activity).toHaveProperty('user_id')
  } else expect(activity).toHaveProperty('user_id', user_id)
}

beforeAll(async () => {
  await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`)
  testUser1 = await User.createUser(
    'testUser1',
    'testUser1@email.com',
    'password123'
  )
  testUser2 = await User.createUser(
    'testUser2',
    'testUser2@email.com',
    'password123'
  )
  testUser3 = await User.createUser(
    'testUser3',
    'testUser3@email.com',
    'password123'
  )

  tu1d1 = await Day.addDay(new Date('2023-04-01T08:00:00.000Z'), testUser1.id)

  // first activity manually inserted
  first_activity = (
    await db.query(
      `INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        tu1d1.id,
        fs_category,
        fs_start_time,
        fs_end_time,
        fs_intensity,
        fs_success_rating,
      ]
    )
  ).rows[0]
})

afterAll(async () => {
  await db.end()
})

describe('Successfully retrieves activity with getActivity', function () {
  test('Placeholder', async () => {
    expect(2).toBe(2)
  })

  test('testUser1 retrieves successfully retrieves initial activity', async () => {
    const activity = await Activity.getActivity(first_activity.id, testUser1.id)
    expect(activity).toHaveProperty('id')
    expect(activity).toHaveProperty('day_id', tu1d1.id)
    expect(activity).toHaveProperty('category', fs_category)
    expect(activity).toHaveProperty('start_time', fs_start_time)
    expect(activity).toHaveProperty('end_time', fs_end_time)
    expect(activity).toHaveProperty('intensity', fs_intensity)
    expect(activity).toHaveProperty('success_rating', fs_success_rating)
  })

  test("Throws NotFoundError when testUser2 tries to retrieve testUser1's activity", async () => {
    await expect(
      Activity.getActivity(first_activity.id, testUser2.id)
    ).rejects.toThrow(NotFoundError)
  })

  test('Throws NotFoundError when testUser1 tries to retrieve nonexistent activity', async () => {
    await expect(Activity.getActivity(99999999, testUser1.id)).rejects.toThrow(
      NotFoundError
    )
  })
})

describe('Successfully adds Activity with addActivity', function () {
  test('testUser1 can add a activity to a given day', async () => {
    day = await Day.addDay(new Date('2023-04-02T08:00:00.000Z'), testUser1.id)
    const activity = await Activity.addActivity(
      {
        day_id: day.id,
        category: 'Running',
        intensity: 5,
        success_rating: 6,
      },
      testUser1.id
    )
    expect(activity).toHaveProperty('id')
    expect(activity).toHaveProperty('day_id', day.id)
    expect(activity).toHaveProperty('start_time', null)
    expect(activity).toHaveProperty('end_time', null)
    expect(activity).toHaveProperty('category', 'Running')
    expect(activity).toHaveProperty('intensity', 5)
    expect(activity).toHaveProperty('success_rating', 6)
  })

  test('testUser2 can add a activity to a given day', async () => {
    day = await Day.addDay(new Date('2023-04-02T08:00:00.000Z'), testUser2.id)
    const activity = await Activity.addActivity(
      {
        day_id: day.id,
        category: 'Swimming',
        start_time: new Date('2023-04-02T22:00:00.000Z'),
        end_time: new Date('2023-04-03T06:00:00.000Z'),
        intensity: 9,
        success_rating: 6,
      },
      testUser2.id
    )
    expect(activity).toHaveProperty('id')
    expect(activity).toHaveProperty('day_id', day.id)
    expect(activity).toHaveProperty(
      'start_time',
      new Date('2023-04-02T22:00:00.000Z')
    )
    expect(activity).toHaveProperty(
      'end_time',
      new Date('2023-04-03T06:00:00.000Z')
    )
    expect(activity).toHaveProperty('category', 'Swimming')
    expect(activity).toHaveProperty('intensity', 9)
    expect(activity).toHaveProperty('success_rating', 6)
  })

  test('throws UnauthorizedError when activity added to day not belonging to user', async () => {
    await expect(
      Activity.addActivity(
        {
          day_id: 9999999,
          success_rating: 6,
        },
        testUser1.id
      )
    ).rejects.toThrow(UnauthorizedError)
  })

  test('Successfully creates day from start_time', async () => {
    const activity = await Activity.addActivity(
      {
        start_time: new Date('2023-04-03T23:00:00.000Z'),
      },
      testUser3.id
    )

    const day = await Day.getDay(
      new Date('2023-04-03T23:00:00.000Z'),
      testUser3.id
    )

    expect(day).toHaveProperty('user_id', testUser3.id)
    expect(day).toHaveProperty('date', new Date('4-3-2023'))

    expect(activity).toHaveProperty('id')
    expect(activity).toHaveProperty('day_id', day.id)
    expect(activity).toHaveProperty(
      'start_time',
      new Date('2023-04-03T23:00:00.000Z')
    )
    expect(activity).toHaveProperty('end_time', null)
    expect(activity).toHaveProperty('category', null)
    expect(activity).toHaveProperty('intensity', null)
    expect(activity).toHaveProperty('success_rating', null)
  })

  test('Throws BadDateError when no day_id or start_time', async () => {
    await expect(
      Activity.addActivity(
        {
          end_time: new Date('2023-04-03T23:00:00.000Z'),
          category: 'Running',
          intensity: 5,
          success_rating: 10,
        },
        testUser3.id
      )
    ).rejects.toThrow(BadDateError)
  })
})

describe('Successfully deletes activity with deleteactivity', function () {
  test('Successfully deletes a activity', async () => {
    const activity = await Activity.addActivity(
      {
        category: 'Running',
        start_time: new Date('2023-04-02T22:00:00.000Z'),
        end_time: new Date('2023-04-03T06:00:00.000Z'),
        intensity: 5,
        success_rating: 6,
      },
      testUser3.id
    )
    const ds = await Activity.deleteActivity(activity.id, testUser3.id)
    expect(ds).toEqual(activity)

    const deletedactivity = (
      await db.query(`SELECT * FROM activities WHERE id = $1;`, [activity.id])
    ).rows
    expect(deletedactivity.length).toBe(0)
  })

  test('Throws a NotFoundError on non-existent activity', async () => {
    await expect(Activity.deleteActivity(999999999, testUser3)).rejects.toThrow(
      NotFoundError
    )
  })

  test("Throws a NotFoundError on a different user's activity", async () => {
    // first_activity belongs to testUser1
    await expect(
      Activity.deleteActivity(first_activity.id, testUser3)
    ).rejects.toThrow(NotFoundError)
  })
})

describe('Successfully retrieves multiple activities according to search paramters with getactivities', function () {
  // delete users and rebuild documents
  beforeAll(async () => {
    await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`)
    testUser1 = await User.createUser(
      'testUser1',
      'testUser1@email.com',
      'password123'
    )
    testUser2 = await User.createUser(
      'testUser2',
      'testUser2@email.com',
      'password123'
    )
    testUser3 = await User.createUser(
      'testUser3',
      'testUser3@email.com',
      'password123'
    )

    testUser1Activities = [
      {
        category: 'Running',
        start_time: new Date('2023-2-27 21:00'),
        end_time: new Date('2023-2-28 7:00'),
        intensity: 5,
        success_rating: 5,
      },
      {
        category: 'Biking',
        start_time: new Date('2023-2-28 21:00'),
        end_time: new Date('2023-3-1 7:00'),
        intensity: 7,
        success_rating: 5,
      },
      {
        category: 'Swimming',
        start_time: new Date('2023-3-1 21:00'),
        end_time: new Date('2023-3-2 7:00'),
        intensity: 9,
        success_rating: 7,
      },
      {
        category: 'Bowling',
        start_time: new Date('2023-3-2 21:00'),
        end_time: new Date('2023-3-3 7:00'),
        intensity: 1,
        success_rating: 8,
      },
      {
        category: 'Tennis',
        start_time: new Date('2023-3-3 21:00'),
        end_time: new Date('2023-3-4 7:00'),
        intensity: 3,
        success_rating: 3,
      },
    ]

    testUser2Activities = [
      {
        category: 'Climbing',
        start_time: new Date('2023-3-1 23:00'),
        end_time: new Date('2023-3-2 9:00'),
        intensity: 5,
        success_rating: 8,
      },
      {
        category: 'Running',
        start_time: new Date('2023-3-2 23:00'),
        end_time: new Date('2023-3-3 9:00'),
        intensity: 5,
        success_rating: 2,
      },
      {
        category: 'Dancing',
        start_time: new Date('2023-3-3 23:00'),
        end_time: new Date('2023-3-4 9:00'),
        intensity: 5,
        success_rating: 4,
      },
      {
        category: 'weightlifting',
        start_time: new Date('2023-3-4 23:00'),
        end_time: new Date('2023-3-5 9:00'),
        intensity: 5,
        success_rating: 10,
      },
      {
        category: 'Golfing',
        start_time: new Date('2023-3-5 23:00'),
        end_time: new Date('2023-3-6 9:00'),
        intensity: 5,
        success_rating: 6,
      },
    ]

    testUser3Activities = [
      {
        category: 'Yoga',
        start_time: new Date('2023-3-3 20:30'),
        end_time: new Date('2023-3-4 5:30'),
        intensity: 5,
        success_rating: 6,
      },
      {
        category: 'Tennis',
        start_time: new Date('2023-3-4 20:30'),
        end_time: new Date('2023-3-5 5:30'),
        intensity: 5,
        success_rating: 6,
      },
      {
        category: 'Volleyball',
        start_time: new Date('2023-3-5 20:30'),
        end_time: new Date('2023-3-6 5:30'),
        intensity: 5,
        success_rating: 7,
      },
      {
        category: 'Dodgeball',
        start_time: new Date('2023-3-6 20:30'),
        end_time: new Date('2023-3-7 5:30'),
        intensity: 5,
        success_rating: 3,
      },
      {
        category: 'Soccer',
        start_time: new Date('2023-3-7 15:00'),
        end_time: new Date('2023-3-7 15:30'),
        intensity: 5,
        success_rating: 2,
      },
      {
        category: 'Hiking',
        start_time: new Date('2023-3-7 20:30'),
        end_time: new Date('2023-3-8 5:30'),
        intensity: 5,
        success_rating: 9,
      },
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
      Activity.addActivity(testUser3Activities[3], testUser3.id),
    ])

    // same day, need to do one after the other the second to find the day
    await Activity.addActivity(testUser3Activities[4], testUser3.id)
    await Activity.addActivity(testUser3Activities[5], testUser3.id)
  })

  test('Gets all activities for testUser1', async () => {
    const activities = await Activity.getActivities([], testUser1.id)
    expect(activities.length).toBe(5)
    const tu1s = testUser1Activities
    checkActivity(
      activities[0],
      undefined,
      undefined,
      tu1s[0].category,
      tu1s[0].start_time,
      tu1s[0].end_time,
      tu1s[0].intensity,
      tu1s[0].success_rating,
      testUser1.id
    )
    checkActivity(
      activities[1],
      undefined,
      undefined,
      tu1s[1].category,
      tu1s[1].start_time,
      tu1s[1].end_time,
      tu1s[1].intensity,
      tu1s[1].success_rating,
      testUser1.id
    )
    checkActivity(
      activities[2],
      undefined,
      undefined,
      tu1s[2].category,
      tu1s[2].start_time,
      tu1s[2].end_time,
      tu1s[2].intensity,
      tu1s[2].success_rating,
      testUser1.id
    )
    checkActivity(
      activities[3],
      undefined,
      undefined,
      tu1s[3].category,
      tu1s[3].start_time,
      tu1s[3].end_time,
      tu1s[3].intensity,
      tu1s[3].success_rating,
      testUser1.id
    )
    checkActivity(
      activities[4],
      undefined,
      undefined,
      tu1s[4].category,
      tu1s[4].start_time,
      tu1s[4].end_time,
      tu1s[4].intensity,
      tu1s[4].success_rating,
      testUser1.id
    )
  })

  test('Gets all activities for testUser2', async () => {
    const activities = await Activity.getActivities([], testUser2.id)
    const tus = testUser2Activities
    checkActivity(
      activities[0],
      undefined,
      undefined,
      tus[0].category,
      tus[0].start_time,
      tus[0].end_time,
      tus[0].intensity,
      tus[0].success_rating,
      testUser2.id
    )
    checkActivity(
      activities[1],
      undefined,
      undefined,
      tus[1].category,
      tus[1].start_time,
      tus[1].end_time,
      tus[1].intensity,
      tus[1].success_rating,
      testUser2.id
    )
    checkActivity(
      activities[2],
      undefined,
      undefined,
      tus[2].category,
      tus[2].start_time,
      tus[2].end_time,
      tus[2].intensity,
      tus[2].success_rating,
      testUser2.id
    )
    checkActivity(
      activities[3],
      undefined,
      undefined,
      tus[3].category,
      tus[3].start_time,
      tus[3].end_time,
      tus[3].intensity,
      tus[3].success_rating,
      testUser2.id
    )
    checkActivity(
      activities[4],
      undefined,
      undefined,
      tus[4].category,
      tus[4].start_time,
      tus[4].end_time,
      tus[4].intensity,
      tus[4].success_rating,
      testUser2.id
    )
  })

  test('Gets all activities for testUser3', async () => {
    const activities = await Activity.getActivities([], testUser3.id)
    const tus = testUser3Activities
    checkActivity(
      activities[0],
      undefined,
      undefined,
      tus[0].category,
      tus[0].start_time,
      tus[0].end_time,
      tus[0].intensity,
      tus[0].success_rating,
      testUser3.id
    )
    checkActivity(
      activities[1],
      undefined,
      undefined,
      tus[1].category,
      tus[1].start_time,
      tus[1].end_time,
      tus[1].intensity,
      tus[1].success_rating,
      testUser3.id
    )
    checkActivity(
      activities[2],
      undefined,
      undefined,
      tus[2].category,
      tus[2].start_time,
      tus[2].end_time,
      tus[2].intensity,
      tus[2].success_rating,
      testUser3.id
    )
    checkActivity(
      activities[3],
      undefined,
      undefined,
      tus[3].category,
      tus[3].start_time,
      tus[3].end_time,
      tus[3].intensity,
      tus[3].success_rating,
      testUser3.id
    )
    checkActivity(
      activities[4],
      undefined,
      undefined,
      tus[4].category,
      tus[4].start_time,
      tus[4].end_time,
      tus[4].intensity,
      tus[4].success_rating,
      testUser3.id
    )
  })

  test('Gets all activities after 3/1/23 for testUser1 with success_rating greater than 5', async () => {
    const activities = await Activity.getActivities(
      [
        {
          column_name: 'start_time',
          comparison_operator: '>',
          comparison_value: new Date('3-1-23'),
        },
        {
          column_name: 'success_rating',
          comparison_operator: '>',
          comparison_value: 5,
        },
      ],
      testUser1.id
    )
    let tus = testUser1Activities
    expect(activities.length).toBe(2)
    checkActivity(
      activities[0],
      undefined,
      undefined,
      tus[2].category,
      tus[2].start_time,
      tus[2].end_time,
      tus[2].intensity,
      tus[2].success_rating,
      testUser1.id
    )
    checkActivity(
      activities[1],
      undefined,
      undefined,
      tus[3].category,
      tus[3].start_time,
      tus[3].end_time,
      tus[3].intensity,
      tus[3].success_rating,
      testUser1.id
    )
  })

  test('Two activities on same day for testUser3 have same date_id', async () => {
    const activities = await Activity.getActivities(
      [
        {
          column_name: 'start_time',
          comparison_operator: '>',
          comparison_value: new Date('3-7-23'),
        },
        {
          column_name: 'end_time',
          comparison_operator: '<',
          comparison_value: new Date('3-8-23 12:00'),
        },
      ],
      testUser3.id
    )
    expect(activities.length).toBe(2)
    expect(activities[0].day_id).toBe(activities[1].day_id)
  })
})

describe('Successfully edits activity with editActivity', function () {
  let testUser4
  let testActivity
  let day

  beforeAll(async () => {
    testUser4 = await User.createUser(
      'testUser4',
      'testUser4@email.com',
      'password123'
    )
    testActivity = await Activity.addActivity(
      {
        category: 'Table Tennis',
        start_time: new Date('2023-3-5 20:30'),
        end_time: new Date('2023-3-6 5:30'),
        intensity: 5,
        success_rating: 7,
      },
      testUser4.id
    )
    day = await Day.addDay('4-18-2023', testUser4.id)
  })

  test('Successfully edits date', async () => {
    const editedactivity = await Activity.editActivity(
      {
        day_id: day.id,
        category: 'Walking',
        start_time: new Date('2023-4-18 20:00'),
        end_time: new Date('2023-4-19 6:00'),
        intensity: 1,
        success_rating: 10,
      },
      testActivity.id,
      testUser4.id
    )

    expect(editedactivity).toHaveProperty('id', testActivity.id)
    expect(editedactivity).toHaveProperty('day_id', day.id)
    expect(editedactivity).toHaveProperty('category', 'Walking')
    expect(editedactivity).toHaveProperty(
      'start_time',
      new Date('4-18-2023 20:00')
    )
    expect(editedactivity).toHaveProperty(
      'end_time',
      new Date('2023-4-19 6:00')
    )
    expect(editedactivity).toHaveProperty('intensity', 1)
    expect(editedactivity).toHaveProperty('success_rating', 10)
  })

  test('Throws NotFoundError on nonexistent activity', async () => {
    const badPromise = Activity.editActivity(
      {
        day_id: day.id,
        category: 'Walking',
        start_time: new Date('2023-4-18 20:00'),
        end_time: new Date('2023-4-19 6:00'),
        intensity: 0,
        success_rating: 10,
      },
      99999999,
      testUser4.id
    )
    await expect(badPromise).rejects.toThrow(NotFoundError)
  })

  test('Throws NotFoundError on activity belonging to someone else', async () => {
    const badPromise = Activity.editActivity(
      {
        day_id: day.id,
        category: 'Running',
        start_time: new Date('2023-4-18 20:00'),
        end_time: new Date('2023-4-19 6:00'),
        intensity: 0,
        success_rating: 10,
      },
      testActivity.id,
      testUser3.id
    )
    await expect(badPromise).rejects.toThrow(NotFoundError)
  })
})
