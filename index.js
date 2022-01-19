const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectID = require("mongodb").ObjectID;
//middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();
const port = 6060;

const password = "carUsermunna";

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nwuix.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const collection = client.db("servicecar").collection("addroute");

  app.post("/addService", (req, res) => {
    const newService = req.body;
    collection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result);
    });
    console.log(newService);
  });

  app.get("/services", (req, res) => {
    collection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // api for search
  app.get("/search", (req, res) => {
    const { from, to } = req.query;
    collection
      .find({ route: from.toLowerCase(), destination: to.toLowerCase() })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // specific bus routes
  app.get("/bus/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    collection.find({ _id: id }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  // api for search by key
  app.get("/searchByKey", (req, res) => {
    const { key, param2 } = req.query;
    // console.log(req.query);
    // collection.find({ from: key }).toArray((err, documents) => {
    //   res.send(documents);
    // });
    console.log(key);
    if (param2 === "r") {
      collection.find({ route: { $regex: key } }).toArray((err, documents) => {
        res.send(documents);
      });
    } else {
      collection
        .find({ destination: { $regex: key } })
        .toArray((err, documents) => {
          res.send(documents);
        });
    }
  });

  //update
  app.patch("/update/:itemId", (req, res) => {
    const id = req.params.itemId;
    collection
      .updateOne(
        { _id: id },
        {
          $set: { cost: req.body.cost, route: req.query.route },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  app.delete("/delete/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("deleted id", id);
    collection.findOneAndDelete({ _id: id }).then((result) => {
      res.send(result.deletedCount > 0);
      console.log("de", result);
    });
  });

  console.log("database connection");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
