const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'pokemontest';

async function main() {
    await client.connect();
    console.log('Connected successfully to mongodb server');
    const db = client.db(dbName);
    const collection = db.collection('cards');

    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());