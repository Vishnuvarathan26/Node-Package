const MongoClient = require('mongodb').MongoClient;
const _ = require("lodash")

/* 
----InsertData----
db=>database Instance
options={
  Database:""
  collectionName:"",
  dataToInsert:[{},{},{}],
  BulkInsert:true
  eachBatchSize:
}

----GetData----
db=>database Instance
options={
  Database:""
  collectionName:"",
  query:"",
  projection:""
  sort:""
  limit:""
}

-----Aggregate-----
aggregateFields:{
from: 'products',
localField: 'product_id',
foreignField: '_id',
as: 'orderdetails'
}
Database:""
collectionName:"",

*/



async function getMongoDbInstance(url) {
    return new Promise(async (resolve, reject) => {
        try {
            resolve({status: "success",instance:await  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })})
        } catch (error) {
            console.log(error);
            resolve({ status: "failure", error: error })
        }

    })
}

async function insertMongoDbData(db, options) {
    return new Promise(async (resolve, reject) => {
        try {
            if (options.Database && options.collectionName) {
                let collectionName = options.collectionName;
                let collectionRef = db.db(options.Database).collection(collectionName)
                if (options.dataToInsert && options.dataToInsert.length) {
                    let dataToInsert = options.dataToInsert
                    if (options.BulkInsert) {
                        let chunks = _.chunk(dataToInsert, options.eachBatchSize)
                        for await (let chunk of chunks) {
                            let batch = collectionRef.initializeOrderedBulkOp();
                            for (let data of chunk) {
                                batch.insert(data)
                            }
                            await batch.execute(function (err, result) {
                                console.log("Documents Inserted", result.result.nInserted);
                            });
                        }
                        resolve({ status: "Success" })
                    }
                    else {
                        let result = await collectionRef.insertMany(dataToInsert)
                        resolve({ message: `${result.insertedCount}`, status: "success" })
                    }
                }
                else {
                    resolve({ status: 'error', message: "No Data to Insert" })
                }
            }
            else {
                resolve({ status: 'error', message: "Missing Collection Name or Database Name" })
            }
        } catch (error) {
            console.log(error);
        }

    })
}

async function getMongoDbData(db, options) {
    return new Promise((resolve, reject) => {
        try {
            if (options.Database && options.collectionName) {
                let query = options.query
                let projection = { projection: options.projection }
                let collectionName = options.collectionName;
                let collectionRef = db.db(options.Database).collection(collectionName)
                if (options.query && typeof options.query == "string") {
                    query = JSON.parse(options.query);
                }
                if (options.projection && typeof options.projection == "string") {
                    projection['projection'] = JSON.parse(options.projection);
                }
                collectionRef = collectionRef.find(query, projection)
                //1 asc;-1 desc
                if (options.sort) collectionRef = collectionRef.sort(options.sort)
                if (options.limit) collectionRef = collectionRef.limit(options.limit)
                collectionRef.toArray(function (err, result) {
                    if (err) {
                        resolve({ status: 'error', message: err })
                    }
                    resolve({ status: 'success', data: result })
                })
            }
            else {
                resolve({ status: 'error', message: "Missing Collection Name or Database Name" })
            }

        } catch (error) {
            console.log(error)
            resolve({ status: 'error', message: "Error Getting Documents" })
        }
    })
}

async function getAggregatedMongoDbData(db, options) {
    return new Promise((resolve, reject) => {
        try {
            if (options.Database && options.collectionName && options.aggregateFields) {
                let collectionName = options.collectionName;
                let collectionRef = db.db(options.Database).collection(collectionName)
                collectionRef.aggregate([
                    {
                        $lookup: options.aggregateFields
                    }
                ]).toArray(function (err, result) {
                    if (err) resolve({ status: 'error', message: err })
                    resolve({ status: 'success', data: result })
                });

            }
            else {
                resolve({ status: 'error', message: "Missing Collection Name or Database Name" })
            }
        } catch (error) {
            console.log(error);
            resolve({ status: 'error', message: "Error Getting Documents" })
        }
    })
}

async function updateMongoDbData(db, options) {
    return new Promise((resolve, reject) => {
        try {
            // Extract options
            const { Database, collectionName, filter, update } = options;
            // Get collection reference
            const collection = db.db(Database).collection(collectionName);

            // Use updateMany to update multiple documents
            collection.updateMany(filter, update, function (err, result) {
                if (err) {
                    console.log(err)
                    resolve({ status: 'error', message: "Error Updating Documents" })
                }
                resolve(`Successfully updated ${result.modifiedCount} documents.`);
            });
        } catch (error) {
            console.log(error)
            resolve({ status: 'error', message: "Error Updating Documents" })
        }
    })

}

async function deleteMongoDbData(db, options) {
    return new Promise(async (resolve, reject) => {
        try {
            // Extract options
            const { Database, collectionName, filters } = options;
            if (Database && collectionName && filters) {
                // Get collection reference
                const collection = db.db(Database).collection(collectionName);
                let count=0
                for await (let filter of filters) {
                    // Use deleteMany to delete multiple documents
                   await  collection.deleteMany(filter)
                        .then(result => {
                            console.log(`Successfully deleted ${result.deletedCount} documents.`);
                        })
                        .catch(err => {
                            throw err;
                        });
                    count++
                }
                resolve({ status: "success", message: `Successfully deleted ${count} documents.` })

            }
            else resolve({ status: 'error', message: "Missing required Options key" })
        } catch (error) {
            console.log(error);
            resolve({ status: 'error', message: "Error Getting Documents" })
        }
    })


}


module.exports = {
    getMongoDbInstance,
    insertMongoDbData,
    getMongoDbData,
    getAggregatedMongoDbData,
    updateMongoDbData,
    deleteMongoDbData
};



