const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient,ServerApiVersion,ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());


app.get("/", (req, res) => {
  res.send("College Booker Server is running");
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.njyz70v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const collegesCollection = client.db("collegeBooker").collection("colleges");
    const applyCollection = client.db("collegeBooker").collection("applyColleges");
 

    // get single college using params
    app.get("/colleges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegesCollection.findOne(query);

      res.send(result);
    });

// get all college
    app.get("/allColleges", async (req, res) => {
      const result = await collegesCollection.find().toArray();
      res.send(result);
    });

      // api for search
      app.get("/colleges/searchbyName/:text", async (req, res) => {
        const text = req.params.text;
  
        const result = await collegesCollection
          .find({
            $or: [{ fullName: { $regex: text, $options: "i" } }],
          })
          .toArray();
        res.send(result);
      });
// apply for admission
    app.post("/applyColleges", async (req, res) => {
      const newCollege = req.body;

      const result = await applyCollection.insertOne(newCollege);
      res.send(result);
    });

// get apply colleges
app.get("/allAppliedColleges", async (req, res) => {
  // console.log(req.query);
  const query = { email: req.query.email };
  const result = await applyCollection.find(query).toArray();
  res.send(result);
  // console.log(result);
});

  // send revies
  app.patch("/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const updateCollege = req.body;

    const filter = { _id: new ObjectId(id) };
    const option = { upsert: true };

    const updateDoc = {
      $set: {
        reviews: updateCollege.reviews,
        ratting:updateCollege.ratting
      },
    };
    const result = await collegesCollection.updateOne(
      filter,
      updateDoc,
      option
    );
    res.send(result);
  });
     // update profile
     app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updateProfile = req.body;
      console.log(updateProfile);
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const updateDoc = {
        $set: {
          name: updateProfile.name,
          email: updateProfile.email,
          address: updateProfile.address,
        },
      };
      const result = await applyCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`college booker is running on port ${port}`);
});
