"use strict";

const Helpers = require("./util/helpers");


module.exports = function(doc){
  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    status: doc.status,
    title: doc.title,
    meta: {
      date: date,
      channelId: doc.channel_id
    }
  };

  return cleanedData;
};


module.exports.identifier = "entry_id";
module.exports.collection = "collectionEntry";

module.exports.schema = {
  entryId: String,      // entry_id
  siteId: String,       // site_id
  channelName: String,  // channel_name
  status: String,       // status
  title: String,        // title
  meta: {
    date: Date,
    channelId: String
  }
};

module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" }
];
