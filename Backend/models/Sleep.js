const {InvalidUserError, BadRequestError, NotFoundError, UnauthorizedError, BadDateError} = require('../expressError');
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
const getSleep = async (sleep_id) => {
  try {
    const sleepQuery = await db.query(`
      SELECT 
        sleeps.id AS id,
        day_id,
        start_time,
        end_time,
        success_rating,
        days.user_id AS user_id
      FROM sleeps 
      LEFT JOIN days ON sleeps.day_id=days.id 
      WHERE sleeps.id=$1`, [sleep_id])
    if (sleepQuery.rows.length === 0) { 
      throw new NotFoundError()
    } 
    else return sleepQuery.rows[0];
  } catch(err) {
    throw err;
  }
}
module.exports.getSleep = getSleep;



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



const addSleep = async (sleep_obj, user_id) => {
  try {

    sleep_obj.day_id = sleep_obj.day_id || null;
    sleep_obj.start_time = sleep_obj.start_time || null;
    sleep_obj.end_time = sleep_obj.end_time || null;
    sleep_obj.success_rating = sleep_obj.success_rating || null;


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
    
    db.query(`INSERT INTO sleeps 
      (day_id, start_time, end_time, success_rating) 
      VALUES ($1, $2, $3, $4);`
      , [day_id, start_time, end_time, success_rating])
  } catch(err) {
    throw err;
  }
}
module.exports.addSleep = addSleep;



const editSleep = async (sleep_obj, sleep_id, user_id) => {

  try {

    // make sure that this sleep belongs to this user
    const foundSleep = await getSleep(sleep_id);
    if (!foundSleep) throw new NotFoundError();
    if (foundSleep.user_id !== user_id) throw new InvalidUserError();

    // filter sleep_obj to get only appropriate keys
    // sleep_obj = {
    //   day_id: sleep_obj.day_id ? sleep_obj.day_id : null,
    //   start_time: sleep_obj.start_time ? sleep_obj.start_time : null,
    //   end_time: sleep_obj.end_time ? sleep_obj.end_time : null,
    //   success_rating: sleep_obj.success_rating ? sleep_obj.success_rating : null
    // }

    sleep_obj.day_id = sleep_obj.day_id || null;
    sleep_obj.start_time = sleep_obj.start_time || null;
    sleep_obj.end_time = sleep_obj.end_time || null;
    sleep_obj.success_rating = sleep_obj.success_rating || null;

    const queryArr = dynamicUpdateQuery(sleep_obj, 'sleeps', 'id', sleep_id);

    const sleep = (await db.query(...queryArr)).rows[0];

    return sleep;
    

  } catch(err) {
    throw err;
  }
}
module.exports.editSleep = editSleep;