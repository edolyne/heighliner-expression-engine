SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  d.field_id_18,
  d.field_id_654,
  d.field_id_1028,
  t.title,
  t.url_title,
  t.status,
  t.year,
  t.month,
  t.day,
  t.author_id,
  m.m_field_id_2,
  m.m_field_id_3,
  m.m_field_id_4
FROM
  escId(exp_channel_data) AS d
LEFT JOIN
  exp_channel_titles AS t
    ON d.entry_id = t.entry_id
LEFT JOIN
  exp_member_data as m
    ON t.author_id = esc(m.member_id)
WHERE
  d.channel_id=27
LIMIT 2
