SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
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
  /* sermons */
  d.channel_id = 3
LIMIT 1
