"use strict";

const Levelup = require("levelup"),
      Fs = require("fs"),
      Mongoose = require("mongoose"),
      Util = require("util"),
      Diff = require("deep-diff").diff,
      EventEmitter = require("events"),
      Path = require("path");

let Store = {};

// set temp store location
let dbPath = Path.resolve(__dirname, "../../", "db");
if (process.env.DOCKER_HOST) {
  dbPath = Path.resolve(__dirname, "../", ".db");
}

// make the database
const db = Levelup(dbPath, { db: require("memdown") });

function Model(collection, schema) {
  this.collection = collection;
  this.schema = schema;
  this.db = db;

  this._model = Mongoose.model(collection, schema);


};

Util.inherits(Model, EventEmitter);

Model.prototype.remove = function remove(setter, callback) {

  setter.collection = this.collection;
  const id = JSON.stringify(setter);

  db.get(id, (err, previousValue) => {

    if (err && !err.notFound) {
      callback(err);
      return;
    }

    if (err && err.notFound) { callback(null); return; }

    db.del(id, (err) => {
      if (err) {
        callback(err);
        return;
      }


      const prevDoc = JSON.parse(previousValue);
      const _id = prevDoc._id

      this.emit("remove", _id);
    });
  })

};

Model.prototype.update = function update(setter, doc, options, callback) {
  // body...

  const rawDoc = doc["$set"];
  const _id = doc["$setOnInsert"]._id;
  const document = new this._model(rawDoc);

  // validate document
  if (document.validateSync()) {
    let err = new Error(document.validateSync().toString());
    callback(err);
    return;
  }

  setter.collection = this.collection;
  const id = JSON.stringify(setter);

  // lookup existing doc in store
  this.db.get(id, (err, previousValue) => {

    // doesn't exist, yay! lets store it
    if (err && err.notFound){
      rawDoc._id = _id;
      const docHash = JSON.stringify(rawDoc);

      this.db.put(id, docHash, (err) => {
        if (err) {
          callback(err);
          return;
        }

        this.emit("add", rawDoc);
      });
      return;
    }

    if (err) {
      callback(err);
      return;
    }

    // rawDoc was found! Lets compare!
    const prevDoc = JSON.parse(previousValue);
    const prevId = prevDoc._id;
    delete prevDoc._id;

    // if different then previous, update with new doc
    if (Diff(previousValue, rawDoc).length) {
      rawDoc._id = prevId;
      this.db.put(id, JSON.stringify(rawDoc), (err) => {
        if (err) {
          callback(err);
          return;
        }

        this.emit("update", rawDoc);
      });
      return
    }



  });


};


// Wrapping method
Store.model = function model(collection, schema) {

  return new Model(collection, schema);
};

module.exports = Store;
