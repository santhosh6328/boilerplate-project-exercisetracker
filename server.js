"use strict";
const express = require("express");
const app = express();
const User = require("./models/user");
const cors = require("cors");

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", (req, res) => {
  User.find((err, result) => {
    if (err) return err;
    res.send(result);
  });
});

app.post("/api/users", (req, res) => {
  const user = new User({
    username: req.body.username,
  });
  user.save((err, result) => {
    if (err) throw err;
    let output = {};
    output._id = result._id;
    output.username = result.username;
    res.send(output);
  });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const query = { _id: req.params._id };
  const input = {
    $push: {
      log: {
        description: req.body.description,
        duration: req.body.duration,
      },
    },
  };
  User.findOneAndUpdate(query, input, (err, result) => {
    let output = {};
    output._id = result._id;
    output.username = result.username;
    output.log = result.log;
    res.send(output);
  });
});

app.get("/api/users/:_id/logs/:from?/:to?/:limit?", (req, res) => {
  User.findOne({ _id: req.params._id }, { __v: 0 }, (err, result) => {
    if (err) console.log(err);
    let output = {};
    output._id = result._id;
    output.username = result.username;
    output.count = result.log.length;
    if (req.params.limit) {
      if (output.count > req.params.limit) {
        output.log = result.log.slice(0, req.params.limit);
      }
    } else {
      output.log = result.log;
    }
    res.send(output);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
