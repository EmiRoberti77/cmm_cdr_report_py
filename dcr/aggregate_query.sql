SELECT
  campaign_id,
  COUNT(DISTINCT user_id) AS deduplicated_reach
FROM (
  SELECT * FROM meta_publisher_cmm_data.meta_table
  UNION ALL
  SELECT * FROM google_publisher_cmm_data.google_table
  UNION ALL
  SELECT * FROM tv_publisher_cmm_data.tv_table
)
GROUP BY campaign_id;