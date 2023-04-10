
/** Takes an object of proposed updates to a table, the name of the table
 * and the column name and value to find the correct row(s) to be modified.
 * Returns an array with two values, the first being a string to give to
 * db.query, and the second being the array to give to db.query as the second
 * parameter. This approach allows pg's sanitization to work 
 * 
 * @param {Object} updateObj 
 * @param {String} tableName 
 * @param {String} whereCol 
 * @param {String} whereVal 
 * @returns {Array} 
 */
const dynamicUpdateQuery = (updateObj, tableName, whereCol, whereVal) => {
  let queryStr = `UPDATE ${tableName} SET`
  const valArr = [];

  // counter for pg values to link to array
  let nextValNum = 1;

  for (let [key, val] of Object.entries(updateObj)) {
    if (val === null) continue;
    
    // don't try to update id or user_id
    if (key === 'id') continue;
    if (key === 'user_id') continue;
    
    queryStr += ` ${key} = $${nextValNum},`;
    nextValNum++;
    valArr.push(val);
  }
  // eliminate last comma
  queryStr = queryStr.slice(0, -1);
  
  if (typeof whereVal === 'string') whereVal = `'${whereVal}'`
  queryStr += ` WHERE ${whereCol} = ${whereVal} RETURNING *;`
  return [queryStr, valArr];
}
module.exports = dynamicUpdateQuery;