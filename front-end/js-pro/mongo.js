const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, {
});

let db;

async function connectDB() {
    if (db) return db;

    await client.connect();
    db = client.db('thook');
    console.log('Connected to MongoDB (local)');
    return db;
}

module.exports = connectDB;
