"use strict";

const Path = require("path"),
      Fs = require("fs"),
      mySQL = require("../../lib/mysql");

const Helpers = {

  getDate: (day, month, year) => {

    return new Date(year, Number(month) - 1, day);

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

  getTags: (tags) => {
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

    return matrixData.rows;

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
  }

};

module.exports = Helpers
