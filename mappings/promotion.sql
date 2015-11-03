SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  d.field_id_1069 as positions,
  d.field_id_1070 as url,
  d.field_id_1071 as summary,
  d.field_id_1072 as label,
  c.channel_name,
  t.title,
  t.status,
  t.year,
  t.month,
  t.day
FROM
  escId(exp_channel_data) AS d
LEFT JOIN
  exp_channels as c
    ON d.channel_id = c.channel_id
LEFT JOIN
  exp_channel_titles AS t
    ON d.entry_id = t.entry_id
WHERE
  d.channel_id = 160
LIMIT 1
