const ACTIVITIES = 'activities';
const MEALS = 'meals';
const SLEEPS = 'sleeps';


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
        if (el.comparison_value instanceof String) return true;
        else return false;
      } else return false;
    } 
    else return false;

  })
}


const filterMealQuery = (query_arr) => {

}

const filterSleepQuery = (query_arr) => {

}

const filterValidQuery = (query_arr, table_name) => {
  const queryFilters = {}
  queryFilters[ACTIVITIES] = filterActivityQuery;
  queryFilters[MEALS] = filterMealQuery;
  queryFilters[SLEEPS] = filterSleepQuery;


}



const dynamicSearchQuery = (query_arr, table_name, user_id) => {
  let query_str = `SELECT * FROM ${table_name} LEFT JOIN days ON ${table_name}.day_id WHERE days.user_id=$1`
  let value_arr = [user_id];

  query_arr = filterValidQuery(query_arr, table_name)

  query_arr.forEach((obj, i)  => {
    query_str += `${obj[column_name]} `
    query_str += `${obj[comparison_operator]} `
    query_str += `$${obj[i+2]}` // array is 1-indexed, also user_id goes first
    value_arr.push(obj[comparison_value]);

    if (i === query_arr.length) {
      query_str += ';'
    } else {
      query_str == ' AND '
    }

  });


  query_str += ';';
  return [query_str, value_arr];
}
module.exports = dynamicSearchQuery;




/** 
dynamicSearchQuery = require('./helpers/dynamicSearchQuery')
arr = dynamicSearchQuery([], 'sleeps')


query_arr = [
  {
    column_name: 
    comparison_operator:
    comparison_value:
  }
]


query_arr = [
  {
    column_name: "day_id",
    comparison_operator: ">",
    comparison_value: 10
  },
  {
    column_name: "day_id",
    comparison_operator: "IS NULL",
    comparison_value: 10
  },
  {
    column_name: "day_id",
    comparison_operator: "IS NULL",
    comparison_value: undefined
  },
  {
    column_name: "user_id",
    comparison_operator: "IS NULL",
    comparison_value: undefined
  }
]
*/
