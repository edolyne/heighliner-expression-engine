"use strict";

const Helpers = require("./util/helpers");


module.exports = function(doc){

  let tracks = [
    "col_id_246 as title",
    "col_id_247 as duration",
    "col_id_248 as file"
  ].join(",\n");

  let downloads = [
    "col_id_209 as title",
    "col_id_210 as file"
  ].join(",\n");

  let links = [
    "col_id_245 as link",
    "col_id_417 as cta"
  ].join(",\n");

  const image = Helpers.getFile(doc.entry_id, doc.album_image, "f.file_name");
  const blurredImage = Helpers.getFile(doc.entry_id, doc.album_blurred_image, "f.file_name");
  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  // track files and data from matrix
  tracks = Helpers.getMatrixData(doc.entry_id, tracks);
  tracks = tracks.map(track => {

    // lookup s3 link
    if (track.file) {
      track.file = Helpers.getFile(
        doc.entry_id, track.file, "f.file_name"
      )[0].s3;
    }

    return {
      title: track.title,
      duration: track.duration,
      file: track.file
    }
  }).filter(track => {
    return track.title && track.duration && track.file
  });

  // download files and titles from matrix
  downloads = Helpers.getMatrixData(doc.entry_id, downloads);
  downloads = downloads.map(download => {

    // lookup s3 link
    if (download.file) {
      download.file = Helpers.getFile(
        doc.entry_id, download.file, "f.file_name"
      )[0].s3;
    }

    return {
      title: download.title,
      file: download.file
    }
  }).filter(download => {
    return download.title && download.file
  });


  // links ctas and urls
  links = Helpers.getMatrixData(doc.entry_id, links);
  links = links.map(link => {
    return {
      link: link.link,
      cta: link.cta
    }
  }).filter(link => {
    return link.link && link.cta
  });


  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    title: doc.title,
    status: doc.status,
    image: image[0].cloudfront,
    blurredImage: blurredImage[0].cloudfront,
    meta: {
      date: date,
      channelId: doc.channel_id
    },
    tracks: tracks,
    downloads: downloads,
    links: links
  }

  return cleanedData;

};


module.exports.identifier = "entry_id"
module.exports.collection = "music";

module.exports.schema = {
  entryId: String,      // entry_id
  siteId: String,       // site_id
  channelName: String,  // channel_name
  status: String,       // status
  title: String,        // title
  image: String,
  blurredImage: String,
  meta: {
    date: Date,         //
    channelId: String   // channel_id
  },
  tracks: [{
    title: String,
    duration: String,
    file: String
  }],
  downloads: [{
    title: String,
    file: String
  }],
  links: [{
    cta: String,
    link: String
  }]
}


module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" },
  { table: "exp_channels" }
];
