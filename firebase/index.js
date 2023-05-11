var admin = require("firebase-admin");
const _ = require("lodash")
const moment = require('moment')

async function getFirebaseInstance(serviceAccount) {
    return new Promise((resolve, reject) => {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            const db = admin.firestore();
            resolve(db)
        } catch (error) {
            resolve({ errorMsg: error, status: "failure" })
        }
    })
}

async function getFireBaseData(db, options) {
    return new Promise(async (resolve, reject) => {
        let collectionName = options.collection;
        let conditions = options.conditions;
        if (options.conditions && typeof options.conditions == "string") {
            conditions = JSON.parse(options.conditions);
        }
        let limit = undefined;
        if (options.limit) {
            limit = parseInt(options.limit);
        }
        if (collectionName) {
            let docRef = undefined;
            if (options.documentId) {
                await db.collection(`${collectionName}`).doc(options.documentId).get().then(res => {
                    let data = res.data()
                    resolve({ status: "success", data: data })
                }).catch((error) => {
                    console.log("Error getting documents: ", error);
                    resolve({ message: "Error getting documents", status: "failure" })
                })
            }
            if (options.count) {
                db.collection(`${collectionName}`).count().get().then(res => {
                    let count = res.data().count
                    resolve({ status: "success", documentCount: count })
                })
            }
            if (options.collection) {
                docRef = db.collection(`${collectionName}`);
            } else {
                docRef = db.collection(`${collectionPath}/${collectionName}`);
            }
            if (options.listAllDocuments) {
                await docRef.listDocuments().then(async collections => {
                    let documentIds = []
                    for await (let collection of collections) {
                        documentIds.push(collection.id)
                    }
                    resolve({ status: "success", data: documentIds })
                })
            }
            // if (options.listAllCollections) {
            //     await docRef.listCollections().then(async collections => {
            //         let documentIds = []
            //         for await (let collection of collections) {
            //             documentIds.push(collection.id)
            //         }
            //         resolve({ status: "success", data: documentIds })
            //     })
            // }
            if (conditions && conditions.length > 0) {
                conditions.forEach((element) => {
                    if (element.key == "timestamp" && element.value) {
                        element.value = moment(element.value).utc()._d;
                    } else if (element.key == "messageid" && element.value) {
                        element.value = parseInt(element.value);
                    }
                    docRef = docRef.where(element.key, element.symbol, element.value)
                });
            }
            if (limit) {
                docRef = docRef.limit(limit);
            }
            if (options.orderby) {
                docRef = docRef.orderBy(options.orderby, 'desc')
            }
            docRef.get().then(snapshot => {
                let promises = [];
                if (snapshot.size != 0) {
                    snapshot.forEach(doc => {
                        let data = doc.data();
                        data.id = doc.id;
                        promises.push(data);
                    });
                }
                resolve({ data: promises, status: "success" });

            }).catch((error) => {
                console.log("Error getting documents: ", error);
                resolve({ message: "Error getting documents", status: "failure", data: [] })
            });

        } else {
            resolve({ message: "Missing collectionName", status: "failure" });
        }
    })
}


async function insertIntoFirebase(db, options) {
    return new Promise(async (resolve, reject) => {
        try {
            let collectionName = options.collection;
            if (collectionName && options.dataToInsert && options.dataToInsert.length) {
                let documents = options.dataToInsert
                let chunks = _.chunk(documents, 500)
                let count = 0
                for await (let chunk of chunks) {
                    let batch = db.batch()
                    for (let data of chunk) {
                        let doc;
                        if (data.id) doc = db.collection(`${collectionName}`).doc(data.id)
                        else doc = db.collection(`${collectionName}`).doc()
                        delete data.id
                        batch.set(doc, data)
                        count++
                    }
                    await batch.commit()
                }
                resolve({ status: "success", message: `${count} documents Inserted` })
            }
            else {
                resolve({ message: "Missing collectionName", status: "failure" });
            }
        } catch (error) {
            resolve({ status: "failure", error: error })
        }
    })
}

async function modifyFirestoreDocument(db, options) {
    return new Promise(async (resolve, reject) => {
        try {
            let collectionName = options.collection
            if (collectionName && options.dataToUpdate && options.dataToUpdate.length && options.operation) {
                let documents = options.dataToUpdate
                let chunks = _.chunk(documents, 500)
                let count = 0
                for await (let chunk of chunks) {
                    let promises = []
                    for await (let data of chunk) {
                        let id = data.id
                        delete data.id
                        if (options.operation == "update") {
                            promises.push(db.collection(`${collectionName}`).doc(id).set(data, { merge: true }))
                            count++
                        }
                        else if (options.operation == "delete") {
                            promises.push(db.collection(`${collectionName}`).doc(id).delete())
                            count++
                        }

                    }
                    Promise.all(promises).then(() => {
                        console.log(`Data Updating.....`)
                    })
                }
                resolve({ status: "success", message: `${count} documents Updated` })
            }
            else {
                resolve({ message: "Missing collectionName", status: "failure" });
            }
        } catch (error) {
            resolve({ status: "failure", error: error })
        }
    })
}



module.exports = {
    getFirebaseInstance,
    getFireBaseData,
    insertIntoFirebase,
    modifyFirestoreDocument
}