"use strict";

// flightplan.js
var plan = require("flightplan"),
      user = "ubuntu",
      site = "expression-engine-heighliner";

plan.target("production", [
  {
    host: "ec2-54-173-91-140.compute-1.amazonaws.com",
    username: user,
    agent: process.env.SSH_AUTH_SOCK
  }
]);

var tmpDir = site + "-" + new Date().getTime();

// run commands on localhost
plan.local(function(local) {
  local.log("Run build");
  local.exec("npm i");

  local.log("Copy files to remote hosts");
  var filesToCopy = local.exec("git ls-files", {silent: true});
  console.log(filesToCopy);
  // rsync files to all the target"s remote hosts
  local.transfer(filesToCopy, "/tmp/" + tmpDir);
});

// run commands on the target"s remote hosts
plan.remote(function(remote) {
  remote.log("Move folder to web root");
  remote.exec("cp -R /tmp/" + tmpDir + " ~");
  remote.rm("-rf /tmp/" + tmpDir);

  remote.log("Install dependencies");
  remote.exec("pm2 -v || npm install -g pm2")
  remote.exec("npm --production --prefix ~/" + tmpDir
                            + " install ~/" + tmpDir);

  remote.log("Setting environment variables");
  remote.exec(
    "set MYSQL_HOST=" + process.env.MYSQL_HOST +
    " MYSQL_DB=" + process.env.MYSQL_DB +
    " MYSQL_USER=" + process.env.MYSQL_USER +
    " MYSQL_PASSWORD=" + process.env.MYSQL_PASSWORD +
    " MONGO_URL=" + process.env.MONGO_URL +
    " MYSQL_SSL=true"
  );

  remote.log("Reload application");
  remote.exec("ln -snf ~/" + tmpDir + " ~/" + site);
  remote.exec("pm2 stop " + site);
  remote.exec("pm2 start " + site + " --node-args=\"--harmony\"");
});
