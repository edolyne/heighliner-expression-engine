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

const mySQL = new LiveSelect(SQLSettings, (err) => {
  if (err) { console.log(err); }
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
Mongoose.connect("mongodb://192.168.99.100/test");

const MongoDB = Mongoose.connection;
MongoDB.on("error", console.error.bind(console, "connection error:"));
MongoDB.once("open", function (callback) {
  // yay!
})


/*

  Library


*/
const Sync = require("./lib/sync");

Sync(mySQL, MongoDB);
