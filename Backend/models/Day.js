const {InvalidUserError, BadRequestError} = require('../expressError');
const db = require('../db');

/**
 * 
 * @param {Date} date 
 * @param {uuid} user_id 
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


