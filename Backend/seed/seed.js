
/** One function to seed whichever database is being
 * pointed to by process.env.MODE. Full instructions
 * for use in main README.md.
*/

const seed = async() => {
  
  const db = require('../db');

  db.on('connect', async () => {

    // clear all tables
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    await db.query('DROP TABLE IF EXISTS user_profiles CASCADE');
    await db.query('DROP TABLE IF EXISTS days CASCADE');
    await db.query('DROP TABLE IF EXISTS activities CASCADE');
    await db.query('DROP TABLE IF EXISTS meals CASCADE');
    await db.query('DROP TABLE IF EXISTS sleeps CASCADE');


    /** users table
     * NOTE: user_id changed to text to allow uuid and prevent
     * anyone from inferring the number of users
     */
    await db.query(`CREATE TABLE users(
      id VARCHAR PRIMARY KEY,
      username VARCHAR UNIQUE,
      email VARCHAR UNIQUE,
      hashed_password VARCHAR,

      CONSTRAINT email_address CHECK (POSITION('@' IN email) > 1), 
      CONSTRAINT email_length CHECK (LENGTH(email)>5),
      CONSTRAINT username_chars CHECK (username ~ '^[a-zA-Z0-9]*$'),
      CONSTRAINT username_length CHECK (LENGTH(username)>5)
      );`
    )

    console.log('created table users');

    // user_profiles table
    /**
     * note: the avatar is currently a varchar so as 
     * to be used as a pointer to some remote image 
     * repository, though this may be modified later
     * to a BLOb or some other direct storage if
     * possible
     */
    await db.query(`CREATE TABLE user_profiles(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR REFERENCES users (id) ON DELETE CASCADE,
      avatar VARCHAR,
      height INTEGER,
      weight INTEGER,
      age INTEGER
      );`
    )

    console.log('created table user_profiles');

    // days table
    await db.query(`CREATE TABLE days(
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      user_id VARCHAR REFERENCES users (id) ON DELETE CASCADE
      );`
    )

    console.log('created table days');

    // activities table
    await db.query(`CREATE TABLE activities(
      id SERIAL PRIMARY KEY,
      day_id INTEGER REFERENCES days (id) ON DELETE CASCADE,
      category VARCHAR,
      start_time TIMESTAMPTZ,
      end_time TIMESTAMPTZ,
      intensity INTEGER,
      success_rating INTEGER,

      CONSTRAINT intensity_scale CHECK (
        intensity >=1 AND intensity <= 10
        ),
      CONSTRAINT success_rating_scale CHECK (
        success_rating >=1 AND success_rating <= 10
        )
      );`
    )

    console.log('created table activities');

    // meals table
    await db.query(`CREATE TABLE meals(
      id SERIAL PRIMARY KEY,
      day_id INTEGER REFERENCES days(id) ON DELETE CASCADE,
      calories INTEGER,
      carbs INTEGER,
      protein INTEGER,
      fat INTEGER,
      dietary_restrictions VARCHAR,
      time TIMESTAMPTZ
      );`
    )

    console.log('created table meals');

    // sleeps table
    await db.query(`CREATE TABLE sleeps(
      id SERIAL PRIMARY KEY,
      day_id INTEGER REFERENCES days (id) ON DELETE CASCADE,
      start_time TIMESTAMPTZ,
      end_time TIMESTAMPTZ,
      success_rating INTEGER,

      CONSTRAINT success_rating_scale CHECK (
        success_rating >=1 AND success_rating <= 10
        )
      );`
    )

    console.log('created table sleeps');

  })
}

module.exports = seed;
