const { MongoClient } = require('mongodb');
const fs = require('node:fs/promises');
const path = require('node:path');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'pokemontest';

/**
 * Gets all of the files in a given directory
 * @param {string} filesPath the directory of the files
 * @returns {Array} the list of the files in the given directory
 */
async function getDirFiles(filesPath) {
    try {
        const tempFiles = await fs.readdir(filesPath);
        return tempFiles;
    }
    catch(err) {
        console.log(err);
    }
}

/**
 * Reads .json file and returns parsed JSON
 * @param {string} fileDir the directory of the file
 * @param {string} file the .json file
 * @returns {*} parsed json, as javascript object, or array
 */
async function getFileJSON(fileDir, file) {
    try {
        const filePath = path.resolve(path.join(fileDir, file));
        const contents = await fs.readFile(filePath, {encoding: 'utf8'});
        return JSON.parse(contents);
    }
    catch(err) {
        console.log(err);
    }
}

/**
 * Creates and returns list of documents from a directory of json files
 * @param {string} filesPath path of the files
 * @param {Array} files array of file names
 * @returns {Array} array of all json docs from the directory
 */
async function JSONGenerator(filesPath, files) {
    if(files.length < 1) {
        return "no files provided";
    }

    let allDocs = [];

    for(const file of files) {
        let JSONDocs = await getFileJSON(filesPath, file);

        for(const doc of JSONDocs) {
            allDocs.push(doc);
        }
    }

    return allDocs;
}

/**
 * Populates mongodb collection with array of documents
 * @param {Object} collection collection that will be populated
 * @param {string} dir directory of files that contain json docs necessary for collection population
 */
async function fillCollection(collection, dir) {
    const filesPath = path.join(__dirname, dir);
    let files = await getDirFiles(filesPath);
    let allDocs = await JSONGenerator(filesPath, files);
    const InsertResult = await collection.insertMany(allDocs);
    console.log('Inserted Deck Documents =>', InsertResult);
} 

async function main() {
    await client.connect();
    console.log('Connected successfully to mongodb server');
    const db = client.db(dbName);
    const deckCollection = db.collection('decks');
    const cardCollection = db.collection('cards');
    const setCollection = db.collection('sets');

    await fillCollection(deckCollection, 'decks/en');
    await fillCollection(cardCollection, 'cards/en');
    await fillCollection(setCollection, 'sets');

    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());