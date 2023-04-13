const {InvalidUserError, BadRequestError, NotFoundError} = require('../expressError');
const db = require('../db');

/**
 * Checks for a document in the days table with the
 * given date and user_id. If it exists, then it is
 * returned. If not, then it is created and returned.
 * @param {Date} date 
 * @param {uuid} user_id 
 * @returns {day}
 */
const addDay = async (date, user_id) => {
  try {
    const checkQuery = await db.query(
      `SELECT * FROM days WHERE date=$1 AND user_id=$2;`,
      [date, user_id]);
    if (checkQuery.rows.length === 0) {
      const addQuery = await db.query(`INSERT INTO days (date, user_id) 
      VALUES ($1, $2)
      RETURNING *;`, 
      [date, user_id]);
      return addQuery.rows[0]
    }
    else return checkQuery.rows[0]
  } catch(err) {
    if (err.message.slice(0,20) === 'invalid input syntax') {
      throw new BadRequestError();
    }
    else if (err.message = 'error: insert or update on table "days" violates foreign key constraint "days_user_id_fkey"') {
      throw new InvalidUserError();
    }
    else throw err;
  }
}
module.exports.addDay = addDay;


/**
 * Checks for a day with the given date
 * and returns it if it exists, otherwise
 * throws a NotFoundError.
 * @param {Date} date 
 * @param {uuid} user_id 
 * @returns {day}
 */
const getDay = async (date, user_id) => {
  try {
    const dayQuery = await db.query(
      `SELECT * FROM days WHERE date=$1 AND user_id=$2`,
      [date, user_id]
    )
    if (dayQuery.rows.length !== 1) {
      throw new NotFoundError();
    }
    else return dayQuery.rows[0];
  } catch(err) {
    throw err;
  }
}
module.exports.getDay = getDay;


/**
 * Checks if a day document exists, and if it does, returns an
 * object that contains all activities, meals, and sleeps
 * associated with that day
 * 
 * @param {Date} date 
 * @param {uuid} user_id 
 * @returns {Object} object with three arrays: 
 * activities, meals, sleeps
 */
const getFullDay = async (date, user_id) => {
  try {
    const day = await getDay(date, user_id);
    const day_id = day.id;

    const activitiesQuery = db.query(`SELECT * FROM activities WHERE day_id=$1;`, [day_id])
    const mealsQuery = db.query(`SELECT * FROM meals WHERE day_id=$1;`, [day_id])
    const sleepsQuery = db.query(`SELECT * FROM sleeps WHERE day_id=$1;`, [day_id])

    const [activitiesAnswer, mealsAnswer, sleepsAnswer] = await Promise.all([activitiesQuery, mealsQuery, sleepsQuery])

    return({
      activities: activitiesAnswer.rows,
      meals: mealsAnswer.rows,
      sleeps: sleepsAnswer.rows 
    })

  } catch(err) {
    throw err;
  }
}
module.exports.getFullDay = getFullDay;