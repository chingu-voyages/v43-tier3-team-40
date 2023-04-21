const { Router } = require('express')
const jwt = require('jsonwebtoken')

const checkToken = require('../middleware/checkToken')
const Activity = require('../models/Activity')
const { SECRET_KEY } = require('../config.js')

const router = new Router()

// all routes are protected
router.use(checkToken)

/**
 * GET getActivity/:activity_id
 * Calls Activity.getActivity on req.params.activity_id, returns
 * the activity document found
 *
 */
router.get('/getActivity/:activity_id', async function (req, res, next) {
  try {
    const activity = await Activity.getActivity(activity_id, req.user.id)
    const token = jwt.sign({ id: req.user.id }, SECRET_KEY)
    return res.json({
      activity,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token,
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET getActivities?query
 * Receives an array of objects as a query, with each
 * object having the keys of "column_name",
 * "comparison_operator", and "comparison_value", then
 * reassembles the array and passes it to Activity.getActivities,
 * returning all activity documents. An empty array/query
 * string will return all activities belonging to a user
 */
router.get('/getActivities', async function (req, res, next) {
  try {
    const query_arr = []
    for (let key in req.query) {
      query_arr.push(`${key}=${req.query[key]}`)
    }
    const activities = await Activity.getActivities(query_arr, req.user.id)
    const token = jwt.sign({ id: req.user.id }, SECRET_KEY)
    return res.json({ activities, token })
  } catch (err) {
    return next(err)
  }
})

/**
 * POST addActivity
 * Calls Activity.addActivity on req.body, returns
 * the activity document added
 */
router.post('/addActivity', async function (req, res, next) {
  try {
    const activity = await Activity.addActivity(req.body, req.user.id)
    const token = jwt.sign(req.user, SECRET_KEY)
    return res.json({
      activity,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token,
    })
  } catch (err) {
    return next(err)
  }
})

/**
 *  PUT editActivity
 *  Calls Activity.editActivity on req.body, returns
 *  the activity document edited. Note that req.body
 *  must contain the id of the activity to be edited
 * */
router.put('/editActivity', async function (req, res, next) {
  try {
    const activity = await Activity.editActivity(
      req.body,
      req.body.id,
      req.user.id
    )
    const token = jwt.sign(req.user, SECRET_KEY)
    res.json({
      activity,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token,
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * DELETE deleteActivity/:activity_id
 * Calls Activity.deleteActivity on req.params.activity_id,
 * returns the activity document deleted
 * */
router.delete('/deleteActivity/:activity_id', async function (req, res, next) {
  try {
    const activity = await Activity.getActivity(
      req.params.activity_id,
      req.user.id
    )
    const token = jwt.sign(req.user, SECRET_KEY)
    return res.json({
      activity,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token,
    })
  } catch (err) {
    return next(err)
  }
})
module.exports = router
