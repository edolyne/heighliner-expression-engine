"use strict";

const WebSocket = require("faye-websocket"),
    EJSON = require("ejson"),
    http = require("http"),
    Diff = require("deep-diff").diff;


const DDPServer = function DDPServer(opts){

  opts || (opts = {});


  let server = opts.httpServer,
      methods = opts.methods || {},
      collections = {},
      subscriptions = {};


  // make the server
  if (!server) {
    server = http.createServer(function (request, response) {
      response.writeHead(200, {"Content-Type": "application/javascript"});
      response.end(JSON.stringify({online: true}));
    });
    server.listen(opts.port || 8080);
  }

  server.on("upgrade", (request, socket, body) => {

    if (WebSocket.isWebSocket(request)) {

      let ws = new WebSocket(request, socket, body);
      let session_id = "" + new Date().getTime();
      subscriptions[session_id] = {};

      function sendMessage(data) {
        ws.send(EJSON.stringify(data));
      }

      ws.on("message", function(event) {
        var data = JSON.parse(event.data);
        switch (data.msg) {
          // connection
          case "connect":

            sendMessage({
              msg: "connected",
              session: session_id
            });

            break;

          case "method":
            sendMessage({
              msg: "methods not supported",
              session: session_id
            });
            break;

          case "sub":

            subscriptions[session_id][data.name] = {
              added: function(id, doc) {

                sendMessage({
                  msg: "added",
                  collection: data.name,
                  id: id,
                  fields: doc
                })
              },
              changed: function(id, fields, cleared) {
                delete fields._id;
                sendMessage({
                  msg: "changed",
                  collection: data.name,
                  id: id,
                  fields: fields,
                  cleared: cleared
                })
              },
              removed: function(id) {
                sendMessage({
                  msg: "removed",
                  collection: data.name,
                  id: id
                })
              }
            };

            const docs = collections[data.name].docs;
            for (let id in docs) {
              subscriptions[session_id][data.name].added(id, docs[id]);
            }


            sendMessage({
              msg: "ready",
              subs: [data.id]
            });

            break;

          case "ping":

            sendMessage({
              msg: "pong",
              id: data.id
            });

            break;

          default:
        }
      });

      ws.on("close", function(event) {
        delete subscriptions[session_id];
        ws = null;
        session_id = null;
      });
    }
  });

  this.publish = function publish(name) {

    if (name in collections) {
      throw new Error(500, "A collection named " + key + " already exists");
    }

    let documents = {};

    function add(id, doc) {
      documents[id] = doc;

      for (let client in subscriptions) {
        if (subscriptions[client][name]) {
          subscriptions[client][name].added(id, doc);
        }
      }
    }

    function sendChanged(id, changed, cleared) {
      for (var client in subscriptions)
        if (subscriptions[client][name])
          subscriptions[client][name].changed(id, changed, cleared);
    }

    function change(id, doc) {

      /*

        We need to write an efficient way to diff objects here
        otherwise we will send too much data over teh air

      */
      // let diffs = Diff(documents[id], doc);
      // let changed = {};
      //
      // for (let diff in diffs) {
      //   let diffObj = diffs[diff];
      //   if (diffObj.kind === "E") {
      //     for (let path of diffObj.path) {
      //
      //     }
      //   }
      // }
      // let cleared = [];
      // for (let field in documents[id]) {
      //   if (!(field in doc)) {
      //     cleared.push(field)
      //     delete documents[id][field];
      //   }
      // }
      //
      // let changed = {};
      // for (let field in doc) {
      //   if (doc[field] != documents[id][field]) {
      //     documents[id][field] = changed[field] = doc[field];
      //   }
      // }
      documents[id] = doc;
      sendChanged(id, doc, []);
    }



    function remove(id) {
      delete documents[id];
      for (let client in subscriptions) {
        if (subscriptions[client][name]) {
          subscriptions[client][name].removed(id);
        }
      }

    }

    return collections[name] = {
      add: add,
      update: change,
      remove: remove,
      docs: documents
    }

  }

}

module.exports = DDPServer
