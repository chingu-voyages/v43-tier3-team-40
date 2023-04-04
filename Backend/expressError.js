/** Base ExpressError class
 * 
 * Goal of giving a repeatable standard that can be easily
 * generated across the app and passed in a response when
 * appropriate, giving both a message and a status code. 
 * These can also be referenced directly in testing to 
 * ensure that the correct error is being passed. Messages
 * can be overwritten as desired when called, though best
 * practice is to add a new ExpressError here for whatever
 * situation is called for so as to have a descriptive 
 * reference.
 */
class ExpressError extends Error {
  constructor(message, status_code) {
    super();
    this.message = message;
    this.status_code = status_code;
  }
}
module.exports.ExpressError = ExpressError;



/** BAD REQUEST 400 STATUS ERRORS */

class BadRequestError extends ExpressError {
  constructor(message="Bad Request, please check your input and try again") {
    super(message, 400);
  }
}
module.exports.BadRequestError = BadRequestError;



/** UNAUTHORIZED 401 STATUS ERRORS */

class UnauthorizedError extends ExpressError {
  constructor(message="Cannot proceed, please log in and try again") {
    super(message, 401)
  }
}
module.exports.UnauthorizedError = UnauthorizedError;

class BadLoginError extends ExpressError {
  constructor(message="Login failed, please try again") {
    super(message, 401)
  }
}
module.exports.BadLoginError = BadLoginError;



/** FORBIDDEN 403 STATUS ERRORS */

class ForbiddenError extends ExpressError {
  constructor(message="You do not have permission to make this request") {
    super(message, 403);
  }
}
module.exports.ForbiddenError = ForbiddenError;



/** NOT FOUND 404 STATUS ERRORS */

class NotFoundError extends ExpressError {
  constructor(message="Resource not found") {
    super(message, 404);
  }
}
module.exports.NotFoundError = NotFoundError;



/** METHOD NOT ALLOWED 405 STATUS ERRORS */

class MethodNotAllowedError extends ExpressError {
  constructor(message="Request method not allowed on this endpoint, please check and try again") {
    super(message, 405);
  }
}
module.exports.MethodNotAllowedError = MethodNotAllowedError;



/** INTERNAL SERVER ERROR 500 STATUS ERRORS */

class InternalServerError extends ExpressError {
  constructor(message="Internal Server Error, please try again") {
    super(message, 500);
  }
}
module.exports.InternalServerError = InternalServerError;