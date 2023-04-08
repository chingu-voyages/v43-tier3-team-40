const { Router } = require('express');
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config.js');

const { ExpressError, BadRequestError } = require('../expressError.js');
const User = require('../models/User');
const checkToken = require('../middleware/checkToken.js');


const router = new Router();


router.get('/test', (req, res, next) => {
  res.send("Hello users!")
})

/** POST users/createUser
 * 
 * req.body must include username, email, and
 * password. Successful creation will lead to
 * a response with a token
 */
router.post('/createUser', async (req, res, next) => {
  try {
    console.log(req.body);
    const {username, email, password} = req.body;
    let user = await User.createUser(username, email, password);
    const token = jwt.sign({
      username: user.username,
      email: user.email,
      id: user.id 
    }, SECRET_KEY)
    res.status(201);
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token
    });
  } catch(err) {
    return next(err);
  }
})



router.post('/login', async (req, res, next) => {
  try {
    const {username, password} = req.body;

    const user = await User.login(username, password);
    const token = jwt.sign(user, SECRET_KEY);
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token
    })

  } catch(err) {
    return next(err);
  }
})



router.get('/renew', checkToken, async (req, res, next) => {
  try {
    const token = jwt.sign(req.user, SECRET_KEY);
    return res.json({
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