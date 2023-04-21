const { Router } = require('express')
const jwt = require('jsonwebtoken')

const checkToken = require('../middleware/checkToken')
const Activity = require('../models/Activity')
const { SECRET_KEY } = require('../config.js')

const router = new Router()

// all routes are protected
router.use(checkToken)

/**
 * @swagger
 * activities/getActivity/{activity_id}:
 *   get:
 *     summary: Get an activity by its ID
 *     description: Retrieve the details of an activity by providing its ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: activity_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the activity to retrieve
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       '404':
 *         description: Activity not found
 *       '500':
 *         description: Internal server error
 */
router.get('/getActivity/:activity_id', async function (req, res, next) {
  try {
    const activity_id = req.params.activity_id
    const activity = await Activity.getActivity(activity_id, req.user.id)
    return res.json({ activity })
  } catch (err) {
    return next(err)
  }
})

/**
 * @swagger
 * activities/getActivities:
 *   get:
 *     summary: Retrieve all activities associated with a user
 *     tags:
 *       - Activities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of activities associated with the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
 * @swagger
 * activities/addActivity:
 *   post:
 *     summary: Add a new activity for the current user
 *     tags: [Activities]
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
 *                 type: integer
 *                 description: The ID of the day to add the activity to
 *               category:
 *                 type: string
 *                 description: The category of the activity
 *               start_time:
 *                 type: string
 *                 description: The start time of the activity in the format 'YYYY-MM-DD HH:mm:ss'
 *               end_time:
 *                 type: string
 *                 description: The end time of the activity in the format 'YYYY-MM-DD HH:mm:ss'
 *               intensity:
 *                 type: integer
 *                 description: The intensity level of the activity, between 1 and 10
 *               success_rating:
 *                 type: integer
 *                 description: The success rating of the activity, between 1 and 10
 *             example:
 *               day_id: 1
 *               category: "Exercise"
 *               start_time: "2023-04-18 10:00:00"
 *               end_time: "2023-04-18 11:00:00"
 *               intensity: 7
 *               success_rating: 8
 *     responses:
 *       200:
 *         description: The newly created activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   $ref: '#/components/schemas/Activity'
 *                 id:
 *                   type: integer
 *                   description: The ID of the current user
 *                 username:
 *                   type: string
 *                   description: The username of the current user
 *                 email:
 *                   type: string
 *                   description: The email of the current user
 *                 token:
 *                   type: string
 *                   description: A JWT token to be used for subsequent requests
 *       400:
 *         description: Bad request, the activity could not be created
 *       401:
 *         description: Unauthorized, missing or invalid authentication token
 *       500:
 *         description: Internal server error
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
 * @swagger
 * activities/editActivity:
 *   put:
 *     summary: Update an existing activity
 *     tags:
 *       - Activities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityUpdate'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   $ref: '#/components/schemas/Activity'
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: The username of the authenticated user
 *                 email:
 *                   type: string
 *                   description: The email address of the authenticated user
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated user
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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
    const activity_id = req.params.activity_id
    await Activity.deleteActivity(activity_id, req.user.id)
    return res.json({ message: 'Activity deleted' })
  } catch (err) {
    return next(err)
  }
})
module.exports = router
