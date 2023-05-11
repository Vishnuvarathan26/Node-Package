
**Note: Please use latest version to avoid issues.** 

## Installation

```
npm i blp-backend-module
```
or
```
yarn add blp-backend-module
```
### Connect To the Firebase

```
const {getFirebaseInstance,getFireBaseData,insertIntoFirebase,modifyFirestoreDocument} = require('BLP-Backend-Module');
```

## 1) getFirebaseInstance

This function creates a new instance of Firebase using a service account and returns a promise that resolves with a Firestore instance.

### Usage:
```javascript
const serviceAccount = { /* your Firebase Project service account file */ }

getFirebaseInstance(serviceAccount)
    .then(db => {
        // use the Firestore instance
    })
    .catch(error => {
        console.log(error);
    });
```
or
```
let db=await getFirebaseInstance(serviceAccount)
```

## 2)getFireBaseData(db, options)

This function takes a Firestore instance and options as input, and returns a promise that resolves with the data from Firebase

**Options you can use:**
```
collection:""(required)

conditions:[{
    key:"",symbol:"",value:""
}];(optional)

limit:number(optional)

orderby:"field" (optional) --if use this field data will flow from descending because firebase give you in ascending order by default

count:boolean

documentId:"id"(optional) --if you want single document

listAllDocuments:boolean(optional) --if yount want collection document names
```
### Usage:
```javascript
const options = {
    collection: 'myCollection',
    conditions: [{key: 'timestamp', symbol: '>', value: '2022-01-01'}],
    limit: 10
};
getFireBaseData(db, options)
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    });
```

or else
```
let {status,data}=await getFireBaseData(db,options)
```

## 3)insertIntoFirebase

This function takes a Firestore instance and options as input, and returns a promise that insert data into Firebase.By default this function split the data into 500 chunks and insert into a batch.

***Note:if you have id in one od your objects it will overwrite the existing document which has the same id.***

### Usage:
```javascript
const options = {
    collection: 'myCollection',
    dataToInsert : [{
        key1 : 'value1',
        key2 : 'value2'
    }]
};

insertIntoFirebase(db, options)
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    });

```
or else
```
let {status,message}=await insertIntoFirebase(db,options)
```
## 4)modifyFirestoreDocument

This function takes a Firestore instance and options as input, and returns a promise that updates data in Firebase.

***Note:please provide id in each object of DatatoUpdate field***

### Usage:
```javascript
const options = {
    operation:"update" or "delete"
    collection: 'myCollection',
    dataToUpdate: [{
        id:"firestoreId"(required)
        key1: 'newValue1',
        key2: 'newValue2'
    }]
};
modifyFirestoreDocument(db, options)
    .then(() => {
        console.log('Data updated successfully');
    })
    .catch(error => {
        console.log(error);
    });

```

### Connect To the MongoDb

## Function Name: getMongoDbInstance(url)

This function returns a Promise that resolves with a JSON object containing the MongoDB instance and status of the connection. The status is either "success" or "failure".

### Inputs
- `url`: URL string of the MongoDB instance.

### Output
If the connection is successful, the output will be in the following format:

```
{
    status: "success",
    instance: [MongoDB instance]
}
```
If the connection fails, the output will be in the following format:
```
{
    status: "failure",
    error: [Error object]
}
```

### Usage:
```javascript
getMongoDbInstance(url)
    .then((result) => {
        console.log(result);
    });
```
or else
```
let {status,instance}=await getMongoDbInStance(url)
```

## 2)insertMongoDbData

This function returns a Promise that resolves with a JSON object containing the status of the data insertion.

### Parameters
```
     db: MongoDB instance returned by getMongoDbInstance() function.
     options: {
        Database: The name of the database.
        collectionName: The name of the collection.
        dataToInsert: An array of documents to insert into the collection.
        BulkInsert: Boolean value indicating whether to insert the data in bulk.[optional]
        eachBatchSize: The batch size for bulk insert.[optional]
        }
```
### Output

If the data insertion is successful, the output will be in the following format

```
{
    DocumentsInserted: [Number of Documents Inserted],
    status: "success"
}

else: Error Message
```

### Usage:

```javascript
insertMongoDbData(db, options)
    .then((result) => {
        console.log(result);
    });
```
or else

```javascript
let {status}=await insertMongoDbData(db,options)
```
## 3)getMongoDbData

This function allows you to get data from a MongoDB database.

### Parameters
```
    db: MongoDB instance returned from a call to getMongoDbInstance(url).
    options: Object containing the following properties:

        Database: (required) Name of the database to fetch data from.
        collectionName: (required) Name of the collection to fetch data from.
        query: (optional) Query to retrieve specific data, in JSON format.
        projection: (optional) Fields to include or exclude, in JSON format.
        sort: (optional) Specifies the sort order of documents, in JSON format.
        limit: (optional) Specifies the maximum number of documents to retrieve.
```

### Output

An object containing the following properties:
```
    status: (string) "success" if data retrieval is successful, "error" otherwise.
    data: (array) Array of documents returned from the database. Only present if status is "success".
    message: (string) Error message. Only present if status is "error".
```

Usage

```javascript
const options = {
    Database: "testdb",
    collectionName: "testCollection",
    query: { name: "John Doe" },
    projection: { name: 1, _id: 0 },
    sort: { name: 1 },
    limit: 5
}

const result = await getMongoDbData(db, options);
if (result.status === "success") {
    console.log("Data retrieved:", result.data);
} else {
    console.error("Error:", result.message);
}
```

## 4)getAggregatedMongoDbData

This function allows you to perform aggregation operations on a MongoDB database.

### Parameters

    db: MongoDB instance returned from a call to getMongoDbInstance(url).
    options: Object containing the following properties:
        Database: (required) Name of the database to aggregate data from.
        collectionName: (required) Name of the collection to aggregate data from.
        aggregateFields: (required) Specifies the fields to aggregate data from, in JSON format.

### Output

An object containing the following properties:

    status: (string) "success" if aggregation is successful, "error" otherwise.
    data: (array) Array of aggregated documents returned from the database. Only present if status is "success".
    message: (string) Error message. Only present if status is "error".

Usage

```javascript
const options = {
    Database: "testdb",
    collectionName: "testCollection",
    aggregateFields: {
        from: "otherCollection",
        localField: "field",
        foreignField: "field",
        as: "newField"
    }
}

const result = await getAggregatedMongoDbData(db, options);
if (result.status === "success") {
    console.log("Aggredated Data",result.data)
else{
    console.log(result)
}
```

## 5)updateMongoDbData function

This function is used to update multiple documents in a MongoDB collection. The function takes two 

### Parameters:

    db: a MongoDB connection object.
    options: an options object that contains the following properties:
        Database: name of the database you want to connect to.
        collectionName: name of the collection you want to connect to.
        filter: a MongoDB filter object that specifies the documents you want to update.
        update: a MongoDB update object that specifies the updates to be performed on the matched documents.

Usage
```javascript
Example usage: const options = {
    Database: "test",
    collectionName: "products",
    filter: { name: "iPhone" },
    update: { $set: { stock: 20 } }
  };
  updateMongoDbData(db, options)
    .then(result => console.log(result))
    .catch(error => console.error(error));
```

## 5)deleteMongoDbData function

This function is used to delete multiple documents in a MongoDB collection. The function takes two 

### Parameters:

    db: a MongoDB connection object.
    options: an options object that contains the following properties:
        Database: name of the database you want to connect to.
        collectionName: name of the collection you want to connect to.
        filters: an array of MongoDB filter objects that specify the documents you want to delete.

### Usage:
```javascript
const options = {
    Database: "test",
    collectionName: "products",
    filters: [
      { name: "iPhone" },
      { name: "Samsung Galaxy" }
    ]
  };
  deleteMongoDbData(db, options)
    .then(result => console.log(result))
    .catch(error => console.error(error));
```

### Connect to the SQL

## 1)getInstance Function

This function returns a database instance of a database client based on the database type specified in databaseName. The connection parameters are passed to the function in connectionParams.

### Input
```
    databaseName: The database client to be used (e.g. pg)
    connectionParams: The connection parameters required to connect to the database
```
***Note:This project uses knex npm to connect to database, so databasename should be same as knex npm database name Ex:postgres will be named as pg) refer knex npm for database naming,Primarily tested with postgres and MS-SQL***
    

### Output:
```
 status: "success" if the database instance was created successfully, "failure" otherwise.
        instance: The database instance.
```

### Usage:
```javascript
const databaseName = "postgres";
const connectionParams = {
  host: "localhost",
  user: "postgres",
  password: "password",
  database: "test_db"
};

getInstance(databaseName, connectionParams)
  .then(result => {
    if (result.status === "success") {
      console.log("Successfully created database instance.");
      const instance = result.instance;
      // Use the database instance for further queries
    } else {
      console.log("Error creating database instance: " + result.message);
    }
  })
  .catch(error => {
    console.log("Error creating database instance: " + error);
  });
  ```
  
## 2)runQuery Function

This function executes a raw query on the database instance passed to it as the first argument. The second argument, queryParams, contains the query string and any parameters to be passed to the query.

### Input:
```
    instance: A database instance obtained from the getInstance function.
    queryParams: An object with the following properties:
    query: The raw query string to be executed.
    params: An array of parameters to be passed to the query.
```
### Output:
```
    A Promise that resolves to an object with the following properties:
        status: "success" if the query executed successfully, "failure" otherwise.
        data: The result of the query, if it executed successfully.
```

### Usage:

```javascript
const queryParams = {
  query: "SELECT * FROM users WHERE name = $1",
  params: ["John"]
};

runQuery(instance, queryParams)
  .then(result => {
    if (result.status === "success") {
      console.log("Successfully executed query.");
      console.log(result.data);
    } else {
      console.log("Error executing query: " + result.message);
    }
  })
  .catch(error => {
    console.log("Error executing query: " + error);
  });
```
### 3)batchInsert function

The batchInsert function is used to insert a large number of records into a database table. It is more efficient than inserting records one-by-one, as it can process multiple records in one go.

### Inputs
```
    instance: An instance of a connection.
    tableName: The name of the database table to insert records into.
    insertData: An array of objects representing the records to be inserted. Each object should have the same keys and corresponding values as the columns in the database table.
    chunkSize: The number of records to be inserted in each batch.
```
Usage:
```javascript
let records = [
  { name: "John", age: 30 },
  { name: "Jane", age: 28 },
  { name: "Jim", age: 35 },
  // ...
];

batchInsert(instance, "users", records, 1000)
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.error(err);
  });
```

### 4)createNewTable function

The createNewTable function is used to create a new database table.

### Inputs
```
    knex: An instance of a Knex connection.
    tableName: The name of the database table to be created.
    schema: A string representation of the schema of the table to be created.
```

Usage:

```javascript
createNewTable(knex, "users", `
  (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL
  )
`)
  .then(() => {
    console.log("Table created successfully");
  })
  .catch(err => {
    console.error(err);
  });
```

## Credits

- Sam Jeberaj R: Idea behind the package and for the support during the development of this package.
