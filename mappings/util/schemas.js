"use strict";

const Images = {
  position: String,
  fileName: String,
  fileType: String,
  fileLabel: String,
  s3: String,
  cloudfront: String
}

const Media = {
  fileName: String,
  fileType: String,
  s3: String,
  cloudfront: String
}

module.exports = {
  Images: Images,
  Media: Media
}
