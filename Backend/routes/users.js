const { Router } = require('express');
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config.js');

const { ExpressError, BadRequestError } = require('../expressError');
const { createUser } = require('../models/User');

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
    let user = await createUser(username, email, password);
    const token = jwt.sign({
      username: user.username,
      email: user.email,
      id: user.id 
    }, SECRET_KEY)
    res.status(201);
    return res.json({
      username: user.username,
      email: user.email,
      token
    });
  } catch(err) {
    return next(err);
  }
})

module.exports = router;