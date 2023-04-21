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
    const activity_id = req.params.activity_id
    const activity = await Activity.getActivity(activity_id, req.user.id)
    return res.json({ activity })
  } catch (err) {
    return next(err)
  }
})

router.get('/getActivities', async function (req, res, next) {
  try {
    const activities = await Activity.getActivities(req.user.id)
    return res.json({ activities })
  } catch (err) {
    return next(err)
  }
})
/**
 * @swagger
 * /addActivity:
 *   post:
 *     summary: Add a new activity
 *     tags:
 *       - Activities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day_id:
 *                 type: string
 *                 description: The ID of the day the activity was performed
 *               category:
 *                 type: string
 *                 description: The category of the activity (e.g. "exercise", "meditation", etc.)
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: The start time of the activity in ISO format (e.g. "2023-04-17T09:00:00Z")
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: The end time of the activity in ISO format (e.g. "2023-04-17T10:00:00Z")
 *               intensity:
 *                 type: integer
 *                 description: The intensity level of the activity (1-10)
 *               success_rating:
 *                 type: integer
 *                 description: The success rating of the activity (1-10)
 *     responses:
 *       201:
 *         description: The newly created activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post('/addActivity', async function (req, res, next) {
  try {
    const {
      day_id,
      category,
      start_time,
      end_time,
      intensity,
      success_rating,
    } = req.body
    const activity = await Activity.addActivity(
      day_id,
      category,
      start_time,
      end_time,
      intensity,
      success_rating
    )
    return res.status(201).json({ activity })
  } catch (err) {
    return next(err)
  }
})

router.put('/editActivity/:activity_id', async function (req, res, next) {
  try {
    const activity_id = req.params.activity_id
    const activity = await Activity.editActivity(
      activity_id,
      req.body,
      req.user.id
    )
    return res.json({ activity })
  } catch (err) {
    return next(err)
  }
})

router.delete('/deleteActivity/:activity_id', async function (req, res, next) {
  try {
    const activity_id = req.params.activity_id
    await Activity.deleteActivity(activity_id, req.user.id)
    return res.json({ message: 'Activity deleted' })
  } catch (err) {
    return next(err)
  }
})
