const db = require('../db');

/** One function to seed whichever database is being
 * pointed to by process.env.MODE. 
 */

const seed = async() => {

  db.on('connect', async () => {
    // console.log(db.database)


    // clear all tables
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');

    // users table
    /**
     * NOTE: user_id changed to text to allow uuid and prevent
     * anyone from inferring the number of users
     */
    await db.query(`CREATE TABLE users(
      user_id VARCHAR UNIQUE PRIMARY_KEY,
      username VARCHAR UNIQUE,
      email VARCHAR UNIQUE,
      hashed_password VARCHAR,

      CONSTRAINT email_address CHECK (POSITION('@' IN email) > 1), 
      CONSTRAINT email_length CHECK (LENGTH(email)>5),
      CONSTRAINT username_chars CHECK (username ~ '^[a-zA-Z0-9]*$'),
      CONSTRAINT username_length CHECK (LENGTH(username)>5)
      );`
    )

    // user_profiles table
    await db.query(`CREATE TABLE user_profiles(

      );`
    )

    // days table
    await db.query(`CREATE TABLE days(

      );`
    )

    // activities table
    await db.query(`CREATE TABLE activities(

      );`
    )

    // meals table
    await db.query(`CREATE TABLE meals(

      );`
    )


    // sleeps table
    await db.query(`CREATE TABLE sleeps(

      );`
    )

  })
}

module.exports = seed;
