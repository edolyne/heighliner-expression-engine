"use strict";

const LiveSelect = require("mysql-live-select"),
      Mongoose = require('mongoose');


/*

  SQL

*/
const SQLSettings = {
  host        : process.env.MYSQL_HOST || "192.168.99.100",
  user        : process.env.MYSQL_USER || "root",
  password    : process.env.MYSQL_PASSWORD || "password",
  database    : process.env.MYSQL_DB || "ee_local",
  port        : 3306,
  minInterval : 200,
  connectTimeout: 20000,
  ssl: process.env.MYSQL_SSL || false
};


const mySQL = new LiveSelect(SQLSettings, (err) => {
  if (err) { console.log(err); closeAndExit(); }
});

function closeAndExit() {
  mySQL.end();
  process.exit();
  return
}

// Close connections on hot code push
process.on("SIGTERM", closeAndExit);

// Close connections on exit (ctrl + c)
process.on("SIGINT", closeAndExit);


/*

  Mongo

*/
let mongoURL = process.env.MONGO_URL || "mongodb://192.168.99.100/test"
Mongoose.connect(mongoURL);

const MongoDB = Mongoose.connection;

MongoDB.on("error", (err) => {
  if (err) { console.log(err); closeAndExit(); }
});

MongoDB.once("open", function (callback) {
  // yay!
})


/*

  Library


*/
const Sync = require("./lib/sync");

Sync(mySQL, MongoDB);
