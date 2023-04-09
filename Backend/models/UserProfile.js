// libraries


// local
const db = require('../db.js');
const dynamicUpdateQuery = require('../helpers/dynamicUpdateQuery.js');
const { InvalidUserError } = require('../expressError.js');


const getUserProfileByUserId = async (user_id) => {
  try {
    const profileQuery = await db.query(
      `SELECT * FROM user_profiles WHERE user_id=$1
      `, [user_id]);
    return profileQuery.rows[0];
  } catch (err) {
    throw err;
  }
}
module.exports.getUserProfileByUserId = getUserProfileByUserId;




/** Takes request body and user_id, and updates the user_profile with a
 * sanitized version of the body. Returns the updated UserProfile.
 * 
 * 
 * @param {Obect} body
 * @param {uuid} user_id 
 * @returns {UserProfile}
 */
const editUserProfile = async (body, user_id) => {
  try {
    // filter body to only get appropriate keys
    const updateObj = {
      avatar: body.avatar ? body.avatar : null,
      height: body.height ? body.height : null,
      weight: body.weight ? body.weight : null,
      age: body.age ? body.age : null
    }
    const queryString = dynamicUpdateQuery(updateObj, 'user_profiles', 'user_id', user_id);
    const updateQuery = await db.query(queryString);
    if (updateQuery.rows.length !== 1) throw new InvalidUserError();
    else return updateQuery.rows[0];
  } catch(err) {
    throw err;
  }
}
module.exports.editUserProfile = editUserProfile;