"use strict";

const Helpers = require("./util/helpers");


module.exports = function(doc){
  const date = Helpers.getDate(doc.day, doc.month, doc.year);
  const entryDate = Helpers.getDateFromUnix(doc.entry_date);
  const startDate = Helpers.getDateFromUnix(doc.start_date);
  const endDate = Helpers.getDateFromUnix(doc.end_date);

  const tags = Helpers.getTags(doc.tags);

  const description = Helpers.cleanMarkup(doc.description);

  let downloads = [
    "col_id_223 as description",
    "col_id_224 as file",
    "col_id_225 as title"
  ].join(",\n");

  // we should put this in helpers
  downloads = Helpers.getMatrixWithFile(doc.entry_id, downloads, {
    pivot: "f.file_name",
    field: "file"
  });
  // downloads = downloads.map(download => {
  //
  //   // lookup s3 link
  //   if (download.file) {
  //     download.file = Helpers.getFile(
  //       doc.entry_id, download.file, "f.file_name"
  //     )[0].s3;
  //   }
  //
  //   return {
  //     description: download.description,
  //     title: download.title,
  //     file: download.file
  //   }
  // }).filter(download => {
  //   return download.description && download.title && download.file
  // });

  if (doc.positions === "1") {
    doc.positions = "Hero Image"; // why ee?
  }
  const images = Helpers.getFiles(doc.entry_id, doc.positions, "da.col_id_269");

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    status: doc.status,
    title: doc.title,
    meta: {
      urlTitle: doc.url_title,
      date: date,
      entryDate: entryDate,
      startDate: startDate,
      endDate: endDate,
      channelId: doc.channel_id
    },
    content: {
      description: description,
      hashtag: doc.hashtag,
      ooyalaId: doc.ooyala_id,
      images: images,
      collectionBackgroundColor: doc.collection_background_color,
      tags: tags
    },
    downloads: downloads
  };

  return cleanedData;
};


module.exports.identifier = "entry_id";
module.exports.collection = "collection";

module.exports.schema = {
  entryId: String,      // entry_id
  siteId: String,       // site_id
  channelName: String,  // channel_name
  status: String,       // status
  title: String,        // title
  meta: {
    urlTitle: String,   // url_title
    date: Date,         //
    entryDate: Date,    // entry_date
    startDate: Date,    // start_date
    endDate: Date,      // end_date
    channelId: String   // channel_id
  },
  content: {
    description: String,  // description
    hashtag: String,      // hashtag
    ooyalaId: String,     // ooyala_id
    images: [{}],         // positions
    collectionBackgroundColor: String, // collection_background_color
    tags: String          // tags
  },
  downloads: [{           // downloads
    description: String,
    title: String,
    file: String
  }]
}

module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" }
];
