const { getFirebaseInstance, getFireBaseData, modifyFirestoreDocument, insertIntoFirebase } = require("./firebase/index")
const { getMongoDbData, getMongoDbInstance, insertMongoDbData, getAggregatedMongoDbData, updateMongoDbData, deleteMongoDbData } = require("./MongoDB/index")
const { getInstance, createNewTable, runQuery, batchInsert } = require("./SQL/index")

module.exports = {
  getFirebaseInstance, getFireBaseData, modifyFirestoreDocument, insertIntoFirebase,
  getMongoDbData, getMongoDbInstance, insertMongoDbData, getAggregatedMongoDbData, updateMongoDbData, deleteMongoDbData,
  getInstance, createNewTable, runQuery, batchInsert
}