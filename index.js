const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.etbjr0z.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        const userCollection = client.db("ClassDB").collection("user");
        const requestCollection = client.db("ClassDB").collection("request");
        const addClassCollection = client.db("ClassDB").collection("addClass");


        app.get("/request", async (req, res) => {
            const cursor = requestCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/request/teacher/:email", async (req, res) => {
            const email = req.params.email;
            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: "forbidden access" });
            // }
            const query = { email: email };
            const user = await requestCollection.findOne(query);
            let teacher = false;
            if (user) {
                teacher = user?.status === "Approved";
            }
            res.send({ teacher });
        })

        app.post("/request", async (req, res) => {
            const request = req.body;
            console.log(request);
            const result = await requestCollection.insertOne(request);
            res.send(result);
        })

        app.patch("/request/:id", async (req, res) => {
            const id = req.params.id;
            const { action } = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: { status: action }
            }
            const result = await requestCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        app.get("/addclass", async (req, res) => {
            const cursor = addClassCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/addclass/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addClassCollection.findOne(query);
            res.send(result);
        })

        app.post("/addclass", async (req, res) => {
            const add = req.body;
            console.log(add);
            const result = await addClassCollection.insertOne(add);
            res.send(result);
        })

        app.patch("/addclass/:id", async (req, res) => {
            const id = req.params.id;
            const { action } = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: { classStatus: action }
            }
            const result = await addClassCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        app.put("/addclass/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const updatedClass = req.body;
            const updatedDoc = {
                $set: {
                    title: updatedClass.title,
                    price: updatedClass.price,
                    description: updatedClass.description,
                    image: updatedClass.image,
                }
            }
            const result = await addClassCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.delete("/addclass/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addClassCollection.deleteOne(query);
            res.send(result);
        })

        app.get("/user", async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.get("/user/admin/:email", async (req, res) => {
            const email = req.params.email;
            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: "forbidden access" });
            // }
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === "admin";
            }
            res.send({ admin });
        })

        app.post("/user", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            // const existingUser = await userCollection.findOne(query);
            // if (existingUser) {
            //     return res.send({ message: "User already exists", insertedId: null })
            // }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch("/user/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: "admin"
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.patch("/user/teacher/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: "teacher"
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Student and class management");
})

app.listen(port, () => {
    console.log(`Class is running on port ${port}`);
})