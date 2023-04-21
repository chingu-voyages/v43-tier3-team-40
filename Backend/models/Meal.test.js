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

})