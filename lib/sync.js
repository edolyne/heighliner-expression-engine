"use strict";

const Path = require("path"),
      Fs = require("fs"),
      Glob = require("glob").sync,
      Schema = require("mongoose").Schema,
      _ = require("lodash"),
      Random = require("./random"),
      Parser = require("./parser");


module.exports = (mySQL, MongoDB) => {

  let mappings = Glob(Path.join(__dirname, "../mappings/") + "**.sql")

  mappings = mappings.map((mapping) => {
    return Path.basename(mapping).replace(Path.extname(mapping), "")
  });


  function watch(fileName) {

    const model = require(
      Path.join(__dirname, "../mappings/", fileName + ".js")
    );

    let file = Fs.readFileSync(
      Path.join(__dirname, "../mappings/", fileName + ".sql"),
      { encoding: "utf8" }
    ).toString()

    let watcher = mySQL.select(function(esc, escId){
      return Parser(esc, escId, file);
    }, model.triggers);


    let cachedRows = []

    watcher.on("update", (results, rows) => {

      // set _id to be a string unless it is needed to be something else
      model.schema._id || (model.schema._id = String);
      const Collection = MongoDB.model(
        model.collection, new Schema(model.schema), model.collection
      );

      // ensure mapping won't fail
      results.added || (results.added = []);
      results.removed || (results.removed = []);


      // We do a map to get all identifiers from the the result
      // we use this to compare from the last response in order to
      // get a correct deletion diff
      const newRows = rows.map((x) => {
        return x[model.identifier]
      });

      // get removed ids from cache diff
      const removedIds = _.difference(cachedRows, newRows);

      // when a row is deleted, the mySQL package returns the index from
      // the previous added list as the signifier of a deletion
      // we see if we have the stored identifier and if we do then
      // we remove the item async style
      for (let id of removedIds) {

        // if the id wasnt in the previous list (e.g. came in from a limit change)
        if (cachedRows.indexOf(id) === -1){
          continue;
        }

        let setter = {};
        let entryId = Parser.camelize(model.identifier);
        setter[entryId] = id;

        /*

          Removing is not currently working, waiting on a response from
          the mySQL library author to better understand how deletes are
          piped up.

          https://github.com/numtel/mysql-live-select/issues/19

        */
        // remove the clean and mapped document (for lookup purposes) via
        // http://mongoosejs.com/docs/api.html#query_Query-remove
        // Collection.remove(setter, (err) => {
        //   if (err) return console.error(err);
        // });
      }

      // upsert the clean and mapped document via
      // http://mongoosejs.com/docs/api.html#model_Model.update
      let added = results.added.map(model);
      for (let doc of added) {

        let setter = {};
        let entryId = Parser.camelize(model.identifier);
        setter[entryId] = doc[entryId];

        // create a string based id to match meteor
        const inCaseId = Random.insecure.id();

        // in order to match Meteors _id generation, we use a setOnInsert
        // to add our string _id
        // thanks https://jira.mongodb.org/browse/SERVER-9958
        let updateDoc = {};
        updateDoc["$set"] = doc;
        updateDoc["$setOnInsert"] = {
          _id: inCaseId
        };

        // perform the upsert or update as needed
        Collection.update(setter, updateDoc, {upsert: true}, (err, raw) => {
          if (err) return console.error(err);
        });
      }

      // update the cache
      cachedRows = rows.map((x) => {
        return x[model.identifier]
      });

    })
  }

  for (let mapping of mappings) {
    watch(mapping);
  }

}
