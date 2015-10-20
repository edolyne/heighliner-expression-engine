"use strict";


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

module.exports = function(doc){
  let tags = []
  if (doc.field_id_1028) {
    tags = doc.field_id_1028.replace("\\n", ",");
    tags = tags.split("\n");
  }


  const month = Number(doc.month) - 1;
  const date = new Date(doc.year, month, doc.day);

  const scripture = doc.field_id_654 === "1" ? false : doc.field_id_654;

  const markup = cleanMarkup(doc.field_id_18);

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
      tags: tags
    },
    author: {
      author_id: doc.author_id,
      firstName: doc.m_field_id_2 || false,
      lastName: doc.m_field_id_3 || false,
      fullName: doc.m_field_id_4 || false
    }
  }

  return cleanedData;
};


module.exports.identifier = "entry_id"
module.exports.collection = "editorial";

module.exports.schema = {
  entryId: String,
  status: String,
  meta: {
    urlTitle: String,
    siteId: String,
    date: Date,
    channelId: String
  },
  content: {
    body: String,
    scripture: String,
    tags: String
  },
  author: {
    authorId: String,
    firstName: String,
    lastName: String,
    fullName: String
  }
}


module.exports.triggers = [
  { table: "exp_channel_data" },
  { table: "exp_channel_titles" },
  { table: "exp_channel_member_data" }
];
