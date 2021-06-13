"use strict";
const express = require("express");
const app = express();
const User = require("./models/user");
const cors = require("cors");
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();

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
    if (!err) {
      res.send(result);
    }
  });
});

app.post("/api/users", bodyParser.urlencoded({ extended: true }), (req, res) => {
  const user = new User({
    username: req.body.username,
  });
  user.save((err, result) => {
    if (!err) {
      let output = {};
      output.username = result.username;
      output._id = result._id;
      res.send(output);
    }
  });
});

app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: true }), async (req, res) => {
  const query = { _id: req.params._id };
  let session = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date
  };
  if (session.date === '') {
    session.date = new Date().toISOString.substring(0, 10);
  }
  const input = {
    $push: { log: session },
  };
  User.findOneAndUpdate(query, input, { "new": true }, (err, result) => {
    if (err) {
      res.send(err);
    }
    let output = {}
    output['_id'] = result._id;
    output['username'] = result.username;
    output['description'] = session.description;
    output['duration'] = session.duration;
    output['date'] = new Date(session.date).toDateString();
    res.send(output);
  });
});

app.get("/api/users/:_id/logs/:from?/:to?/:limit?", (req, res) => {
  User.findOne({ _id: req.params._id }, { __v: 0 }, (err, result) => {
    if (err) { console.log(err); }
    let responseObject = {};
    responseObject['_id'] = result._id;
    responseObject['username'] = result.username;
    responseObject['count'] = result.log.length;  
    if (req.query.from || req.query.to) {
      let fromDate = new Date(0);
      let toDate = new Date();
      if (req.query.from) {
        fromDate = new Date(req.query.from);
      }
      if (req.query.to) {
        fromDate = new Date(req.query.to);
      }
      fromDate = fromDate.getTime();
      toDate = toDate.getTime();

      responseObject.log = result.log.filter((session) => {
        let sessionDate = new Date(session.date).getTime();
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }
    if (req.query.limit) {
      responseObject['log'] = result.log.slice(0, req.query.limit);
    } else {
      responseObject['log'] = result.log;
    }
    res.send(responseObject);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
