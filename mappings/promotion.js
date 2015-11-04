"use strict";

const Helpers = require("./util/helpers"),
      Schemas = require("./util/schemas");


module.exports = function(doc){
  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  const summary = Helpers.cleanMarkup(doc.summary);

  const images = Helpers.getFiles(doc.entry_id, doc.positions, "da.col_id_343");

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    title: doc.title,
    status: doc.status,
    meta: {
      date: date,
      channelId: doc.channel_id
    },
    content: {
      summary: summary,
      label: doc.label,
      images: images
    }
  }

  return cleanedData;
};


module.exports.identifier = "entry_id"
module.exports.collection = "promotion";

module.exports.schema = {
  entryId: String,      // entry_id
  siteId: String,       // site_id
  channelName: String,  // channel_name
  status: String,       // status
  title: String,        // title
  meta: {
    date: Date,         //
    channelId: String   // channel_id
  },
  content: {
    summary: String,          // field_id_1071 as summary
    label: String,            // field_id_1072 as label
    images: [Schemas.Images]  // field_id_1069 as positions
  }
}


module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" }
];
