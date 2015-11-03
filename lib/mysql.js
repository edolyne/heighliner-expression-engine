"use strict";

const Fs = require("fs"),
      Path = require("path"),
      Url = require("url"),
      MySQL = require("mysql"),
      Sync = require("deasync");


// local development handling for docker-machine ips being different
let dockerhost = "192.168.99.100"
if (process.env.DOCKER_HOST) {
  const hostObj = Url.parse(process.env.DOCKER_HOST)
  dockerhost = hostObj.host
}

// sql connections
const SQLSettings = {
  host        : process.env.MYSQL_HOST || dockerhost,
  user        : process.env.MYSQL_USER || "root",
  password    : process.env.MYSQL_PASSWORD || "password",
  database    : process.env.MYSQL_DB || "ee_local",
  port        : 3306,
  minInterval : 200,
  connectTimeout: 20000,
  ssl: process.env.MYSQL_SSL || false
};

// connect to db
let started = false;
const connection = MySQL.createConnection(SQLSettings);
connection.connect((err) => {
  if (err) { console.log(err); closeAndExit(); }

  started = true;
});


// shut down connection on ext
function closeAndExit() {

  if (started) {
    connection.end();
  }

  process.exit();
  return
}

// Close connections on hot code push
process.on("SIGTERM", closeAndExit);

// Close connections on exit (ctrl + c)
process.on("SIGINT", closeAndExit);



// export lookup module
module.exports = function mysql(file, data, cb){

  const variableRegex = /(?:\$\{(?:[\s\S]*?)\})/gmi;

  // ensure arguments are correct
  if (typeof(data) === "function" && !cb) {
    cb = data;
    data = {};
  }

  let query = Fs.readFileSync(
    file,
    { encoding: "utf8" }
  ).toString()

  // replace variables in query via data object
  // ${foobar} = value when data = {foobar: value}
  let match = query.match(variableRegex);
  for (let key of match) {
    let cleanedKey = key.replace("${", "").replace("}", "");

    let val = cleanedKey.split('.').reduce((previous, current) => {

      return previous.hasOwnProperty(current) &&
        previous[current] || previous;


    }, data);
    query = query.replace(key, val);
  }

  // async call
  if (cb) {
    connection.query(query, cb);
    return
  }

  // sync call
  let results = null,
      done = false;

  const syncQuery = connection.query(query, (err, row, fields) => {
    results = {
      rows: row,
      fields: fields
    }

    done = true;
  });


  Sync.loopWhile(function(){return !done;});

  return results

}
