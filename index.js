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
        const watchCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const ratingCollection = database.collection('reviews');
        const usersCollection = database.collection('users');


        // post data from ui to db
        app.post('/products', async (req, res) => {
            const data = req.body;
            const result = await watchCollection.insertOne(data);
            res.json(result);
        })

        // get data from db to ui
        app.get('/products', async (req, res) => {
            const data = watchCollection.find({});
            const result = await data.toArray();
            res.json(result);
        })

        // get single product from db to ui
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const watch = await watchCollection.findOne(query);
            res.json(watch);
        })

        // delete single product from ui
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const remove = await watchCollection.deleteOne(query);
            res.json(remove);
        })

        // ------------------ratings section----------------------
        // post ratings from ui to db
        app.post('/reviews', async (req, res) => {
            const data = req.body;
            const ratings = await ratingCollection.insertOne(data);
            res.json(ratings);
        })

        // get/load rating from db to ui
        app.get('/reviews', async (req, res) => {
            const data = ratingCollection.find({});
            const ratings = await data.toArray();
            res.send(ratings);
        })

        // get single rating from db to ui
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const rating = await ratingCollection.findOne(query);
            res.json(rating);
        })

        // delete single rating from db and ui
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const remove = await ratingCollection.deleteOne(query);
            res.send(remove);
        })

        // ------------ order section -------------
        // post order from ui to db
        app.post('/orders', async(req, res) => {
            const data = req.body;
            const order = await orderCollection.insertOne(data);
            res.json(order);
        })

        // get / load orders from db to ui
        app.get('/orders', async (req, res) => {
            const data = req.body;
            const orders = orderCollection.find({});
            const result = await orders.toArray();
            res.json(result);
        })

        // get a single products from db
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.json(order);
        })

        // get order by email filter
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            const customerOrder = orders.filter(order => order.email === email);
            res.json(customerOrder);
        })

        // delete single product from ui and db
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const remove = await orderCollection.deleteOne(query);
            res.json(remove);
        })

        // ---------------user section ----------
        // post user from ui to db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // upsert user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateUser = { $set: user };
            const result = await usersCollection.updateOne(filter, updateUser, option);
            res.json(result);
        })

        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const makeAdmin = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, makeAdmin);
            res.json(result);
        })

        // get oll users
        app.get('/users', async (req, res) => {
            const users = usersCollection.find({});
            const result = await users.toArray();
            res.json(result);
        })

        // admin filter from db to ui
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
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

