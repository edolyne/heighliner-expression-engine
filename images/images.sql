SELECT
  da.col_id_218,
  c.col_name,
  c.col_label,
  f.file_name,
  so.settings
FROM
  exp_channel_data as d
LEFT JOIN
  exp_assets_selections as s
    ON d.entry_id = s.entry_id
LEFT JOIN
  exp_matrix_data as da
    ON s.row_id = da.row_id
LEFT JOIN
  exp_matrix_cols as c
    ON s.col_id = c.col_id
LEFT JOIN
  exp_assets_files as f
    ON s.file_id = f.file_id
LEFT JOIN
  exp_assets_sources as so
    ON f.source_id = so.source_id
WHERE
  d.entry_id=entryId()
AND
  da.col_id_218="imageName()"
