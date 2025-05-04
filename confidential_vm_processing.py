import json
from google.cloud import storage
from list_buckets import get_project_name

IN_BUCKET_NAME = 'cmm_reports'
OUT_BUCKET_NAME = 'cmm_reports_out'

def download_reports(bucket_name):
  client = storage.Client(project=get_project_name())
  bucket = client.bucket(bucket_name)
  blobs = list(bucket.list_blobs())
  reports = []
  for blob in blobs:
    content = blob.download_as_string()
    report = json.loads(content)
    reports.append(report)

  return reports

def compute_cmm_metrics(reports):
  gross_reach = sum(r["reach"] for r in reports)
  duplication = int(gross_reach * 0.15)
  net_reach = gross_reach - duplication
  return {
        "gross_reach": gross_reach,
        "duplication": duplication,
        "net_reach": net_reach
    }


