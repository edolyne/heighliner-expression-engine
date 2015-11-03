"use strict";

const Helpers = require("./util/helpers");


module.exports = function(doc){
  let tags = Helpers.splitByNewlines(doc.field_id_1028);

  let images = Helpers.getFiles(doc.entry_id, doc.field_id_664, "da.col_id_218");

  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  const scripture = doc.field_id_654 === "1" ? false : doc.field_id_654;

  const markup = Helpers.cleanMarkup(doc.field_id_18);

  const series = Helpers.getSeries(doc.field_id_653);
  const fuseSeries = Helpers.getSeries(doc.field_id_1178);

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    title: doc.title,
    status: doc.status,
    meta: {
      urlTitle: doc.url_title,
      siteId: doc.site_id,
      date: date,
      channelId: doc.channel_id
    },
    content: {
      body: markup,
      scripture: scripture,
      tags: tags,
      ooyalaId: doc.field_id_668,
      images: images
    },
    author: {
      authorId: doc.author_id,
      firstName: doc.m_field_id_2 || false,
      lastName: doc.m_field_id_3 || false,
      fullName: doc.m_field_id_4 || false
    },
    series: {
      seriesId: series[1],
      slug: series[2],
      title: series[3]
    },
    fuseSeries: {
      seriesId: fuseSeries[1],
      slug: fuseSeries[2],
      title: fuseSeries[3]
    }
  }

  return cleanedData;
};


module.exports.identifier = "entry_id"
module.exports.collection = "editorial";

module.exports.schema = {
  entryId: String,      // entry_id
  siteId: String,       // site_id
  channelName: String,  // channel_name
  status: String,       // status
  title: String,        // title
  meta: {
    urlTitle: String,   // url_title
    siteId: String,     // site_id
    date: Date,         //
    channelId: String   // channel_id
  },
  content: {
    body: String,       // field_id_18
    scripture: String,  // field_id_654
    tags: String,       // field_id_1028
    ooyalaId: String,   // field_id_668
    images: [{}]          // field_id_664
  },
  author: {
    authorId: String,   // author_id
    firstName: String,  // m_field_id_2
    lastName: String,   // m_field_id_3
    fullName: String    // m_field_id_4
  },
  series: {             // field_id_653
    seriesId: String,
    slug: String,
    title: String
  },
  fuseSeries: {         // field_id_1178
    seriesId: String,
    slug: String,
    title: String
  }
}


module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" },
  { table: "exp_channel_member_data" }
];
