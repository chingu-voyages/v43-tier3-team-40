const {NotFoundError, UnauthorizedError, BadDateError} = require('../expressError');
const dynamicSearchQuery = require('../helpers/dynamicSearchQuery');
const dynamicUpdateQuery = require('../helpers/dynamicUpdateQuery');
const db = require('../db');
const Day = require('./Day');


/**
 * Checks for a document in the activities table with
 * the given activity_id and user_id (from joining with
 * the days table) and returns it if it exists,
 * otherwise throws a NotFoundError
 * @param {Number} activity_id 
 * @param {UUID} user_id 
 * @returns {activity} 
 */
const getActivity = async (activity_id, user_id) => {
  try {
		const activity = (await db.query(`
			SELECT
				activities.id AS id,
				day_id,
				category,
				start_time,
        end_time,
        intensity,
        success_rating
			FROM activities
			LEFT JOIN days ON activities.day_id = days.id
			WHERE activities.id = $1 AND days.user_id = $2;`
			, [activity_id, user_id])).rows[0]
		
		if (!activity) throw new NotFoundError();
		else return activity;
	} catch(err) {
		throw err;
	}
}
module.exports.getActivity = getActivity;


/**
 * Takes an array of queries and a user id, converts
 * them into an SQL query through dynamicSearchQuery
 * and returns the results. The search query must be
 * an array of objects with each object having three
 * keys: 'column_name', 'comparison_operator', and
 * 'comparison_value'
 * @param {Array} query_arr 
 * @param {UUID} user_id 
 * @returns {activities}
 */
const getActivities = async (query_arr, user_id) => {
	try {
		const query = dynamicSearchQuery(query_arr, 'activities', user_id);
		const get_activities = await db.query(...query);
		return get_activities.rows;
	} catch(err) {
		throw err;
	}
}
module.exports.getActivities = getActivities;



/**
 * Takes an activity object, parses it to set the
 * corret keys, checks if the correct day
 * document exists to add the activity to, then
 * adds the activity to that day or to a new day
 * that is created, returning the activity
 * document.
 * @param {Object} activity_obj_in 
 * @param {UUID} user_id 
 * @returns 
 */
const addActivity = async (activity_obj_in, user_id) => {
	try {
		const activity_obj = {
			day_id: activity_obj_in.day_id,
			category: activity_obj_in.category || null,
			start_time: activity_obj_in.start_time || null,
			end_time: activity_obj_in.end_time || null,
			intensity: activity_obj_in.intensity || null,
			success_rating: activity_obj_in.success_rating || null,
		}

		// need to make sure day exists and belongs to user_id
		if (activity_obj.day_id) {
			const day = (await db.query(`SELECT * FROM days WHERE id = $1;`,
			[activity_obj.day_id])).rows[0];
			if (day?.user_id !== user_id) throw new UnauthorizedError();
			// else proceed
		} else {
			if (activity_obj.start_time) {
				let day = await Day.addDay(activity_obj.start_time, user_id);
				activity_obj.day_id = day.id;
			} else throw new BadDateError();
		}

		const {day_id, category, start_time, end_time, intensity, success_rating} = activity_obj;

		const activity = (await db.query(`INSERT INTO activities
			(day_id, category, start_time, end_time, intensity, success_rating) VALUES 
			($1, $2, $3, $4, $5, $6) RETURNING *;`
			, [day_id, category, start_time, end_time, intensity, success_rating])).rows[0];
		return activity;

	} catch(err) {
		throw err;
	}
}
module.exports.addActivity = addActivity;



/**
 * Takes an object of desired edits to make to an activity,
 * the id of the activity to edit, and a user_id. First
 * looks for the activity to make sure that it exists and
 * belongs to that user, then cleans the activity object to
 * get the correct keys, then makes the edits and
 * returns the activity.
 * @param {Object} activity_obj_in 
 * @param {Number} activity_id 
 * @param {UUID} user_id 
 * @returns {activity}
 */
const editActivity = async (activity_obj_in, activity_id, user_id) => {
	try {

		// make sure that this activity belongs to this user
		const foundActivity = await getActivity(activity_id, user_id);
		if (!foundActivity) throw new NotFoundError();

		// filter activity_obj to get only appropriate keys
		const activity_obj = {
			day_id: activity_obj_in.day_id,
			category: activity_obj_in.category || null,
			start_time: activity_obj_in.start_time || null,
			end_time: activity_obj_in.end_time || null,
			intensity: activity_obj_in.intensity || null,
			success_rating: activity_obj_in.success_rating || null,
		}

		const query_arr = dynamicUpdateQuery(activity_obj, 'activities', 'id', activity_id);
		const activity = (await db.query(...query_arr)).rows[0];

		return activity;

	} catch(err) {
		throw err;
	}
}
module.exports.editActivity = editActivity;


/**
 * Takes an acitivity_id and a user_id, checks for
 * the activity and to make sure it belongs to the
 * user. If so, deletes and returns the activity.
 * @param {Number} activity_id 
 * @param {UUID} user_id 
 * @returns {activity}
 */
const deleteActivity = async(activity_id, user_id) => {
	try {
		// make sure that this activity belongs to the user
		const foundActivity = await getActivity(activity_id, user_id);
		if (!foundActivity) throw new NotFoundError();

		const deleted_activity = (await db.query(`DELETE FROM activities WHERE id = $1 RETURNING *;`, [activity_id])).rows[0];
		return deleted_activity;

	} catch(err) {
		throw err;
	}
}
module.exports.deleteActivity = deleteActivity;