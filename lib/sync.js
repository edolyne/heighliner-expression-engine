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

    // set _id to be a string unless it is needed to be something else
    model.schema._id || (model.schema._id = String);
    const Collection = MongoDB.model(
      model.collection, new Schema(model.schema), model.collection
    );

    /*

      In order to correctly delete entrys if information is deleted
      from the mysql db (especially in cases of multi tables)
      we spy the condition callback (if it exist) for each
      table and cache the changed rows on deletes. This can be tricky
      if a row is deleted that isn't the source table (for ee this would
      be something like the exp_channel_data table) so we need a way to
      verify that the entry needs to be deleted and not just sub content

      @TODO - test and figure this out for multi table joins

    */

    for (let trigger of model.triggers) {
      let oldCondition = function(){ return true; }

      if (trigger.condition) {
        //spy
        oldCondition = trigger.condition

      }

      trigger.condition = function spyCondition(row, newRow, deleted){

        if (deleted) {

          let setter = {};
          let entryId = Parser.camelize(model.identifier);
          setter[entryId] = row[model.identifier];

          // remove the clean and mapped document (for lookup purposes) via
          // http://mongoosejs.com/docs/api.html#query_Query-remove
          Collection.remove(setter, (err) => {
            if (err) return console.error(err);
          });
        }

        // return oldCondition(row, newRow, deleted);
        return true;
      }

    }

    let watcher = mySQL.select(function(esc, escId){
      return Parser(esc, escId, file);
    }, model.triggers)


    watcher.on("update", (results) => {

      // ensure mapping won't fail
      results.added || (results.added = []);

      // upsert the clean and mapped document via
      // http://mongoosejs.com/docs/api.html#model_Model.update
      let added = results.added.map(model);
      for (let doc of added) {

        doc.content.images.map(image => {
          let triggers = [
            { table: "exp_channel_data" },
            { table: "exp_channel_titles" },
            { table: "exp_channel_member_data" }
          ];
          let query = "SELECT d.entry_id FROM escId(exp_channel_data) AS d LIMIT 1";
          let dd = mySQL.select(function(esc, escId) {
            return Parser(esc, escId, query);
          }, triggers);

          dd.on("update", (results) => {
            console.log(results.added);
          });

        });

        let setter = {};
        let entryId = Parser.camelize(model.identifier);
        setter[entryId] = doc[entryId];

        console.log("data from: " + doc[entryId]);
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


    })
  }

  for (let mapping of mappings) {
    watch(mapping);
  }

}
