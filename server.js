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

let userSchema = new mongoose.Schema({
  name: String,
  exercises: [
    {
      duration: Date,
      description: String,
      date: Date,
    },
  ],
});

const User = mongoose.model("User", userSchema);

app.get("/api/exercise/users", (req, res, done) => {
  User.find({}, (err, users) => {
    if (err) return console.log(err);
    res.send(users);
    done(null, users);
  });
});

app.post("/api/exercise/new-user", (req, res, next) => {
  let user = new User({ name: req.body.username });
  user.exercises = [];
  user.save();
  res.json(user);
});

app.post("/api/exercise/add", (req, res, next) => {
  User.findOne({ _id: req.body.userId }, (err, user) => {
    let date = new Date();
    if (req.body.date) {
      date = new Date(req.body.date);
    }
    user.exercises.push({
      duration: new Date(req.body.duration),
      description: req.body.description,
      date: date,
    });
    user.save();
    res.status(200).json(user);
  });
});

app.get("/api/exercise/log", (req, res, next) => {
  let to = new Date();
  if (req.query.to) {
    to = new Date(req.query.to);
  }
  let from = new Date(1900 - 10 - 10);
  if (req.query.from) {
    from = new Date(req.query.from);
  }

  let limit = req.query.limit || null;

  User.findOne({ _id: req.query.userId }, (err, user) => {
    let exercises = user.exercises;
    let filtered = [...exercises].filter(
      (ex) => ex.date.getTime() >= from.getTime() && ex.date.getTime() <= to.getTime()
    );
    if (!limit) {
      limit = filtered.length;
    }
    let resArr = [];
    for (let i = 0; i < filtered.length && i < limit; i++) {
      resArr.push({
        duration: filtered[i].duration,
        description: filtered[i].description,
        date: filtered[i].date,
      });
    }
    res.send(resArr);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
