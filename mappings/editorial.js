"use strict";

const Path = require("path"),
      Fs = require("fs"),
      mySQL = require("../lib/mysql");



function cleanMarkup(markup){
  if (!markup) {
    return false;
  }

  let parsed = markup.match(/src="{assets_\d*.*}"/);

  if (!parsed) {
    return markup;
  }

  // remove {assets_IDSTRING:} and make protocal relative
  markup = markup.replace(/{assets_\d*.*}/, function(link) {

    link = link.trim().substring(0, link.length - 1);
    link = link.replace(/{assets_\d*:/, "");
    return link;

  });

  // make all links protocal relative
  return markup.replace(/https*:\/\//g, "\/\/");
}

function parseSeries(series){
  if (!series) {
    return false;
  }

  // format: [dddd] [some-thing] Series Title
  // match[1]: series id
  // match[2]: series slug
  // match[3]: series name
  const seriesRegex = /\[(\d*)\] \[(.*)\] (.*)/g;
  const parsed = seriesRegex.exec(series);

  return parsed;
}

function getImages(entryId, images) {
  let done = false;
  let results = [];

  for (let image in images) {
    let queryPath = Path.join(__dirname, "./util/images.sql");

    const imageData = mySQL(queryPath,
      {
        entryId: entryId,
        imageName: images[image]
      }
    );

    imageData.rows.map(row => {
      const settings = JSON.parse(row.settings);
      const s3 = settings.url_prefix + settings.subfolder + row.sub_path + row.file_name;
      const cloudfront = "//dg0ddngxdz549.cloudfront.net/" + settings.subfolder + row.sub_path + row.file_name;
      results.push({
        position: row.position,
        fileName: row.file_name,
        type: row.image_type,
        label: row.image_label,
        s3: s3,
        cloudfront: cloudfront
      })
    });

  };

  return results;
}

module.exports = function(doc){
  let tags = [];
  if (doc.field_id_1028) {
    tags = doc.field_id_1028.replace("\\n", ",");
    tags = tags.split("\n");
  }

  let images = [];
  if (doc.field_id_664) {
    images = doc.field_id_664.replace("\\n", ",");
    images = images.split("\n").filter(image => !!image);
    if (images.length) {
      images = getImages(doc.entry_id, images);
    }
  }

  const month = Number(doc.month) - 1;
  const date = new Date(doc.year, month, doc.day);

  const scripture = doc.field_id_654 === "1" ? false : doc.field_id_654;

  const markup = cleanMarkup(doc.field_id_18);

  const series = parseSeries(doc.field_id_653);
  const fuseSeries = parseSeries(doc.field_id_1178);

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
