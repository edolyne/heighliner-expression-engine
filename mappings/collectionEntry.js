"use strict";

const Helpers = require("./util/helpers"),
      Schemas = require("./util/schemas");


module.exports = function(doc){
  const date = Helpers.getDate(doc.day, doc.month, doc.year);
  const entryDate = Helpers.getDateFromUnix(doc.entry_date);
  const actualDate = Helpers.getDateFromUnix(doc.actual_date);

  const speakers = Helpers.splitByNewlines(doc.speakers);
  const tags = Helpers.splitByNewlines(doc.tags);

  const description = Helpers.cleanMarkup(doc.description);

  const scripture = doc.scripture === "1" ? false : doc.scripture;

  const images = Helpers.getFiles(doc.entry_id, doc.positions, "da.col_id_232");

  let media = [];
  if (doc.video_low_bitrate ||
      doc.video_medium_bitrate ||
      doc.video_high_bitrate ||
      doc.audio) {
    media = Helpers.getMedia(doc.entry_id);
  }

  let week = null;
  // only include week if sermon
  // b/c stories returns "Trailer"?
  if (doc.channel_id === "3") {
    week = doc.week;
  }

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    status: doc.status,
    title: doc.title,
    subtitle: doc.subtitle,
    collectionId: doc.collection_id,
    meta: {
      urlTitle: doc.url_title,
      date: date,
      channelId: doc.channel_id,
      entryDate: entryDate,
      actualDate: actualDate
    },
    content: {
      body: doc.body,
      scripture: scripture,
      week: week,
      speakers: speakers,
      tags: tags,
      description: description,
      ooyalaId: doc.ooyala_id,
      images: images
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
  subtitle: String,     // subtitle
  collectionId: String,     // series_id
  meta: Schemas.Meta,
  content: {
    body: String,       // body
    scripture: String,  // scripture
    week: String,       // week
    speakers: String,   // speakers
    tags: String,       // tags
    description: String,// description
    ooyalaId: String,   // ooyala_id
    images: [Schemas.Images]   // positions
  },
  media: [Schemas.Media]
};

module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" }
];
