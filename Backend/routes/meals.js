const { Router } = require('express');
const jwt = require('jsonwebtoken');

const checkToken = require('../middleware/checkToken');
const Meal = require('../models/Meal');
const {SECRET_KEY} = require('../config.js');

const router = new Router();

// all routes are protected
router.use(checkToken);


/**
 * GET getMeal/:meal_id
 * Calls Meal.getMeal on req.params.meal_id, returns
 * the meal document found
 */
router.get('/getMeal/:meal_id', async (req, res, next) => {
  try {
		const meal = await Meal.getMeal(req.params.meal_id, req.user.id);
		const token = jwt.sign(req.user, SECRET_KEY);
		return res.json({
			meal,
			id: req.user.id,
			username: req.user.username,
			email: req.user.email,
			token
		})
	} catch(err) {
		return next(err);
	}
})

/**
 * GET getMeals?query
 * Receives an array of objects as a query, with each
 * object having the keys of "column_name", 
 * "comparison_operator", and "comparison_value", then
 * reassembles the array and passes it to Meal.getMeals,
 * returning all meal documents. An empty array/query
 * string will return all meals belonging to a user
 */
router.get('/getMeals', async (req, res, next) => {
	try {

		const query_arr = [];
		for (let [key, val] of Object.entries(req.query)) {
			query_arr.push(val);
		}
		console.log(query_arr);

		const meals = await Meal.getMeals(query_arr, req.user.id);

		const token = jwt.sign(req.user, SECRET_KEY);
		return res.json({
			meals,
			id: req.user.id,
			username: req.user.username,
			email: req.user.email,
			token
		})

	} catch(err) {
		return next(err);
	}
})


/**
 * POST /addMeal
 * Takes the request body and passes it to Meal.addMeal,
 * returning the newly created meal document to the
 * user
 */
router.post('/addMeal', async (req, res, next) => {
	try {

		const meal = await Meal.addMeal(req.body, req.user.id);
		const token = jwt.sign(req.user, SECRET_KEY);
		return res.json({
			meal,
			id: req.user.id,
			username: req.user.username,
			email: req.user.email,
			token
		})
	} catch(err) {
		return next(err);
	}
})


/**
 * PUT /editMeal
 * Takes edits from the request body and passes them
 * as an object to Meal.editMeal. Note that the
 * request body MUST contain the id of the meal
 * document to be edited.
 */
router.put('/editMeal', async (req, res, next) => {
	try {
		const meal = await Meal.editMeal(req.body, req.body.id, req.user.id);
		const token = jwt.sign(req.user, SECRET_KEY);
		res.json({
			meal,
			id: req.user.id,
			username: req.user.username,
			email: req.user.email,
			token
		})
	} catch(err) {
		return next(err);
	}
})


/**
 * DELETE /deleteMeal/:meal_id
 * Takes the meal_id and passes it to Meal.deleteMeal,
 * returning the deleted meal document to the user
 */
router.delete('/deleteMeal/:meal_id', async (req, res, next) => {
	try {
		const meal = await Meal.deleteMeal(req.params.meal_id, req.user.id);
		const token = jwt.sign(req.user, SECRET_KEY);
		return res.json({
			meal,
			id: req.user.id,
			username: req.user.username,
			email: req.user.email,
			token
		})

	} catch(err) {
		return next(err);
	}
})

module.exports = router;