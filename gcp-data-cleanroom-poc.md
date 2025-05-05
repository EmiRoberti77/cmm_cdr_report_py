# Proof of Concept: Secure Cross-Media Measurement Using Google Cloud Data Clean Rooms (DCR)

## 📌 Goal

Demonstrate a privacy-preserving setup to compute a deduplicated CMM (Cross Media Measurement) report by securely joining hashed user data from different simulated data providers (e.g., Meta, Google, TV) using **Google Cloud Data Clean Rooms (DCR)**.

---

## 🧱 Architecture

1. **Three fake publishers**: Meta, Google, and TV.
2. Each publisher uploads hashed user exposure data into **separate BigQuery datasets**.
3. A **Data Clean Room instance** joins the datasets and runs **aggregate-only SQL queries**.
4. Clean Room ensures:
   - **Raw data isolation**
   - **Query privacy enforcement** (e.g., minimum row count)
   - **Data access auditing**

---

## ⚙️ Step-by-Step Setup

### 1. ✅ Enable APIs

```bash
gcloud services enable datacleanroom.googleapis.com
gcloud services enable bigquery.googleapis.com
```

---

### 2. ✅ Create Datasets for Each Provider

```bash
bq mk --dataset meta_publisher.cmm_data
bq mk --dataset google_publisher.cmm_data
bq mk --dataset tv_publisher.cmm_data
```

---

### 3. 🧪 Upload Sample Data

Save the following table as `meta_data.csv`:

```csv
user_id,exposure_date,campaign_id,platform
abc123,2024-04-01,CAMP001,Meta
def456,2024-04-02,CAMP001,Meta
ghi789,2024-04-03,CAMP001,Meta
```

Upload to BigQuery:

```bash
bq load --autodetect --source_format=CSV meta_publisher.cmm_data.meta_table meta_data.csv
```

Repeat for `google_publisher` and `tv_publisher` using similar data but different user_ids (simulate overlap).

---

### 4. 🔒 Create a Clean Room Instance (preview feature)

Create JSON definition (e.g., `cleanroom_config.json`):

```json
{
  "displayName": "CMM Clean Room",
  "partnerConfig": {
    "partners": [
      {
        "displayName": "Meta",
        "datasets": ["projects/YOUR_PROJECT/datasets/meta_publisher"]
      },
      {
        "displayName": "Google",
        "datasets": ["projects/YOUR_PROJECT/datasets/google_publisher"]
      },
      {
        "displayName": "TV",
        "datasets": ["projects/YOUR_PROJECT/datasets/tv_publisher"]
      }
    ]
  }
}
```

Then:

```bash
gcloud data-cleanrooms cleanrooms create cmm_cleanroom   --location=us-central1   --config-from-file=cleanroom_config.json
```

> Replace `YOUR_PROJECT` with your GCP project ID.

---

### 5. 📊 Submit Aggregation Query

Save SQL to `aggregate_query.sql`:

```sql
SELECT
  campaign_id,
  COUNT(DISTINCT user_id) AS deduplicated_reach
FROM (
  SELECT * FROM meta_publisher.cmm_data.meta_table
  UNION ALL
  SELECT * FROM google_publisher.cmm_data.google_table
  UNION ALL
  SELECT * FROM tv_publisher.cmm_data.tv_table
)
GROUP BY campaign_id;
```

Submit query to clean room:

```bash
gcloud data-cleanrooms queries submit   --cleanroom=cmm_cleanroom   --location=us-central1   --query-file=aggregate_query.sql
```

---

### 6. ✅ Output Results

You can specify a secure output dataset that all parties agree on:

```bash
bq mk --dataset shared_results.deduplicated_output
```

Add output configuration in the clean room policy to restrict access and share only aggregate results.

---

## 🔐 Privacy Enforcement

Data Clean Rooms enforce:
- No raw row access
- Minimum aggregation thresholds (e.g., >50 rows)
- Query auditing
- Strict IAM access per participant dataset

---

## 🚀 Optional Enhancements

- Use **hashed user_ids with salt** to simulate privacy-preserving joins
- Integrate with **Confidential VMs** for pre-clean room pre-processing
- Use **Workload Identity Federation** for credentialless auth

---

## ✅ Summary

This POC shows how you can use Google Cloud Data Clean Rooms to securely compute multi-party advertising metrics (like deduplicated reach) without exposing any party's raw data.