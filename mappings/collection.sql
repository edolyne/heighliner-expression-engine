SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
/*   d.field_entry_date, */
  d.field_id_14 as start_date,
  d.field_id_665 as end_date,
  d.field_id_13 as description,
  d.field_id_547 as hashtag,
  d.field_id_15 as ooyalaId,
  d.field_id_860 as positions,
  c.channel_name,
  t.title,
  t.url_title,
  t.status,
  t.year,
  t.month,
  t.day
FROM
  excId(exp_channel_data) AS d
LEFT JOIN
  exp_channels as c
    ON d.channel_id = c.channel_id
LEFT JOIN
  exp_channel_titles AS t
    ON d.entry_id = t.entry_id
WHERE
  /* series */
  d.channel_id = 4
AND
  d.entry_id = 287349

