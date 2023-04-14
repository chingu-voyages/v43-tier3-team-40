const { Router } = require('express');
const jwt = require('jsonwebtoken');

const checkToken = require('../middleware/checkToken');
const Day = require('../models/Day');
const {SECRET_KEY} = require('../config.js');

const router = new Router();


// all routes are protected
router.use(checkToken);

/**
 * POST /addDay
 * WARNING: THE TIME POSTED MUST INCLUDE A TIMEZONE
 * OFFSET SO THAT Date.parse() WILL READ THE CORRECT
 * DATE RELATIVE TO THE USER
 * 
 * Calls Day.addDay with the date passed through the
 * request body and the user id stored in the request
 * after checking the token
 */
router.post('/addDay', async (req, res, next) => {
  try {
    const newDay = await Day.addDay(req.body.date, req.user.id)
    const token = jwt.sign(req.user, SECRET_KEY);
    return res.json({
      day: newDay,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token
    });
  } catch(err) {
    return next(err);
  }
})


/**
 * POST /addDay
 * WARNING: THE TIME IN THE PARAM MUST INCLUDE A TIMEZONE
 * OFFSET SO THAT Date.parse() WILL READ THE CORRECT
 * DATE RELATIVE TO THE USER
 * 
 * Calls Day.getFullDay with the date passed through the
 * request parameter and the user id stored in the request
 * after checking the token
 */
router.get('/getFullDay/:date', async (req, res, next) => {
  try {

    const fullDay = await Day.getFullDay(req.params.date, req.user.id);
    const token = jwt.sign(req.user, SECRET_KEY);
    return res.json({
      day: fullDay,
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      token
    });
  } catch(err) {
    return next(err);
  }
})

module.exports = router;