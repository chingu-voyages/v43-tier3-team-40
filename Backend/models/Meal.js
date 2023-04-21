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
		
		if (!meal) throw new NotFoundError();
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


/**
 * Takes a meal object, parses it to set the
 * corret keys, checks if the correct day
 * document exists to add the meal to, then
 * adds the meal to that day or to a new day
 * that is created, returning the meal
 * document.
 * @param {Object} meal_obj_in 
 * @param {UUID} user_id 
 * @returns 
 */
const addMeal = async (meal_obj_in, user_id) => {
	try {
		const meal_obj = {
			day_id: meal_obj_in.day_id,
			calories: meal_obj_in.calories || null,
			carbs: meal_obj_in.carbs || null,
			fat: meal_obj_in.fat || null,
			protein: meal_obj_in.protein || null,
			dietary_restrictions: meal_obj_in.dietary_restrictions || null,
			time: meal_obj_in.time || null
		}

		// need to make sure day exists and belongs to user_id
		if (meal_obj.day_id) {
			const day = (await db.query(`SELECT * FROM days WHERE id = $1;`,
			[meal_obj.day_id])).rows[0];
			if (day?.user_id !== user_id) throw new UnauthorizedError();
			// else proceed
		} else {
			if (meal_obj.time) {
				let day = await Day.addDay(meal_obj.time, user_id);
				meal_obj.day_id = day.id;
			} else throw new BadDateError();
		}

		const {day_id, calories, carbs, fat, protein, 
			dietary_restrictions, time} = meal_obj;

		const meal = (await db.query(`INSERT INTO meals
			(day_id, calories, carbs, fat, protein, 
			dietary_restrictions, time) VALUES 
			($1, $2, $3, $4, $5, $6, $7) RETURNING *;`
			, [day_id, calories, carbs, fat, protein, 
			dietary_restrictions, time])).rows[0];
		return meal;

	} catch(err) {
		throw err;
	}
}
module.exports.addMeal = addMeal;


/**
 * Takes an object of desired edits to make to a meal,
 * the id of the meal to edit, and a user_id. First
 * looks for the meal to make sure that it exists and
 * belongs to that user, then cleans the meal object to
 * get the correct keys, then makes the edits and
 * returns the meal.
 * @param {Object} meal_obj_in 
 * @param {Number} meal_id 
 * @param {UUID} user_id 
 * @returns {meal}
 */
const editMeal = async (meal_obj_in, meal_id, user_id) => {
	try {

		// make sure that this meal belongs to this user
		const foundMeal = await getMeal(meal_id, user_id);
		if (!foundMeal) throw new NotFoundError();

		// filter meal_obj to get only appropriate keys
		const meal_obj = {
			day_id: meal_obj_in.day_id,
			calories: meal_obj_in.calories || null,
			carbs: meal_obj_in.carbs || null,
			fat: meal_obj_in.fat || null,
			protein: meal_obj_in.protein || null,
			dietary_restrictions: meal_obj_in.dietary_restrictions || null,
			time: meal_obj_in.time || null
		}

		const query_arr = dynamicUpdateQuery(meal_obj, 'meals', 'id', meal_id);
		const meal = (await db.query(...query_arr)).rows[0];

		return meal;

	} catch(err) {
		throw err;
	}
}
module.exports.editMeal = editMeal;


/**
 * Takes a meal_id and a user_id, checks for
 * the meal and to make sure it belongs to the
 * user. If so, deletes and returns the meal.
 * @param {Number} meal_id 
 * @param {UUID} user_id 
 * @returns {meal}
 */
const deleteMeal = async(meal_id, user_id) => {
	try {
		// make sure that this meal belongs to the user
		const foundMeal = await getMeal(meal_id, user_id);
		if (!foundMeal) throw new NotFoundError();

		const deleted_meal = (await db.query(`DELETE FROM meals WHERE id = $1 RETURNING *;`, [meal_id])).rows[0];
		return deleted_meal;

	} catch(err) {
		throw err;
	}
}
module.exports.deleteMeal = deleteMeal;