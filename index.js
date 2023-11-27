const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://review:HKUPaZPB2F9VEVw6@cluster0.65qq53i.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const service = client.db("review").collection("service");
const review = client.db("review").collection("review");
async function run() {
  try {
    app.get("/", (req, res) => {
      res.send("Server is ok");
    });
    app.get("/service", async (req, res) => {
      const load = parseInt(req.query.load);
      const query = {};
      const qursor = service.find(query);
      const count = await service.estimatedDocumentCount();
      const data = await qursor.limit(load).toArray();
      res.send({ data, count });
      console.log(load);
    });
    app.get("/service/review", async (req, res) => {
      const query = {};
      const qursor = service.find(query);
      const data = await qursor.toArray();
      res.send({ data });
    });

    app.get("/service/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };

      const cursor = await service.findOne(query);

      res.send(cursor);
    });

    app.put("/service/review/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const query = { _id: new ObjectId(id) };
      const qusor = await service.findOne(query);

      const oldReview = qusor.review;
      const data = req.body;
      const newdata = [...oldReview, data];

      const options = { upsert: true };

      const updateDoc = {
        $set: {
          review: newdata,
        },
      };
      const result = await service.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.post("/service/review/all-review", async (req, res) => {
      const reviewData = req.body;
      const result = await review.insertOne(reviewData);
      res.send(result);
    });
    app.get("/service/review/my-review", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const qursor = review.find(query);
      const data = await qursor.toArray();
      res.send(data);
    });
    app.delete("/delete-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await review.deleteOne(query);
      console.log(id);
      res.send(result);
    });
    app.get("/service-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { itemId: id };
      const qursor = review.find(query);
      const data = await qursor.toArray();
      res.send(data);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running");
});
