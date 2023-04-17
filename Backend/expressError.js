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

class DuplicateUsernameError extends ExpressError {
  constructor(message="There is already a user registered with this username, please pick another one") {
    super(message, 400);
  }
}
module.exports.DuplicateUsernameError = DuplicateUsernameError; 


class DuplicateEmailError extends ExpressError {
  constructor(message="There is already a user registered with this email address, please log in with that email address or create a new account with another email address.") {
    super(message, 400);
  }
}
module.exports.DuplicateEmailError = DuplicateEmailError; 


class BadUsernameError extends ExpressError {
  constructor(message="Please enter a valid username. Usernames must be at least 6 characters long, and can contain lowercase characters, uppercase characters, and numbers") {
    super(message, 400);
  }
}
module.exports.BadUsernameError = BadUsernameError; 


class BadEmailError extends ExpressError {
  constructor(message="Please enter a valid email address") {
    super(message, 400);
  }
}
module.exports.BadEmailError = BadEmailError; 


class BadPasswordError extends ExpressError {
  constructor(message="Please make sure that your password is at least six characters") {
    super(message, 400);
  }
}
module.exports.BadPasswordError = BadPasswordError; 


class BadDateError extends ExpressError {
  constructor(message="Please make sure to include a valid time/date") {
    super(message, 400);
  }
}
module.exports.BadDateError = BadDateError;

/** UNAUTHORIZED 401 STATUS ERRORS */

class UnauthorizedError extends ExpressError {
  constructor(message="Cannot proceed, please log in and try again") {
    super(message, 401)
  }
}
module.exports.UnauthorizedError = UnauthorizedError;


class InvalidTokenError extends ExpressError {
  constructor(message="Cannot proceed, please log in and try again") {
    super(message, 401)
  }
}
module.exports.InvalidTokenError = InvalidTokenError;


class InvalidUserError extends ExpressError {
  constructor(message="Invalid user") {
    super(message, 401)
  }
}
module.exports.InvalidUserError = InvalidUserError;

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