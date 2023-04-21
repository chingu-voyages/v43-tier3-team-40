const { Router } = require('express');
const jwt = require('jsonwebtoken');

const checkToken = require('../middleware/checkToken');
const Sleep = require('../models/Sleep');
const {SECRET_KEY} = require('../config.js');

const router = new Router();

// all routes are protected
router.use(checkToken);

/**
 * GET getSleep/:sleep_id
 * Calls Sleep.getSleep on req.params.sleep_id, returns
 * the sleep document found
 */
router.get('/getSleep/:sleep_id', async (req, res, next) => {
  try {
    const sleep = await Sleep.getSleep(req.params.sleep_id, req.user.id);
    const token = jwt.sign(req.user, SECRET_KEY);
    return res.json({
      sleep,
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
 * GET getSleeps?query
 * Receives an array of objects as a query, with each
 * object having the keys of "column_name", 
 * "comparison_operator", and "comparison_value", then
 * reassembles the array and passes it to Sleep.getSleeps,
 * returning all sleep documents. An empty array/query
 * string will return all sleeps belonging to a user
 */
router.get('/getSleeps', async (req, res, next) => {
  try {

    const query_arr = []
    for (let [key, val] of Object.entries(req.query)) {
      query_arr.push(val);
    }
    console.log(query_arr);

    const sleeps = await Sleep.getSleeps(query_arr, req.user.id);

    const token = jwt.sign(req.user, SECRET_KEY);
    return res.json({
      sleeps,
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
 * POST /addSleep
 * Takes the request body and passes it to Sleep.addSleep,
 * returning the newly created sleep document to the
 * user.
 */
router.post('/addSleep', async (req, res, next) => {
  try {
    const sleep = await Sleep.addSleep(req.body, req.user.id);
    const token = jwt.sign(req.user, SECRET_KEY);
    res.json({
      sleep,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token
    })
  } catch (err) {
    return next(err)
  }
})


/**
 * PUT /editSleep
 * Takes edits from the request body and passes them
 * as an object to Sleep.editSleep. Note that the
 * request body MUST contain the id of the sleep
 * document to be edit
 */
router.put('/editSleep', async (req, res, next) => {
  try {
    const sleep = await Sleep.editSleep(req.body, req.body.id, req.user.id)
    const token = jwt.sign(req.user, SECRET_KEY);
    res.json({
      sleep,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token
    })
  } catch (err) {
    return next(err)
  }
})


/**
 * DELETE /deleteSleep/:sleep_id
 * Takes the sleep_id and passes it to Sleep.deleteSleep,
 * returning the deleted sleep document to the user
 */
router.delete('/deleteSleep/:sleep_id', async (req, res, next) => {
  try {
    const sleep = await Sleep.deleteSleep(req.params.sleep_id, req.user.id)
    const token = jwt.sign(req.user, SECRET_KEY);
    res.json({
      sleep,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token
    })
    
  } catch (err) {
    return next(err)
  }
})

module.exports = router;