const { BadRequestError } = require("../expressError");

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
        if (typeof el.comparison_value === "string") return true;
        else return false;
      } else return false;
    } 
    else return false;

  })
}

// id SERIAL PRIMARY KEY,
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
