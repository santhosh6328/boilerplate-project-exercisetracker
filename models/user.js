const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect("mongodb+srv://new_user:mongoadmin@cluster0.ek5b4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model("User", {
  username: String,
  log: [
    {
      description: String,
      duration: Number,
      date: String
    },
  ],
});

module.exports = User;