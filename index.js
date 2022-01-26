const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 5000;


//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vw8cq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority1`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {

        await client.connect();
        const database = client.db('TourBlog');
        const usercollection = database.collection('user');
        const tourcollection = database.collection('tour');


        // GET Admin API
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const getEmail = { email: email };
            const user = await usercollection.findOne(getEmail);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // POST User API
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usercollection.insertOne(user);
            console.log(result)
            res.json('result');
        })

        //PUT User API
        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usercollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // PUT Admin API
        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: { role: user.role }
            }
            const result = await usercollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })


        // GET tour API
        app.get('/tour', async (req, res) => {
            const getdata = tourcollection.find({});
            const showdata = await getdata.toArray();
            res.send(showdata);
        })

        // GET Single tour API
        app.get('/tour/:id', async (req, res) => {
            const id = req.params.id;
            const getId = { _id: ObjectId(id) };
            const showId = await tourcollection.findOne(getId);
            res.json(showId);
        })


        // POST tour API
        app.post('/tour', async (req, res) => {
            const add = req.body;
            const result = await tourcollection.insertOne(add);
            console.log(result);
            res.json(result);
        })

        // DELETE tour API
        app.delete('/tour/:id', async (req, res) => {
            const id = req.params.id;
            const getId = { _id: ObjectId(id) };
            const deleteId = await tourcollection.deleteOne(getId);
            res.json(deleteId);
        })

        //UPDATE tour API
        app.put('/tour/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTour = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const update = {
                $set: {
                    name: updatedTour.name, email: updatedTour.email, status: updatedTour.status, title: updatedTour.title, img: updatedTour.img, cost: updatedTour.cost, category: updatedTour.category, details: updatedTour.details, location: updatedTour.location
                },
            };
            const result = await tourcollection.updateOne(filter, update, options);
            res.json(result);
        })


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Server...')
})
app.listen(port, () => {
    console.log("Running port", port)
})






