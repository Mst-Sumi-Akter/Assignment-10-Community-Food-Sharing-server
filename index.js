const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port =process.env.PORT || 3000 ;


// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztnzz8f.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // Use existing DB and collection
    const db = client.db("food-sharing-db");
    const foodsCollection = db.collection("food");

    console.log(" MongoDB connected successfully!");

    // Root route
    app.get("/", (req, res) => {
      res.send(" PlateShare server is running!");
    });

    // GET all foods from collection
    app.get("/foods", async (req, res) => {
      try {
        const foods = await foodsCollection.find().toArray();
        res.send(foods);
      } catch (error) {
        console.error(" Error fetching foods:", error);
        res.status(500).send({ message: "Failed to fetch foods" });
      }
    });

    // Find by food_status
    app.get("/foods/status/:status", async (req, res) => {
      try {
        const status = req.params.status;
        const result = await foodsCollection.find({ food_status: status }).toArray();
        res.send(result);
      } catch (error) {
        console.error(" Error fetching by status:", error);
        res.status(500).send({ message: "Failed to fetch filtered foods" });
      }
    });

     //  Find one by ID
    const { ObjectId } = require('mongodb');
    app.get("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await foodsCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        console.error(" Error fetching by ID:", error);
        res.status(500).send({ message: "Invalid ID" });
      }
    });

    await db.command({ ping: 1 });
    console.log("Pinged your deployment successfully.");
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
