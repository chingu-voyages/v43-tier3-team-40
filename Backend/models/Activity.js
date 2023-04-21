const {
  NotFoundError,
  UnauthorizedError,
  BadDateError,
} = require('../expressError')
const dynamicSearchQuery = require('../helpers/dynamicSearchQuery')
const dynamicUpdateQuery = require('../helpers/dynamicUpdateQuery')
const db = require('../db')
const Day = require('./Day')

const getActivity = async (activity_id, user_id) => {
  try {
    const activityQuery = await db.query(
      `
            SELECT
                activities.id AS id,
                day_id,
                category,
                start_time,
                end_time,
                intensity,
                success_rating,
                days.user_id AS user_id
            FROM activities
            LEFT JOIN days ON activities.day_id=days.id
            WHERE activities.id=$1
            `,
      [activity_id]
    )
    if (activityQuery.rows.length === 0) {
      throw new NotFoundError()
    } else return activityQuery.rows[0]
  } catch (err) {
    throw err
  }
}
module.exports.getActivity = getActivity

const getActivities = async (query_arr, user_id) => {
  try {
    const query = dynamicSearchQuery(query_arr, 'activities', user_id)
    const get_activities = await db.query(...query)
    return get_activities.rows
  } catch (err) {
    throw err
  }
}
module.exports.getActivities = getActivities

const addActivity = async (activity_obj_in, user_id) => {
  try {
    const activity_obj = {
      day_id: activity_obj_in.day_id,
      category: activity_obj_in.category,
      start_time: activity_obj_in.start_time,
      end_time: activity_obj_in.end_time,
      intensity: activity_obj_in.intensity,
      success_rating: activity_obj_in.success_rating,
    }

    if (activity_obj.day_id) {
      const day = (
        await db.query(`SELECT * FROM days WHERE id = $1;`, [
          activity_obj.day_id,
        ])
      ).rows[0]
      if (day?.user_id !== user_id) throw new UnauthorizedError()
    } else {
      if (activity_obj.start_time) {
        let day = await Day.addDay(activity_obj.start_time, user_id)
        activity_obj.day_id = day.id
      } else throw new BadDateError()
    }

    const activityQuery = await db.query(
      `
            INSERT INTO activities (day_id, category, start_time, end_time, intensity, success_rating)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
      [
        activity_obj.day_id,
        activity_obj.category,
        activity_obj.start_time,
        activity_obj.end_time,
        activity_obj.intensity,
        activity_obj.success_rating,
      ]
    )

    return activityQuery.rows[0]
  } catch (err) {
    throw err
  }
}
module.exports.addActivity = addActivity

const editActivity = async (activity_obj_in, activity_id, user_id) => {
  try {
    const foundActivity = await getActivity(activity_id, user_id)
    if (!foundActivity) throw new NotFoundError()

    const activity_obj = {
      day_id: activity_obj_in.day_id || null,
      category: activity_obj_in.category || null,
      start_time: activity_obj_in.start_time || null,
      end_time: activity_obj_in.end_time || null,
      intensity: activity_obj_in.intensity || null,
      success_rating: activity_obj_in.success_rating || null,
    }

    const queryArr = dynamicUpdateQuery(
      activity_obj,
      'activities',
      'id',
      activity_id
    )
    const activit = (await db.query(...queryArr)).rows[0]
    return activity
  } catch (err) {
    throw err
  }
}
module.exports.editActivity = editActivity

const deleteActivity = async (activity_id, user_id) => {
  try {
    const activity = await getActivity(activity_id, user_id)
    if (activity.user_id !== user_id) throw new UnauthorizedError()

    const activityQuery = await db.query(
      `
                DELETE FROM activities
                WHERE id = $1
                RETURNING *;
            `,
      [activity_id]
    )

    return activityQuery.rows[0]
  } catch (err) {
    throw err
  }
}
module.exports.deleteActivity = deleteActivity
