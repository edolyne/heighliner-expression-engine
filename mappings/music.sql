SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  d.field_id_249 as album_image,
  d.field_id_1124 as album_blurred_image,
  d.field_id_250 as album_description,
  d.field_id_251 as album_itunes,
  d.field_id_689 as album_tracks,
  d.field_id_687 as album_links,
  d.field_id_646 as album_downloads,
  d.field_id_1196 as album_study,
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
  d.channel_id = 47
