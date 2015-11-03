"use strict";

const Helpers = require("./util/helpers");


module.exports = function(doc){
  const date = Helpers.getDate(doc.day, doc.month, doc.year);
  const entryDate = Helpers.getDateFromUnix(doc.entry_date);
  const actualDate = Helpers.getDateFromUnix(doc.actual_date);

  const speakers = Helpers.splitByNewlines(doc.speakers);
  const tags = Helpers.splitByNewlines(doc.tags);

  const description = Helpers.cleanMarkup(doc.description);

  const lowBitrate = Helpers.getVideo(doc.entry_id, "674");
  const mediumBitrate = Helpers.getVideo(doc.entry_id, "673");
  const highBitrate = Helpers.getVideo(doc.entry_id, "672");
  const audio = Helpers.getVideo(doc.entry_id, "675");

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
    video: {
      lowBitrate: lowBitrate,
      mediumBitrate: mediumBitrate,
      highBitrate: highBitrate,
      audio: audio
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
  video: {
    lowBitrate: Object,     // video_low_bitrate
    mediumBitrate: Object,  // video_medium_bitrate
    highBitrate: Object,    // video_high_bitrate
    audio: Object           // audio
  }
};

module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" }
];
