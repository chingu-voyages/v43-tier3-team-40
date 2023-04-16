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
        column_name: 'heart_beats', // THIS SHOULD BE IGNORED!
        comparison_operator: '>',
        comparison_value: 800
      }
    ]
    const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    expect(query[0]).toBe("SELECT * FROM activities JOIN days ON activities.day_id = days.id WHERE user_id = $1 AND day_id = $2 AND start_time >= $3;");
    expect(query[1]).toEqual(['user-id', 24618, new Date("2020-11-01T00:00:00.000Z")]);
  })


  test("Works with valid activities query 2", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Works with valid activities query 3", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Works with valid meals query 1", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Works with valid meals query 2", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Works with valid meals query 3", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
    // expect(query[0]).toBe("");
    // expect(query[1]).toEqual([]);
  })


  test("Works with valid sleeps query 1", function() {
    // const query_arr = [
    //   {
    //     column_name: '',
    //     comparison_operator: '',
    //     comparison_value: ''
    //   }
    // ]
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
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
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
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
    // const query = dynamicSearchQuery(query_arr, 'activities', user_id);
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