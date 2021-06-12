const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model("User", {
  username: String,
  log: [
    {
      description: String,
      duration: String,
      date: {
          type: Date,
          default: Date.now
      },
    },
  ],
});

module.exports = User;
