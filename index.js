const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
const port = process.env.PORT || 5000;

require('dotenv').config();

// midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cetyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('timeFinity');
        const watchCollection = database.collection('watch');

        // post data from ui to db
        app.post('/watch', async (req, res) => {
            const data = req.body;
            const result = await watchCollection.insertOne(data);
            res.json(result);
        })

        // get data from db to ui
        app.get('/watch', async (req, res) => {
            const data = watchCollection.find({});
            const result = await data.toArray();
            res.json(result);
        })

        // get single product from db to ui
        app.get('/watch/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const watch = await watchCollection.findOne(query);
            res.json(watch);
        })

        // delete single product from ui
        app.delete('/watch/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const remove = await watchCollection.deleteOne(query);
            res.json(remove);
        })

    }

    finally {
        // await client.close();
    }
    
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('group task server is running');
})

app.listen(port, () => {
    console.log('listning to port', port);
})

