SELECT
  f.file_name,
  fo.full_path as sub_path,
  so.settings
FROM
  exp_channel_data as d
LEFT JOIN
  exp_assets_selections as s
    ON d.entry_id = s.entry_id
LEFT JOIN
  exp_assets_files as f
    ON s.file_id = f.file_id
LEFT JOIN
  exp_assets_folders as fo
    ON f.folder_id = fo.folder_id
LEFT JOIN
  exp_assets_sources as so
    ON f.source_id = so.source_id
WHERE
  d.entry_id=${entryId}
AND
  s.field_id=${fieldId}
