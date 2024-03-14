const { MongoClient } = require('mongodb');
const fs = require('node:fs/promises');
const path = require('node:path');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'pokemontest';

async function getDirFiles(filesPath) {
    try {
        const tempFiles = await fs.readdir(filesPath);
        return tempFiles;
    }
    catch(err) {
        console.log(err);
        return err;
    }
}

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

async function main() {
    await client.connect();
    console.log('Connected successfully to mongodb server');
    const db = client.db(dbName);
    const deckCollection = db.collection('decks');
    const cardCollection = db.collection('cards');

    //Starting with decks to get the basic info
    const decksPath = path.join(__dirname, 'decks/en');
    let deckFiles = await getDirFiles(decksPath);
    let allDecks = await JSONGenerator(decksPath, deckFiles);
    const deckInsertResult = await deckCollection.insertMany(allDecks);
    console.log('Inserted Deck Documents =>', deckInsertResult);

    const cardsPath = path.join(__dirname, 'cards/en');
    let cardFiles = await getDirFiles(cardsPath);
    let allCards = await JSONGenerator(cardsPath, cardFiles);
    const cardInsertResult = await cardCollection.insertMany(allCards);
    console.log('Inserted Card Dcouments =>', cardInsertResult);

    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());