const db = require('../db');
const User = require('./User');
const Day = require('./Day');
const Meal = require('./Meal');

const { UnauthorizedError, NotFoundError, BadDateError } = require('../expressError');

let testUser1;
let testUser2;
let testUser3;
let tu1d1;
let fm_calories = 430;
let fm_carbs = 56;
let fm_protein = 20;
let fm_fat = 7;
let fm_dietary_restrictions = "Shrimp Creamy Tom Yum Flavor Ramen";
let fm_time = new Date("2023-04-01 20:00")

// easier way of checking when going through high volume
function checkMeal(meal, id, day_id, calories, carbs, protein, fat, dietary_restrictions, time, user_id) {
  if (id === undefined) {
		expect(meal).toHaveProperty('id');
	} else expect(meal).toHaveProperty('id', id);

	if (day_id === undefined) {
		expect(meal).toHaveProperty('day_id');
	} else expect(meal).toHaveProperty('day_id', day_id);

	if (calories === undefined) {
		expect(meal).toHaveProperty('calories');
	} else expect(meal).toHaveProperty('calories', calories);

	if (carbs === undefined) {
		expect(meal).toHaveProperty('carbs');
	} else expect(meal).toHaveProperty('carbs', carbs);

	if (protein === undefined) {
		expect(meal).toHaveProperty('protein');
	} else expect(meal).toHaveProperty('protein', protein);

	if (fat === undefined) {
		expect(meal).toHaveProperty('fat');
	} else expect(meal).toHaveProperty('fat', fat);

	if (dietary_restrictions === undefined) {
		expect(meal).toHaveProperty('dietary_restrictions');
	} else expect(meal).toHaveProperty('dietary_restrictions', dietary_restrictions);

	if (time === undefined) {
		expect(meal).toHaveProperty('time');
	} else expect(meal).toHaveProperty('time', time);

	if (user_id === undefined) {
		expect(meal).toHaveProperty('user_id');
	} else expect(meal).toHaveProperty('user_id', user_id);
}

beforeAll(async () => {
	await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`);
	testUser1 = await User.createUser('testUser1', 'testUser1@email.com', 'password123');
  testUser2 = await User.createUser('testUser2', 'testUser2@email.com', 'password123');
  testUser3 = await User.createUser('testUser3', 'testUser3@email.com', 'password123');

	tu1d1 = await Day.addDay(new Date("2023-04-01T08:00:00.000Z"), testUser1.id);

	// first meal manually inserted
	first_meal = (await db.query(`INSERT INTO meals (day_id, calories, carbs, protein, fat, dietary_restrictions, time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, [
		tu1d1.id,
		fm_calories,
		fm_carbs,
		fm_protein,
		fm_fat,
		fm_dietary_restrictions,
		fm_time,
	])).rows[0]
})

afterAll(async () => {
	await db.end();
})


describe("Successfully retrieves Meal with getMeal", function() {


	test("testUser1 successfully retrieves initial meal", async () => {
		const meal = await Meal.getMeal(first_meal.id, testUser1.id);
		expect(meal).toHaveProperty('id');
		expect(meal).toHaveProperty('day_id', tu1d1.id);
		expect(meal).toHaveProperty('calories', fm_calories);
		expect(meal).toHaveProperty('carbs', fm_carbs);
		expect(meal).toHaveProperty('protein', fm_protein);
		expect(meal).toHaveProperty('fat', fm_fat);
		expect(meal).toHaveProperty('dietary_restrictions', fm_dietary_restrictions);
		expect(meal).toHaveProperty('time', fm_time);
	})


	test("Throws NotFoundError when testUser2 tries to retrieve testUser1's meal", async () => {
		await expect(Meal.getMeal(first_meal.id, testUser2.id)).rejects.toThrow(NotFoundError);
	})


	test("Throws NotFoundError when testUser1 tries to retrieve nonexistent meal", async () => {
		await expect(Meal.getMeal(99999999, testUser1.id)).rejects.toThrow(NotFoundError);
	})

});



describe("Successfully adds Meal with addMeal", function() {

	test("testUser1 can add a meal to a given day", async () => {
		day = await Day.addDay(new Date("2023-04-02T08:00:00.000Z"), testUser1.id);
		const meal = await Meal.addMeal({
			day_id: day.id,
			calories: 720
		}, testUser1.id)
		expect(meal).toHaveProperty('id');
		expect(meal).toHaveProperty('day_id', day.id);
		expect(meal).toHaveProperty('calories', 720);
		expect(meal).toHaveProperty('carbs', null);
		expect(meal).toHaveProperty('protein', null);
		expect(meal).toHaveProperty('fat', null);
		expect(meal).toHaveProperty('dietary_restrictions', null);
		expect(meal).toHaveProperty('time', null);
	})

	test("testUser2 can add a meal to a given day", async () => {
		day = await Day.addDay(new Date("2023-04-02T08:00:00.000Z"), testUser2.id);
		const meal = await Meal.addMeal({
			day_id: day.id,
			carbs: 100,
			protein: 20,
			dietary_restrictions: 'bread'
		}, testUser2.id)
		expect(meal).toHaveProperty('id');
		expect(meal).toHaveProperty('day_id', day.id);
		expect(meal).toHaveProperty('calories', null);
		expect(meal).toHaveProperty('carbs', 100);
		expect(meal).toHaveProperty('protein', 20);
		expect(meal).toHaveProperty('fat', null);
		expect(meal).toHaveProperty('dietary_restrictions', 'bread');
		expect(meal).toHaveProperty('time', null);
	})

	
	test("throws UnauthorizedError when meal added to day not belonging to user", async () => {
		await (expect(Meal.addMeal({
			day_id: 9999999,
			calories: 520
		}, testUser1.id))).rejects.toThrow(UnauthorizedError)
	})


	test("Successfully creates day from meal time", async ()=> {
		const meal = await Meal.addMeal({
			time: new Date("2023-04-03T23:00:00.000Z")
		}, testUser3.id);

		const day = await Day.getDay(new Date("2023-04-03T23:00:00.000Z"), testUser3.id);

		expect(day).toHaveProperty('user_id', testUser3.id);
		expect(day).toHaveProperty('date', new Date('4-3-2023'));

		expect(meal).toHaveProperty('id');
		expect(meal).toHaveProperty('day_id', day.id);
		expect(meal).toHaveProperty('calories', null);
		expect(meal).toHaveProperty('carbs', null);
		expect(meal).toHaveProperty('protein', null);
		expect(meal).toHaveProperty('fat', null);
		expect(meal).toHaveProperty('dietary_restrictions', null);
		expect(meal).toHaveProperty('time', new Date("2023-04-03T23:00:00.000Z"));
	})


	test("Throws BadDateError when no day_or or start_time", async () => {
		await (expect(Meal.addMeal({
			calories: 100
		}, testUser3.id))).rejects.toThrow(BadDateError);
	})

})



describe("Successfully deletes Meal with deleteMeal", function() {

	test("Successfully deletes a meal", async () => {
		const meal = await Meal.addMeal({
			time: new Date("04-20-2023 17:00"),
			calories: 1000,
			carbs: 100,
			protein: 50
		}, testUser3.id);
		const dm = await Meal.deleteMeal(meal.id, testUser3.id);
		expect(dm).toEqual(meal);
	})

	test("Throws a NotFoundError on non-existent meal", async () => {
		await (expect(Meal.deleteMeal(9999999), testUser3.id)).rejects.toThrow(NotFoundError);
	})

	test("Throws a NotFoundError on a different user's meal", async () => {
		// first meal belongs to testUser1
		await (expect(Meal.deleteMeal(first_meal.id, testUser3.id))).rejects.toThrow(NotFoundError);
	})

})


describe("Successfully retrieves multiple meals according to search parameters with getMeals", function() {

	// delete users and rebuild documents
	beforeAll(async () => {
		await db.query(`DELETE FROM users WHERE username LIKE 'testUser%';`);
    testUser1 = await User.createUser('testUser1', 'testUser1@email.com', 'password123');
    testUser2 = await User.createUser('testUser2', 'testUser2@email.com', 'password123');
    testUser3 = await User.createUser('testUser3', 'testUser3@email.com', 'password123');

		testUser1Meals = [
			{
				calories: 500,
				carbs: 80,
				fat: 30,
				protein: 50,
				dietary_restrictions: 'test meal 1',
				time: new Date("2023-2-27 19:00")
			},
			{
				calories: 600,
				carbs: 100,
				fat: 25,
				protein: 70,
				dietary_restrictions: 'test meal 2',
				time: new Date("2023-2-28 19:00")
			},
			{
				calories: 620,
				carbs: 70,
				fat: 20,
				protein: 60,
				dietary_restrictions: 'test meal 3',
				time: new Date("2023-3-1 19:00")
			},
			{
				calories: 550,
				carbs: 90,
				fat: 15,
				protein: 40,
				dietary_restrictions: 'test meal 4',
				time: new Date("2023-3-2 19:00")
			},
			{
				calories: 450,
				carbs: 65,
				fat: 18,
				protein: 60,
				dietary_restrictions: 'test meal 5',
				time: new Date("2023-3-3 19:00")
			}
		]

		testUser2Meals = [
			{
				calories: 523,
				carbs: 83,
				fat: 33,
				protein: 53,
				dietary_restrictions: 'test meal 6',
				time: new Date("2023-3-1 18:00")
			},
			{
				calories: 623,
				carbs: 103,
				fat: 23,
				protein: 73,
				dietary_restrictions: 'test meal 7',
				time: new Date("2023-3-2 18:00")
			},
			{
				calories: 423,
				carbs: 73,
				fat: 23,
				protein: 63,
				dietary_restrictions: 'test meal 8',
				time: new Date("2023-3-3 18:00")
			},
			{
				calories: 573,
				carbs: 93,
				fat: 18,
				protein: 43,
				dietary_restrictions: 'test meal 9',
				time: new Date("2023-3-4 18:40")
			},
			{
				calories: 473,
				carbs: 65,
				fat: 18,
				protein: 60,
				dietary_restrictions: 'test meal 10',
				time: new Date("2023-3-5 17::45")
			}
		]

		testUser3Meals = [
			{
				calories: 517,
				carbs: 87,
				fat: 37,
				protein: 57,
				dietary_restrictions: 'test meal 11',
				time: new Date("2023-3-3 18:00")
			},
			{
				calories: 617,
				carbs: 107,
				fat: 27,
				protein: 77,
				dietary_restrictions: 'test meal 12',
				time: new Date("2023-3-4 18:00")
			},
			{
				calories: 417,
				carbs: 77,
				fat: 27,
				protein: 67,
				dietary_restrictions: 'test meal 13',
				time: new Date("2023-3-5 18:00")
			},
			{
				calories: 567,
				carbs: 97,
				fat: 17,
				protein: 47,
				dietary_restrictions: 'test meal 14',
				time: new Date("2023-3-6 18:40")
			},
			{
				calories: 467,
				carbs: 67,
				fat: 17,
				protein: 67,
				dietary_restrictions: 'test meal 15',
				time: new Date("2023-3-7 19:45")
			},
			{
				calories: 150,
				carbs: 15,
				fat: 5,
				protein: 10,
				dietary_restrictions: 'test meal 16',
				time: new Date("2023-3-7 12:00")
			}
		]
	


		await Promise.all([
			Meal.addMeal(testUser1Meals[0], testUser1.id),
			Meal.addMeal(testUser1Meals[1], testUser1.id),
			Meal.addMeal(testUser1Meals[2], testUser1.id),
			Meal.addMeal(testUser1Meals[3], testUser1.id),
			Meal.addMeal(testUser1Meals[4], testUser1.id),

			Meal.addMeal(testUser2Meals[0], testUser2.id),
			Meal.addMeal(testUser2Meals[1], testUser2.id),
			Meal.addMeal(testUser2Meals[2], testUser2.id),
			Meal.addMeal(testUser2Meals[3], testUser2.id),
			Meal.addMeal(testUser2Meals[4], testUser2.id),

			Meal.addMeal(testUser3Meals[0], testUser3.id),
			Meal.addMeal(testUser3Meals[1], testUser3.id),
			Meal.addMeal(testUser3Meals[2], testUser3.id),
			Meal.addMeal(testUser3Meals[3], testUser3.id),
			
		])

		// same day, need to do one after the other to find the day
		await Meal.addMeal(testUser3Meals[4], testUser3.id);
		await Meal.addMeal(testUser3Meals[4], testUser3.id);

	});


	test("Gets all meals for testUser1", async () => {
		const meals = await Meal.getMeals([], testUser1.id);
		expect(meals.length).toBe(5);
		const tum = testUser1Meals;
		for (let i=0; i<meals.length; i++) {
			checkMeal(meals[i], ...tum[i]);
		}
	})

	test("Gets all meals for testUser2", async () => {
		const meals = await Meal.getMeals([], testUser2.id);
		expect(meals.length).toBe(5);
		const tum = testUser2Meals;
		for (let i=0; i<meals.length; i++) {
			checkMeal(meals[i], ...tum[i]);
		}
	})

	test("Gets all meals for testUser3", async () => {
		const meals = await Meal.getMeals([], testUser3.id);
		expect(meals.length).toBe(6);
		const tum = testUser3Meals;
		for (let i=0; i<meals.length; i++) {
			checkMeal(meals[i], ...tum[i]);
		}
	})

	test("Gets all meals after 3/1/23 for testUser1 with more than 500 calories", async () => {
		const meals = await Meal.getMeals([{
			column_name: 'time',
			comparison_operator: '>',
			comparison_value: new Date('3-1-23')
		}, {
			column_name: 'calories',
			comparison_operator: '>',
			comparison_value: 500
		}])
		
		checkSleep(meals[0], ...testUser1Meals[2]);
		checkSleep(meals[1], ...testUser1Meals[3]);
	})


	test("Two meals on same day for testUser3 have same date_id", async () => {
		const meals = await Meal.getMeals([{
			column_name: 'time',
      comparison_operator: '>',
      comparison_value: new Date('3-7-23')
		}, {
			column_name: 'time',
      comparison_operator: '<',
      comparison_value: new Date('3-8-23')
		}])

		expect(meals.length).toBe(2);
		expect(meals[0].day_id).toBe(meals[1].day_id)

	})
		
})



describe("Successfully edits meal with editMeal", function() {

	let testUser4;
	let testMeal;
	let day;

	beforeAll(async () => {
		testUser4 = await User.createUser('testUser4', 'testUser4@email.com', 'password123');
		testMeal = await Meal.addMeal({
			calories: 1000,
			time: new Date("2023-4-20 20:00")
		}, testUser4.id)
		day = await Day.addDay('4-10-2023', testUser4.id);

	})

	test("Successfully edits date", async () => {
		const editedMeal = await Meal.editMeal({
			day_id: day.id,
			calories: 500,
			carbs: 20,
			fat: 30,
			protein: 40,
			dietary_restrictions: "edited food",
			time: new Date("2023-4-10 20:00")
		}, testMeal.id, testUser4.id);
		expect(editedMeal).toHaveProperty('day_id', day.id);
		expect(editedMeal).toHaveProperty('calories', 500)
		expect(editedMeal).toHaveProperty('carbs', 20)
		expect(editedMeal).toHaveProperty('fat', 30)
		expect(editedMeal).toHaveProperty('protein', 40)
		expect(editedMeal).toHaveProperty(dietary_restrictions, "edited food")
		expect(editedMeal).toHaveProperty(time, new Date("2023-4-10 20:00"))
	})


	test("Throws NotFoundError on nonexistent meal", async () => {
		const badPromise = Meal.editMeal({
			day_id: day.id,
			calories: 10000
		}, 99999999, testUser4.id);

		await expect(badPromise).rejects.toThrow(NotFoundError);
	})


	test("Throws NotFoundError on meal belonging to someone else", async ()=> {
		const badPromise = Meal.editMeal({
			day_id: day.id,
			calories: 10000
		}, testMeal.id, testUser4.id);
		await expect(badPromise).rejects.toThrow(NotFoundError);
	})

})