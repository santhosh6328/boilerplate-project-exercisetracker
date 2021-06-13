"use strict";
const express = require("express");
const app = express();
const User = require("./models/user");
const cors = require("cors");
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();
const moment = require("moment");

app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", (req, res) => {
  User.find({}, "-log", (err, result) => {
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
    output.username = result.username;
    output._id = result._id;
    res.send(output);
  });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const query = { _id: req.params._id };
  const input = {
    $push: {
      log: {
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: req.body.date,
      },
    },
  };
  User.findOneAndUpdate(query, input, { "new": true }, (err, result) => {
    if (err) {
      res.send(err);
    }
    // console.log(result);
    try {
      let output = {};
      output._id = result._id;
      output.username = result.username;
      var log_element = result.log.pop();
      var fomatted_date = moment(log_element["date"]).format('ddd MMM DD YYYY');
      console.log(log_element);
      output.date = fomatted_date;
      output.duration = log_element["duration"];
      output.description = log_element["description"];
      res.send(output);
    } catch (err) {
      console.log(err);
    }
  });
});

app.get("/api/users/:_id/logs/:from?/:to?/:limit?", (req, res) => {
  User.findOne({ _id: req.params._id }, { __v: 0 }, (err, result) => {
    if (err) { console.log(err); }
    try {
      let output = {};
      output._id = result._id;
      output.username = result.username;
      output.count = result.log.length;
      if (req.params.limit) {
        if (output.count > req.params.limit) {
          output.log = result.log.slice(0, req.params.limit);
          console.log(output);
        }
      } else {
        let temp_arr = result.log;
        temp_arr.map(({ duration, description, date }) => ({ duration, description, date }));
        output.log = temp_arr;
      }

      res.send(output);
    } catch (err) {
      console.log(err.message);
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
