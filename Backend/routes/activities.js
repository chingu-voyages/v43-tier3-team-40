const { Router } = require('express')
const jwt = require('jsonwebtoken')

const checkToken = require('../middleware/checkToken')
const Activity = require('../models/Activity')
const { SECRET_KEY } = require('../config.js')

const router = new Router()

// all routes are protected
router.use(checkToken)


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
