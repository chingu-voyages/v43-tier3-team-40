// libraries


// local
const db = require('../db.js');


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





const editUserProfile = async () => {
  try {

  } catch(err) {
    throw err;
  }
}