


const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");

const objectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
// MiddleWare
app.use(cors());
app.use(express.json())
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zpk1a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

//console.log(uri) // for checking user/pass is alright

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("apartments");
        const apartmentCollection = database.collection("apartmentList");
        const purchasesCollection = database.collection("purchases");
        const reviewCollection = database.collection("review");
        const usersCollection = database.collection("users");


        //GET API ALL APARTMENT

        app.get('/apartmentList', async (req, res) => {
            const cursor = apartmentCollection.find({});
            const apartment = await cursor.toArray();
            res.send(apartment)
        })

        // GET SINGLE Apartment API

        app.get('/apartmentList/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: objectId(id) };
            console.log(query)
            const apartment = await apartmentCollection.findOne(query);
            res.json(apartment);
        })


        // POST API APARTMENT
        app.post('/apartmentList', async (req, res) => {
            const apartment = req.body;

            console.log("Hitting the post", apartment)
            const result = await apartmentCollection.insertOne(apartment);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result)
        })

        //DELETE API Apartments


        app.delete('/apartmentList/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: objectId(id) };
            const result = await apartmentCollection.deleteOne(query);

            console.log('deleting apartment with id ', result);

            res.json(result);
        })



        //PURCHASES

        //GET API PURCHASES

        app.get('/purchases', async (req, res) => {
            const cursor = purchasesCollection.find({});
            const purchase = await cursor.toArray();
            res.send(purchase)
        })

        //GET SINGLE API PURCHASES

        app.get('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };
            const purchase = await purchasesCollection.findOne(query);
            // console.log('load user with id: ', id);
            res.send(purchase);
        })
        // // POST API PURCHASES
        app.post('/purchases', async (req, res) => {
            const purchase = req.body;
            purchase.status = 'pending';
            console.log(purchase)
            const result = await purchasesCollection.insertOne(purchase);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result)

        })

        app.put("/updateStatus/:id", (req, res) => {
            const id = req.params.id;
            // const updatedStatus = req.body;
            const filter = { _id: objectId(id) };
            //console.log(updatedStatus);
            purchasesCollection
                .updateOne(filter, {
                    $set: { status: "Confirm" },
                })
                .then((result) => {
                    res.json(result);
                });
        });


        //DELETE API PURCHASE


        app.delete('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: objectId(id) };
            const result = await purchasesCollection.deleteOne(query);

            console.log('deleting purchases with id ', result);

            res.json(result);
        })


        app.put('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            // const newOrderStatus = req.body;
            const filter = { _id: objectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'confirmed'

                },
            };
            const result = await purchasesCollection.updateOne(filter, updateDoc, options);
            console.log('will be updating', id, result, updateDoc)
            res.json(result);
        })



        // POST REVIEW API
        app.post("/addReview", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        });

        //GET API REVIEWS

        app.get('/addReview', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review)
        })

         app.post("/addUserInfo", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        //google sign in user update/put function
        app.put('/addUserInfo', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //  make admin

        app.put("/makeAdmin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        });

        // check admin or not
        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await usersCollection
                .find({ email: req.params.email })
                .toArray();
            console.log(result);
            res.send(result);
        });













    } finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Runnig apartment SERVER')
})


app.listen(port, () => {
    console.log("Runnig apartment server on port", port)
})