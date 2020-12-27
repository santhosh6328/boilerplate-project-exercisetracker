const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI);

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: String,
  description: String,
  date: String,
  created: String,
});

const Person = mongoose.model("Person", personSchema);

app.post("/api/exercise/new-user/", (req, res, done) => {
  createdDate = new Date().toLocaleDateString("en-CA");
  var newuser = new Person({
    name: req.body.username,
    duration: "",
    description: "",
    date: "",
    created: createdDate,
  });
  console.log(typeof req.body.username);
  newuser.save((err, data) => {
    if (err) return console.error(err);
    var result = {
      username: req.body.username,
      _id: data._id,
    };
    res.send(result);
    done(null, data);
  });
});

app.get("/api/exercise/users", (req, res, done) => {
  Person.find({}, (err, users) => {
    if (err) return console.log(err);
    res.send(users);
    done(null, users);
  });
});

app.post("/api/exercise/add", (req, res, done) => {
  // var inputDuration = req.body.duration
  var inputDescription = req.body.description;
  console.log(typeof req.body.duration);
  console.log(typeof req.body.time);
  Person.findById({ _id: req.body.userId }, (err, person) => {
    if (err) return console.log(err);
    person.description = req.body.description;
    person.duration = req.body.duration;
    person.date = req.body.date || new Date().toLocaleDateString("en-CA");
    person.save((err, updatedPerson) => {
      if (err) return console.error(err);
      done(null, updatedPerson);
    });
    res.send(person);
    done(null, person);
  });
});

app.get("/api/exercise/log/:userId/:from?/:to?/:limit?", (req, res, done) => {
  if (req.params.from) {
    Person.findById({ _id: req.params.userId }, (err, personId) => {
      if (err) return console.log(err);
      res.send(personId);
      done(null, personId);
    });
  } else {
    Person.find({ date: { $gte: req.params.from, $lt: req.params.to } })
      .sort({ name: 1 })
      .limit(req.params.limit)
      .select()
      .exec((err, person) => {
        if (err) return console.log(err);
        done(null, person);
      });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
