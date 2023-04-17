const { BadRequestError } = require("../expressError");

const ACTIVITIES = 'activities';
const MEALS = 'meals';
const SLEEPS = 'sleeps';


// TABLE SUMMARY:
// id SERIAL PRIMARY KEY,
// day_id INTEGER REFERENCES days (id) ON DELETE CASCADE,
// category VARCHAR,
// start_time TIMESTAMPTZ,
// end_time TIMESTAMPTZ,
// intensity INTEGER,
// success_rating INTEGER,
const filterActivityQuery = (query_arr) => {
  return query_arr.filter(el => {
    // comparable as numbers
    if (['id', 'day_id', 'start_time', 'end_time', 'intensity', 'success_rating'].includes(el.column_name)) {
      if (['>', '>=', '=', '<' , '<='].includes(el.comparison_operator)) {
        if (el.comparison_value) return true;
      } else return false;
    } 
    // comparable as text
    else if (['category'].includes(el.column_name)) {
      if (['ILIKE', 'IS NULL', 'IS NOT NULL'].includes(el.comparison_operator)) {
        if (typeof el.comparison_value === "string") return true;
        else return false;
      } else return false;
    } 
    else return false;

  })
}

// TABLE SUMMARY:
// day_id INTEGER REFERENCES days(id) ON DELETE CASCADE,
// calories INTEGER,
// carbs INTEGER,
// protein INTEGER,
// fat INTEGER,
// dietary_restrictions VARCHAR,
// time TIMESTAMPTZ
const filterMealQuery = (query_arr) => {
  return query_arr.filter(el => {
    // comparable as numbers
    if (['id', 'day_id', 'calories', 'carbs', 'protein', 'fat', 'time'].includes(el.column_name)) {
      if (['>', '>=', '=', '<' , '<='].includes(el.comparison_operator)) {
        if (el.comparison_value) return true;
      } else return false;
    } 
    // comparable as text
    else if (['dietary_restrictions'].includes(el.column_name)) {
      if (['ILIKE', 'IS NULL', 'IS NOT NULL'].includes(el.comparison_operator)) {
        if (typeof el.comparison_value === "string") return true;
        else return false;
      } else return false;
    } 
    else return false;

  })
}


// TABLE SUMMARY:
// id SERIAL PRIMARY KEY,
// day_id INTEGER REFERENCES days (id) ON DELETE CASCADE,
// start_time TIMESTAMPTZ,
// end_time TIMESTAMPTZ,
// success_rating INTEGER,
const filterSleepQuery = (query_arr) => {
  return query_arr.filter(el => {
    // comparable as numbers
    if (['id', 'day_id', 'start_time', 'end_time', 'success_rating'].includes(el.column_name)) {
      if (['>', '>=', '=', '<' , '<='].includes(el.comparison_operator)) {
        if (el.comparison_value) return true;
      } else return false;
    } 
    else return false;

  })
}


/**
 * Takes an array of queries, determines the correct function
 * to call for filtering them, then calls it, returning a
 * filtered version of the array with only permissible 
 * query objects
 * @param {Array} query_arr 
 * @param {String} table_name 
 * @returns {filter}
 */
const filterValidQuery = (query_arr, table_name) => {
  const queryFilters = {}
  queryFilters[ACTIVITIES] = filterActivityQuery;
  queryFilters[MEALS] = filterMealQuery;
  queryFilters[SLEEPS] = filterSleepQuery;

  if (queryFilters[table_name]) {
    return queryFilters[table_name](query_arr)
  } else {
    throw new BadRequestError();
  }

}


/**
 * Takes an array of query objects, the name of the
 * table to check, and the user_id. Calls the correct
 * filter function to get a filtered and permissible 
 * array of queries (no invalid column names or operations)
 * and then puts all information together to generate an
 * array with the query string and the query values to use
 * @param {Array} query_arr 
 * @param {String} table_name 
 * @param {UUID} user_id 
 * @returns {[filterQueryString, filterQueryValues]}
 */
const dynamicSearchQuery = (query_arr, table_name, user_id) => {
  let query_str = `SELECT * FROM ${table_name} JOIN days ON ${table_name}.day_id = days.id WHERE `
  let value_arr = [user_id];

  query_arr = filterValidQuery(query_arr, table_name);

  const wheres = ['user_id = $1']

  query_arr.forEach((obj, i)  => {
    let new_where = ''
    new_where += `${obj.column_name} `
    new_where += `${obj.comparison_operator} `
    
    new_where += `$${[i+2]}` // array is 1-indexed, also user_id goes first

    wheres.push(new_where);
    value_arr.push(obj.comparison_value);

  });


  stringified_wheres = wheres.join(' AND ');

  query_str += stringified_wheres;
  query_str += ';';
  return [query_str, value_arr];
}
module.exports = dynamicSearchQuery;



