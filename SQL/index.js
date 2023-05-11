async function getInstance(databaseName, connectionParams) {
    return new Promise((resolve, reject) => {
        try {
            let timeout = 90000;
            var knex = require('knex')({
                client: databaseName,
                connection: connectionParams
            });
            resolve({ status: "success", instance: knex });
        } catch (error) {
            console.log(error);
            resolve({ status: "failure", message: err.toString() })
        }

    });
}

async function runQuery(instance, queryParams) {
    return new Promise(async (resolve, reject) => {
        try {
            let qryResult = await instance.raw(queryParams.query, queryParams.params);
            let qryResponse = { status: "success" };
            console.log(qryResult.rows)
            if (qryResult.rows) qryResponse.data = qryResult.rows;
            resolve(qryResponse)
        } catch (err) {
            console.log(err);
            resolve({ status: "failure", message: err.toString() })
        }
    });
}

async function batchInsert(instance, tableName, insertData, chunkSize) {
    return new Promise(async (resolve, reject) => {
        try {
            let qryResult = await instance.batchInsert(tableName, insertData, chunkSize).returning('*');
            resolve({ status: "success" });
        } catch (err) {
            console.log(err);
            resolve({ status: "failure", message: err.toString() })
        }
    });
}


function createNewTable(knex, tableName, schema) {
    return knex.raw(`CREATE TABLE ${tableName} ${schema}`)
    .then(() => {
        console.log(`Table ${tableName} created successfully!`);
    })
    .catch(err => {
        console.log(`Error creating table ${tableName}: ${err}`);
    });
}




module.exports = {
    getInstance,
    batchInsert,
    runQuery,
    createNewTable
}