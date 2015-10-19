"use strict";


const express = require("express"),
      LiveSelect = require("mysql-live-select");

// Constants
const PORT = 8080;

// App
const app = express();
app.get("/", function (req, res) {
  res.send("Hello Tristan\n");
});

app.listen(PORT);
console.log("Running on http://localhost:" + PORT);


/*


*/
const SQLSettings = {
  host        : "192.168.99.100",
  user        : "root",
  password    : "password",
  database    : "ee_local",
  serverId    : 256,
  minInterval : 200
};

const liveDb = new LiveSelect(SQLSettings, (err) => {
  if (err) { console.log(err); }
});

function closeAndExit() {
  liveDb.end();
  process.exit();
  return
}

// Close connections on hot code push
process.on("SIGTERM", closeAndExit);

// Close connections on exit (ctrl + c)
process.on("SIGINT", closeAndExit);

const devotionals = liveDb.select(
  "SELECT d.entry_id, d.site_id, d.channel_id, d.field_id_18, d.field_id_654, d.field_id_1028, t.title, t.url_title, t.status, t.year, t.month, t.day, t.author_id, m.m_field_id_2, m.m_field_id_3, m.m_field_id_4 " +
  "FROM " +
    "exp_channel_data AS d " +
      "LEFT JOIN exp_channel_titles AS t " +
        "ON d.entry_id = t.entry_id " +
      "LEFT JOIN exp_member_data as m " +
        "ON t.author_id = m.member_id " +
  "WHERE d.channel_id=27 "
  ,
  [
    { table: "exp_channel_data" },
    { table: "exp_channel_titles" },
    { table: "exp_channel_member_data" }
  ]
);


devotionals.on("update", (results) => {
  console.log(`Synced data for ${results.added.length} results`)
});
