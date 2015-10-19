"use strict";

const Path = require("path"),
      Fs = require("fs"),
      Glob = require("glob").sync,
      Schema = require("mongoose").Schema,
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
    }, model.triggers)

    watcher.on("update", (results) => {

      // set _id to be a string unless it is needed to be something else
      model.schema._id || (model.schema._id = String);
      const Collection = MongoDB.model(
        model.collection, new Schema(model.schema), model.collection
      );

      // ensure mapping won't fell
      results.added || (results.added = []);
      results.removed || (results.removed = []);


      // upsert the clean and mapped document via
      // http://mongoosejs.com/docs/api.html#model_Model.update
      let added = results.added.map(model);
      for (let doc of added) {

        let setter = {};
        setter[model.idField] = doc[model.idField];

        const inCaseId = Random.insecure.id();

        // in order to match Meteors _id generation, we use a setOnInsert
        // to add our string _id
        // thanks https://jira.mongodb.org/browse/SERVER-9958
        let updateDoc = {};
        updateDoc["$set"] = doc;
        updateDoc["$setOnInsert"] = {
          _id: inCaseId
        };

        Collection.update(setter, updateDoc, {upsert: true}, (err, raw) => {
          if (err) return console.error(err);

          console.log('The raw response from Mongo was ', raw);
        });
      }


      // remove the clean and mapped document (for lookup purposes) via
      // http://mongoosejs.com/docs/api.html#query_Query-remove
      let removed = results.removed.map(model);
      for (let doc of removed) {
        console.log(doc[model.idField]);
      }


    })
  }

  for (let mapping of mappings) {
    watch(mapping);
  }

}
