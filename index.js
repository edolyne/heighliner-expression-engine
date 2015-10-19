"use strict";

const LiveSelect = require("mysql-live-select"),
      Mongoose = require('mongoose');


/*

  SQL

*/
const SQLSettings = {
  host        : "192.168.99.100",
  user        : "root",
  password    : "password",
  database    : "ee_local",
  serverId    : 256,
  minInterval : 200
};

const liveDb = new LiveSelect(SQLSettings, (err) => {
  if (err) { console.log(err); }
});

function closeAndExit() {
  liveDb.end();
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
Mongoose.connect("mongodb://192.168.99.100/test");

const db = Mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function (callback) {
  // yay!
})
