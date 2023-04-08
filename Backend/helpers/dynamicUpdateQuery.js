const dynamicUpdateQuery = (updateObj, tableName, whereCol, whereVal) => {
  let queryStr = `UPDATE ${tableName} SET`
  for (let [key, val] of Object.entries(updateObj)) {
    if (val === null) continue;
    
    // don't try to update id or user_id
    if (key === 'id') continue;
    if (key === 'user_id') continue;
    
    // val is a copy, safe to modify
    if (typeof val === "string") val = `'${val}'`
    queryStr += ` ${key} = ${val},`
  }
  // eliminate last comma
  queryStr = queryStr.slice(0, -1);
  
  if (typeof whereVal === 'string') whereVal = `'${whereVal}'`
  queryStr += ` WHERE ${whereCol} = ${whereVal} RETURNING *;`
  return queryStr;
}
module.exports = dynamicUpdateQuery;