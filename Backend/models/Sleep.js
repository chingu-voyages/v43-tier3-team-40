const {NotFoundError, UnauthorizedError, BadDateError} = require('../expressError');
const dynamicSearchQuery = require('../helpers/dynamicSearchQuery');
const dynamicUpdateQuery = require('../helpers/dynamicUpdateQuery');
const db = require('../db');
const Day = require('./Day');


/**
 * Checks for a document in the sleeps table with
 * the given sleep_id and returns it if it exists,
 * otherwise throws a NotFoundError
 * @param {Number} sleep_id 
 * @returns {sleep}
 */
const getSleep = async (sleep_id, user_id) => {
  try {
    const sleep = (await db.query(`
      SELECT 
        sleeps.id AS id,
        day_id,
        start_time,
        end_time,
        success_rating,
        days.user_id AS user_id
      FROM sleeps 
      LEFT JOIN days ON sleeps.day_id=days.id 
      WHERE sleeps.id = $1 AND days.user_id = $2;`
      , [sleep_id, user_id])).rows[0]
    
    
    if (!sleep) throw new NotFoundError();
    else return sleep;
  } catch(err) {
    throw err;
  }
}
module.exports.getSleep = getSleep;


/**
 * Takes an array of queries and a user id, converts
 * them into an SQL query through dynamicSearchQuery
 * and returns the results. The search query must be
 * an array of objects with each object having three 
 * keys: 'column_name', 'comparison_operator', and 
 * 'comparison_value'
 * @param {Array} query_arr 
 * @param {UUID} user_id 
 * @returns {sleeps}
 */
const getSleeps = async (query_arr, user_id) => {
  try {
    const query = dynamicSearchQuery(query_arr, 'sleeps', user_id);
    const get_sleeps = await db.query(...query);
    return get_sleeps.rows;
  } catch(err) {
    throw err;
  }
}
module.exports.getSleeps = getSleeps;


/**
 * Takes a sleep object, parses it to set the
 * correct keys, checks if the correct day 
 * document exists to add the sleep to, then adds
 * the sleep to that day or to a new day that is 
 * created, returning the sleep document
 * @param {Object} sleep_obj_in
 * @param {UUID} user_id 
 * @returns {sleep}
 */
const addSleep = async (sleep_obj_in, user_id) => {
  try {
    const sleep_obj = {
      day_id : sleep_obj_in.day_id || null,
      start_time : sleep_obj_in.start_time || null,
      end_time : sleep_obj_in.end_time || null,
      success_rating : sleep_obj_in.success_rating || null,
    }

    // need to make sure day exists and belongs to user_id
    if (sleep_obj.day_id) {
      const day = (await db.query(`SELECT * FROM days WHERE id = $1;`, [sleep_obj.day_id])).rows[0];
      if (day?.user_id !== user_id) throw new UnauthorizedError();
      // else proceed
    } else {
      if (sleep_obj.start_time) {
        let day = await Day.addDay(sleep_obj.start_time, user_id);
        sleep_obj.day_id = day.id;
      } else throw new BadDateError();
    }

    const {day_id, start_time, end_time, success_rating} = sleep_obj;
    
    const sleep = (await db.query(`INSERT INTO sleeps 
      (day_id, start_time, end_time, success_rating) 
      VALUES ($1, $2, $3, $4) RETURNING *;`
      , [day_id, start_time, end_time, success_rating])).rows[0];
    return sleep;

  } catch(err) {
    throw err;
  }
}
module.exports.addSleep = addSleep;


/**
 * Takes an object of desired edits to make to a sleep,
 * the id of the sleep to edit, and a user_id. First looks for
 * the sleep to make sure that it exists and belongs to that user,
 * then cleans the sleep object to get the correct keys, then
 * makes the edits and returns the sleep.
 * @param {Object} sleep_obj_in 
 * @param {Number} sleep_id 
 * @param {UUID} user_id 
 * @returns {sleep}
 */
const editSleep = async (sleep_obj_in, sleep_id, user_id) => {

  try {

    // make sure that this sleep belongs to this user
    const foundSleep = await getSleep(sleep_id, user_id);
    if (!foundSleep) throw new NotFoundError();

    // filter sleep_obj to get only appropriate keys
    const sleep_obj = {
      day_id : sleep_obj_in.day_id || null,
      start_time : sleep_obj_in.start_time || null,
      end_time : sleep_obj_in.end_time || null,
      success_rating : sleep_obj_in.success_rating || null,
    }

    const queryArr = dynamicUpdateQuery(sleep_obj, 'sleeps', 'id', sleep_id);
    const sleep = (await db.query(...queryArr)).rows[0];

    return sleep;
    
  } catch(err) {
    throw err;
  }
}
module.exports.editSleep = editSleep;


/**
 * Takes a sleep_id and a user_id, checks for
 * the sleep and to make sure it belongs to the
 * user. If so, deletes and returns the sleep.
 * @param {Number} sleep_id 
 * @param {UUID} user_id 
 * @returns 
 */
const deleteSleep = async (sleep_id, user_id) => {
  try {
    // make sure that this sleep belongs to this user
    const foundSleep = await getSleep(sleep_id, user_id);
    if (!foundSleep) throw new NotFoundError();

    const deleted_sleep = (await db.query(`DELETE FROM sleeps WHERE id = $1 RETURNING *;`, [sleep_id])).rows[0];
    return deleted_sleep;

  } catch(err) {
    throw err;
  }
}
module.exports.deleteSleep = deleteSleep;