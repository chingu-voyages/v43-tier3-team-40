const { Router } = require('express');
const jwt = require('jsonwebtoken');

const checkToken = require('../middleware/checkToken');
const Sleep = require('../models/Sleep');
const {SECRET_KEY} = require('../config.js');

const router = new Router();

// all routes are protected
router.use(checkToken);


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
http://localhost:3000/sleeps/getSleeps?
0[column_name]=id
&0[comparison_operator]=%3E
&0[comparison_value]=625
&1[column_name]=id
&1[comparison_operator]=%3C
&1[comparison_value]=627

http://localhost:3000/sleeps/getSleeps?0[column_name]=id&0[comparison_operator]=%3E&0[comparison_value]=625&1[column_name]=id&1[comparison_operator]=%3C&1[comparison_value]=627
*/

router.post('/addSleep', async (req, res, next) => {
  try {

  } catch (err) {
    return next(err)
  }
})

router.put('/editSleep', async (req, res, next) => {
  try {

  } catch (err) {
    return next(err)
  }
})


router.delete('/deleteSleep', async (req, res, next) => {
  try {

  } catch (err) {
    return next(err)
  }
})

module.exports = router;