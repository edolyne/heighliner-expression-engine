"use strict";

const Path = require("path"),
      Fs = require("fs"),
      deasync = require("deasync"),
      MySQL = require("mysql");

const SQLSettings = {
  host        : process.env.MYSQL_HOST || "192.168.99.101",
  user        : process.env.MYSQL_USER || "root",
  password    : process.env.MYSQL_PASSWORD || "password",
  database    : process.env.MYSQL_DB || "ee_local",
  port        : 3306,
  minInterval : 200,
  connectTimeout: 20000,
  ssl: process.env.MYSQL_SSL || false
};

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

function getImages(entryId, images, done) {
  let results = [];
  const mysql = MySQL.createConnection(SQLSettings);
  mysql.connect();


  console.log(images);
  for (let image in images) {
    let query = Fs.readFileSync(
      Path.join(__dirname, "../images/images.sql"),
      { encoding: "utf8" }
    ).toString()

    query = query.replace("entryId()", entryId);
    query = query.replace("imageName()", images[image]);

    console.log(query);

    mysql.query(query, function(err, rows, fields) {
      if (err) throw err;

      console.log(rows.length, rows);

      results.push(rows[0]);
    });
  };

  // make synchronous
  while (results.length !== images.length) {
    deasync.runLoopOnce();
  }
  mysql.end();

  return results.map(result => {
    return {
      position: result.col_id_218,
      fileName: result.file_name,
      type: result.col_name,
      label: result.col_label,
      settings: result.settings
    }
  });
}

module.exports = function(doc){
  let tags = []
  if (doc.field_id_1028) {
    tags = doc.field_id_1028.replace("\\n", ",");
    tags = tags.split("\n");
  }

  let images = [];
  if (doc.field_id_664) {
    images = doc.field_id_664.replace("\\n", ",");
    images = images.split("\n").filter(image => !!image);
    let done = false;
    images = getImages(doc.entry_id, images, done);
  }

  const month = Number(doc.month) - 1;
  const date = new Date(doc.year, month, doc.day);

  const scripture = doc.field_id_654 === "1" ? false : doc.field_id_654;

  const markup = cleanMarkup(doc.field_id_18);

  const series = parseSeries(doc.field_id_653);
  const fuseSeries = parseSeries(doc.field_id_1178);

  let cleanedData = {
    entryId: doc.entry_id,
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
      author_id: doc.author_id,
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
      // name: String,     // col_id_218
      // type: String,     // col_name
      // label: String,    // col_label
      // settings: String  // settings
    // }]
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
