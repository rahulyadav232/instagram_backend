const mongoose = require("mongoose");

require("dotenv").config();

const url = `mongodb+srv://rah_yadav50:nDcYggfO5WQz8uyx@cluster0.2sukaqn.mongodb.net/`;

const dbName = "Instagram";

const connect = mongoose.connect(url + dbName, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = connect;
