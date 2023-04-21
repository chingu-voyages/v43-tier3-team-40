const {
  NotFoundError,
  UnauthorizedError,
  BadDateError,
} = require('../expressError')
const dynamicSearchQuery = require('../helpers/dynamicSearchQuery')
const dynamicUpdateQuery = require('../helpers/dynamicUpdateQuery')
const db = require('../db')
const Day = require('./Day')

/**
 * Checks for a document in the activities table with
 * the given activity_id and returns it if it exists,
 * otherwise throws a NotFoundError
 * @param {Number} activity_id
 * @returns {activity}
 */
const getActivity = async (activity_id, user_id) => {
  try {
    const activity = (
      await db.query(
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
            WHERE activities.id=$1 AND days.user_id=$2;
            `,
        [activity_id, user_id]
      )
    ).rows[0]
    if (!activity) throw new NotFoundError()
    else return activity
  } catch (err) {
    throw err
  }
}
module.exports.getActivity = getActivity

/**
 * Takes an array of queries and a user id, converts
 * them into an SQL query through dynamicSearchQuery
 * and returns the results. The search query must be
 * an array of objects with each object having three
 *  keys: 'column_name', 'comparison_operator', and
 * 'comparison_value'
 *  @param {Array} query_arr
 *  @param {UUID} user_id
 * @returns {activities}
 * */
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

/**
 * Takes an activity object and a user id, adds the
 * activity to the database, and returns the new
 * activity object
 * @param {Object} activity_obj_in
 * @param {UUID} user_id
 * @returns {activity}
 * */
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

/**
 * Takes an activity of desired changes and an activity_id,
 *   updates the activity in the database, and returns the
 *  updated activity object
 * @param {Object} activity_obj_in
 * @param {Number} activity_id
 * @param {UUID} user_id
 * @returns {activity}
 * */
const editActivity = async (activity_obj_in, activity_id, user_id) => {
  try {
    const foundActivity = await getActivity(activity_id, user_id)
    if (!foundActivity) throw new NotFoundError()

    const activity_obj = {
      day_id: activity_obj_in.day_id,
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
    const activity = (await db.query(...queryArr)).rows[0]
    return activity
  } catch (err) {
    throw err
  }
}
module.exports.editActivity = editActivity

/**
 * Takes an activity_id and a user_id, deletes the
 * activity from the database, and returns the deleted
 * activity object
 * @param {Number} activity_id
 * @param {UUID} user_id
 * @returns
 * */
const deleteActivity = async (activity_id, user_id) => {
  try {
    const foundActivity = await getActivity(activity_id, user_id)
    if (!foundActivity) throw new NotFoundError()

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
