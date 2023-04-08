const jwt = require('jsonwebtoken');

const {SECRET_KEY} = require('../config');
const { UnauthorizedError, InvalidTokenError } = require('../expressError.js');
const User = require('../models/User');


/** Checks for a token, check the token, and if valid, 
 * attaches the user to the req object
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 * @returns 
 */
const checkToken = async (req, res, next) => {
  try {

    // Verify that no user object is already on the request
    req.user = null;

    let token = req.headers['x-token'];
    if (!token) throw new UnauthorizedError();

    const user = await User.checkToken(token);

    // Attach user
    req.user = user;
    return next();

  } catch(err) {
    return next(err);
  }
}

module.exports = checkToken;