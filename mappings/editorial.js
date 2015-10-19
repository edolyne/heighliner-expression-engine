

module.exports = function(data){
  console.log(data);

  return data;
};


module.exports.idField = "entry_id"
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
