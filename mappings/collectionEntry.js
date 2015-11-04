"use strict";

const Helpers = require("./util/helpers");


module.exports = function(doc){
  const date = Helpers.getDate(doc.day, doc.month, doc.year);
  const entryDate = Helpers.getDateFromUnix(doc.entry_date);
  const actualDate = Helpers.getDateFromUnix(doc.actual_date);

  const speakers = Helpers.splitByNewlines(doc.speakers);
  const tags = Helpers.splitByNewlines(doc.tags);

  const description = Helpers.cleanMarkup(doc.description);

  let media = [];
  if (doc.video_low_bitrate ||
      doc.video_medium_bitrate ||
      doc.video_high_bitrate ||
      doc.audio) {
    media = Helpers.getMedia(doc.entry_id);
  }

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    status: doc.status,
    title: doc.title,
    seriesId: doc.series_id,
    meta: {
      date: date,
      channelId: doc.channel_id,
      entryDate: entryDate,
      actualDate: actualDate
    },
    content: {
      week: doc.week,
      speakers: speakers,
      tags: tags,
      description: description,
      ooyalaId: doc.ooyala_id
    },
    media: media
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
  seriesId: String,     // series_id
  meta: {
    date: Date,
    channelId: String,  // channel_id
    entryDate: Date,    // entry_date
    actualDate: Date    // actual_date
  },
  content: {
    week: String,       // week
    speakers: String,   // speakers
    tags: String,       // tags
    description: String,// description
    ooyalaId: String,   // ooyala_id
  },
  media: [{
    fileName: String,
    fileType: String,
    s3: String,
    cloudfront: String
  }]
};

module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" }
];
