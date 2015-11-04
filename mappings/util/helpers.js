"use strict";

const Path = require("path"),
      Fs = require("fs"),
      mySQL = require("../../lib/mysql");

const Helpers = {

  getDate: (day, month, year) => {

    return new Date(year, Number(month) - 1, day);

  },

  getDateFromUnix: (timestamp) => {

    return new Date(timestamp * 1000);

  },

  cleanMarkup: (markup) => {

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

  },

  splitByNewlines: (tags) => {
    if (tags) {
      tags = tags.replace("\\n", ",");
      return tags.split("\n");
    }
    else {
      return [];
    }
  },

  getSeries: (series) => {

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

  },

  getMatrixData: (entryId, fields) => {

    if (!entryId || !fields) {
      return [];
    }

    const queryPath = Path.join(__dirname, "./matrix.sql");

    const matrixData = mySQL(queryPath, {
      fields: fields,
      entryId: entryId
    });

    matrixData.rows = matrixData.rows.map(document => {

      // cast instanceOf RowDataPacket to plain object
      let obj = {};
      for (let key in document) {
        if (!document[key]) { continue; }
        obj[key] = document[key]
      }
      if (Object.keys(obj).length) {
        return obj
      }
      return
    }).filter(doc => { return doc != undefined});

    return matrixData.rows;

  },

  getMatrixWithFile: (entryId, fields, fileObj) => {

    if (!entryId || !fields || !fileObj) {
      return []
    }

    let data = Helpers.getMatrixData(entryId, fields);
    data = data.map(document => {

      // lookup s3 link of file
      if (document[fileObj.field]) {
        let file = Helpers.getFile(
          entryId, document[fileObj.field], fileObj.pivot
        );
        document[fileObj.field] = file[0].s3
      }

      return document

    })

    return data;

  },

  getFile: (entryId, name, positionColumn) => {

    let queryPath = Path.join(__dirname, "./images.sql");
    let results = [];

    const imageData = mySQL(queryPath,
      {
        positionColumn: positionColumn,
        entryId: entryId,
        imageName: name
      }
    );

    imageData.rows.map(row => {
      const settings = JSON.parse(row.settings);
      const s3 = settings.url_prefix + settings.subfolder + row.sub_path + row.file_name;
      const cloudfront = "//dg0ddngxdz549.cloudfront.net/" + settings.subfolder + row.sub_path + row.file_name;
      results.push({
        // position: row.position,
        fileName: row.file_name,
        type: row.image_type,
        label: row.image_label,
        s3: s3,
        cloudfront: cloudfront
      })
    });

    return results;


  },


  getFiles: (entryId, positions, positionColumn) => {

    if (!positions) {
      return [];
    }

    let files = positions.replace("\\n", ",");
    files = files.split("\n").filter(file => !!file);

    let results = [];
    for (let file in files) {

      const fileResults = Helpers.getFile(entryId, files[file], positionColumn);

      results = results.concat(fileResults);
    };

    return results;
  },


  getVideo: (entryId, fieldId) => {

    let queryPath = Path.join(__dirname, "./videos.sql");

    const videoData = mySQL(queryPath,
      {
        entryId: entryId,
        fieldId: fieldId
      }
    );

    const result = videoData.rows[0];

    const settings = JSON.parse(result.settings);
    const s3 = settings.url_prefix + settings.subfolder + result.sub_path + result.file_name;
    const cloudfront = "//dg0ddngxdz549.cloudfront.net/" + settings.subfolder + result.sub_path + result.file_name;

    return {
      fileName: result.file_name,
      s3: s3,
      cloudfront: cloudfront
    };

  }

};

module.exports = Helpers
