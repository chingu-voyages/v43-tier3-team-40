const {NotFoundError, UnauthorizedError, BadDateError} = require('../expressError');
const dynamicSearchQuery = require('../helpers/dynamicSearchQuery');
const dynamicUpdateQuery = require('../helpers/dynamicUpdateQuery');
const db = require('../db');
const Day = require('./Day');

/**
 * Checks for a document in the meals table with
 * the given meal_id and user_id (from joining with
 * the days table) and returns it if it exists,
 * otherwise throws a NotFoundError
 * @param {Number} meal_id 
 * @param {UUID} user_id 
 * @returns {meal} 
 */
const getMeal = async (meal_id, user_id) => {
  try {
		const meal = (await db.query(`
			SELECT
				meals.id AS id,
				day_id,
				calories,
				carbs,
				fat,
				protein,
				dietary_restrictions,
				time
			FROM meals
			LEFT JOIN days ON meals.day_id = days.id
			WHERE meals.id = $1 AND days.user_id = $2;`
			, [meal_id, user_id])).rows[0]
		
		if (!meal) throw NotFoundError();
		else return meal;
	} catch(err) {
		throw err;
	}
}
module.exports.getMeal = getMeal;


/**
 * Takes an array of queries and a user id, converts
 * them into an SQL query through dynamicSearchQuery
 * and returns the results. The search query must be
 * an array of objects with each object having three
 * keys: 'column_name', 'comparison_operator', and
 * 'comparison_value'
 * @param {Array} query_arr 
 * @param {UUID} user_id 
 * @returns {meals}
 */
const getMeals = async (query_arr, user_id) => {
	try {
		const query = dynamicSearchQuery(query_arr, 'meals', user_id);
		const get_meals = await db.query(...query);
		return get_meals.rows;
	} catch(err) {
		throw err;
	}
}
module.exports.getMeals = getMeals;