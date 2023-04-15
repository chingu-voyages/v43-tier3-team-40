const {InvalidUserError, BadRequestError, NotFoundError} = require('../expressError');
const db = require('../db');


/**
 * Checks for a document in the sleeps table with
 * the given sleep_id and returns it if it exists,
 * otherwise throws a NotFoundError
 * @param {Number} sleep_id 
 * @returns {sleep}
 */
const getSleep = async (sleep_id) => {
  try {
    const sleepQuery = await db.query(`SELECT * FROM sleeps WHERE id=$1`, [sleep_id])
    if (sleepQuery.rows.length === 0) { 
      throw new NotFoundError()
    } 
    else return sleepQuery.rows[0];
  } catch(err) {
    throw err;
  }
}
module.exports.getSleep = getSleep;



const getSleeps = async (searchObj) => {
  try {

  } catch(err) {

  }
}