"use strict";

const LiveSelect = require("mysql-live-select"),
      Fs = require("fs"),
      Path = require("path"),
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

let started = false;
const mySQL = new LiveSelect(SQLSettings, (err) => {
  if (err) { console.log(err); closeAndExit(); }

  started = true;
});

function closeAndExit() {

  if (started) {
    mySQL.end();
  }

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

let opts = {};
if (process.env.MONGO_SSL) {
  const cert = Fs.readFileSync(Path.join(__dirname, "compose.pem"));
  opts.server = {
    sslValidate: true,
    sslCA: [cert],
    connectWithNoPrimary: true
  }
}

Mongoose.connect(mongoURL, opts);

const MongoDB = Mongoose.connection;

MongoDB.on("error", (err) => {
  if (err) { console.log(err); closeAndExit(); }
});

MongoDB.once("open", function (callback) {
  // yay!
})
// "mongodb://apollos:fo44BydLVHBZ@aws-us-east-1-portal.1.dblayer.com:10863,aws-us-east-1-portal.0.dblayer.com:10863/apollos-mongodb&db=alpha"
// mongodb://apollos:fo44BydLVHBZ@aws-us-east-1-portal.1.dblayer.com:10863,aws-us-east-1-portal.0.dblayer.com:10863/alpha?ssl=true
// mongodb://apollos:fo44BydLVHBZ@aws-us-east-1-portal.0.dblayer.com:10863/alpha?ssl=true
/*

  Library


*/
const Sync = require("./lib/sync");

Sync(mySQL, MongoDB);
