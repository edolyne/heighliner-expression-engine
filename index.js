"use strict";

if (process.env.NEW_RELIC_KEY){
  // monitor
  require("newrelic");
}


const LiveSelect = require("mysql-live-select"),
      Fs = require("fs"),
      Path = require("path"),
      Url = require("url"),
      Mongoose = require('mongoose'),
      DDPServer = require("./lib/ddp");

let dockerhost = "192.168.99.100"
if (process.env.DOCKER_HOST) {
  const hostObj = Url.parse(process.env.DOCKER_HOST)
  dockerhost = hostObj.host
}
/*

  SQL

*/
const SQLSettings = {
  host        : process.env.MYSQL_HOST || dockerhost,
  user        : process.env.MYSQL_USER || "root",
  password    : process.env.MYSQL_PASSWORD || "password",
  database    : process.env.MYSQL_DB || "ee_local",
  port        : 3306,
  minInterval : 200,
  connectTimeout: 200000,
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
// let mongoURL = process.env.MONGO_URL || "mongodb://" + dockerhost + "/test"
//
// let opts = {};
// if (process.env.MONGO_SSL) {
//   const cert = Fs.readFileSync(Path.join(__dirname, "compose.pem"));
//   opts.server = {
//     sslValidate: true,
//     sslCA: [cert],
//     connectWithNoPrimary: true
//     // ca: [cert],
//     // ssl: true,
//     // poolSize: 1,
//     // reconnectTries: 1
//
//   }
// }
//
// Mongoose.connect(mongoURL, opts);
//
// const MongoDB = Mongoose.connection;
//
// MongoDB.on("error", (err) => {
//   if (err) { console.log(err); closeAndExit(); }
// });
//
// MongoDB.once("open", function (callback) {
//   // yay!
// })

/*

  DDP Server

  Alternative to duplication of data

*/

const DDP = new DDPServer();

/*

  Library


*/
const Sync = require("./lib/sync");

Sync(mySQL, DDP);
