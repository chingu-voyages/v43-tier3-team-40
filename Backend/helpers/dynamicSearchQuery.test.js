const { BadRequestError } = require('../expressError');
const dynamicSearchQuery = require('./dynamicSearchQuery');


/**
TEMPLATE
{
  column_name: '',
  comparison_operator: '',
  comparison_value: ''
}
 */

// standard to use across all tests, actual queries not tested here
const user_id = 'user-id'

describe("Generates the correct query strings and value arrays", function(){

  test("Works with valid activities query 1", function() {
    const query_arr = [
      {
        column_name: 'day_id',
        comparison_operator: '=',
        comparison_value: 24618
      },
      {
        column_name: 'start_time',
        comparison_operator: '>=',
        comparison_value: new Date('10-31-2020 5:00 PM')
      },
      {
        column_name: 'heart_beats', // THIS SHOULD BE FILTERED OUT!
        comparison_operator: '>',
        comparison_value: 800
      }
    ]
    const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    expect(query[0]).toBe("SELECT * FROM activities JOIN days ON activities.day_id = days.id WHERE user_id = $1 AND day_id = $2 AND start_time >= $3;");
    expect(query[1]).toEqual(['user-id', 24618, new Date("2020-11-01T00:00:00.000Z")]);
  })


  test("Works with valid activities query 2", function() {
    const query_arr = [
    ]
    const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    expect(query[0]).toBe("SELECT * FROM activities JOIN days ON activities.day_id = days.id WHERE user_id = $1;");
    expect(query[1]).toEqual([user_id]);
  })


  test("Works with valid activities query 3", function() {
    const query_arr = [
			{
				column_name: 'id',
				comparison_operator: '>',
				comparison_value: 10
    	},
			{
				column_name: 'day_id',
				comparison_operator: '=',
				comparison_value: 123
    	},
			{
				column_name: 'category',
				comparison_operator: 'ILIKE',
				comparison_value: 'run'
    	},
			{
				column_name: 'start_time',
				comparison_operator: '>=',
				comparison_value: new Date(10-31-2020)
    	},
			{
				column_name: 'end_time',
				comparison_operator: '<=',
				comparison_value: new Date(11-6-2020)
    	},
			{
				column_name: 'intensity',
				comparison_operator: '>',
				comparison_value: 3
    	},
			{
				column_name: 'intensity',
				comparison_operator: 'ILIKE',  // THIS SHOULD FILTER OUT
				comparison_value: ''
    	},
			{
				column_name: 'success_rating',
				comparison_operator: '>',
				comparison_value: 5
    	},
			{
				column_name: 'success_rating',
				comparison_operator: '<=',
				comparison_value: 10
    	}
    ]
    const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    expect(query[0]).toBe("SELECT * FROM activities JOIN days ON activities.day_id = days.id WHERE user_id = $1 AND id > $2 AND day_id = $3 AND category ILIKE $4 AND start_time >= $5 AND end_time <= $6 AND intensity > $7 AND success_rating > $8 AND success_rating <= $9;");
    expect(query[1]).toEqual([user_id, 10, 123, 'run', new Date(10-31-2020), new Date(11-6-2020), 3, 5, 10]);
  })


  test("Works with valid meals query 1", function() {
    const query_arr = [
    ]
    const query = dynamicSearchQuery(query_arr, 'meals', user_id);
    expect(query[0]).toBe("SELECT * FROM meals JOIN days ON meals.day_id = days.id WHERE user_id = $1;");
    expect(query[1]).toEqual([user_id]);
  })


  test("Works with valid meals query 2", function() {
    const query_arr = [
      {
        column_name: 'id',
        comparison_operator: '=',
        comparison_value: 15
      },
			{
        column_name: 'calories',
        comparison_operator: '>=',
        comparison_value: 100
      },
			{
        column_name: 'carbs',
        comparison_operator: '>',
        comparison_value: 20
      }
    ]
    const query = dynamicSearchQuery(query_arr, 'meals', user_id);
    expect(query[0]).toBe("SELECT * FROM meals JOIN days ON meals.day_id = days.id WHERE user_id = $1 AND id = $2 AND calories >= $3 AND carbs > $4;");
    expect(query[1]).toEqual([user_id, 15, 100, 20]);
  })


  test("Works with valid meals query 3", function() {
    const query_arr = [
      {
        column_name: 'id',
        comparison_operator: '=',
        comparison_value: 30
      },
			{
        column_name: 'day_id',
        comparison_operator: '<',
        comparison_value: 500
      },
			{
        column_name: 'calories',
        comparison_operator: '>',
        comparison_value: 750 
      },
			{
        column_name: 'carbs',
        comparison_operator: '==', // SHOULD FILTER OUT
        comparison_value: 30
      },
			{
        column_name: 'carbs',
        comparison_operator: '=',
        comparison_value: 30
      },
			{
        column_name: 'protein',
        comparison_operator: '<',
        comparison_value: 15
      },
			{
        column_name: 'fat',
        comparison_operator: '>',
        comparison_value: 20
      },
			{
        column_name: 'dietary_restrictions',
        comparison_operator: 'IS NULL',
        comparison_value: ''
      },
			{
        column_name: 'time',
        comparison_operator: '>',
        comparison_value: new Date('10-31-2020 8:00 PM')
      }
    ]
    const query = dynamicSearchQuery(query_arr, 'meals', user_id);
    expect(query[0]).toBe("SELECT * FROM meals JOIN days ON meals.day_id = days.id WHERE user_id = $1 AND id = $2 AND day_id < $3 AND calories > $4 AND carbs = $5 AND protein < $6 AND fat > $7 AND dietary_restrictions IS NULL $8 AND time > $9;");
    expect(query[1]).toEqual([user_id, 30, 500, 750, 30, 15, 20, '', new Date('10-31-2020 8:00 PM')]);
  })


  test("Works with valid sleeps query 1", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'sleeps', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Works with valid sleeps query 2", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'sleeps', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Works with valid sleeps query 3", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'sleeps', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Invalid table name throws BadRequestError", function() {
    const query_arr = [
      {
        column_name: 'id',
        comparison_operator: '<',
        comparison_value: 10000
      }
    ]
    function badTable() {
      dynamicSearchQuery(query_arr, 'bad_table', user_id)
    }
    expect(badTable).toThrow();
  })

})