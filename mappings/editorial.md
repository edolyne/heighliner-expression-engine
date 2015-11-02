
Editorial

### exp_channel_fields

Fields:

|field_id|field_name|field_label|field_type|
|-------:|---------:|----------:|---------:|
|18|editorial_legacy_body|Body|wygwam|
|664|editorial_image|Image(s)|matrix|
<!-- |663|editorial_link|Link|matrix| -->
<!-- |651|editorial_campus|Campus|playa| -->
|653|editorial_series_newspring|Series|playa|
|654|editorial_scripture|Scripture|matrix|
<!-- |655|editorial_study|Study|Playa| -->
<!-- |656|editorial_subtitle|Subtitle|text| -->
|657|editorial_author|Author(s)|tag|
<!-- |662|editorial_summary|Summary|textarea| -->
|668|editorial_video|Video|ooyala|
<!-- |677|editorial_downloads|Downloads|matrix| -->
|1028|editorial_tags|Topics|tag|
|1178|editorial_series_fuse|Fuse Series|playa|


### exp_channel_titles

Fields:

|field_name|field_type|
|---------:|---------:|
|entry_id|Number|
|title|String|
|url_title|String|
|status|String|
|year|Number|
|month|Number|
|day|Number|


```sql
SELECT
  d.entry_id,
  d.site_id,
  d.channel_id,
  d.field_id_664,
  d.field_id_663,
  d.field_id_653,
  d.field_id_654,
  d.field_id_657,
  d.field_id_668,
  d.field_id_1028,
  d.field_id_1178,
  t.title,
  t.url_title,
  t.status,
  t.year,
  t.month,
  t.day,
  t.author_id
FROM
  exp_channel_data AS d
LEFT JOIN
  exp_channel_titles AS t
    ON d.entry_id = t.entry_id
WHERE
  d.channel_id=27
LIMIT 2

```

### Images

*field_id_664*

  - list of image placements
  - "Hero Image\nBackground Image"

*exp_assets_selections*

  - table of image selections
  - use `entry_id` to pull up all image selections
  - `file_id` of image in `exp_assets_files`
  - `col_id` maps to `exp_matrix_cols` for names of columns and to `exp_matrix_data` for other stuff
  - `row_id` maps to which `exp_matrix_data` row

*exp_matrix_data*

  - `col_id_218` is the image type "Hero Image" or "Background Image"

```sql
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
  d.entry_id=309717
```
