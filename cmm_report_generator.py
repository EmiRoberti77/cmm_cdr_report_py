import json
import random
from google.cloud import storage
from list_buckets import get_project_name

BUCKET_NAME = 'cmm_reports'

def generate_report(provider):
  report = {
    "provider":provider,
    "reach":random.randint(5_000_000, 15_000_000)
  }
  print(json.dumps(report, indent=2))
  return report


def upload_to_gcs(bucket_name,filename, data):
  client = storage.Client(project=get_project_name())
  bucket = client.bucket(bucket_name)
  blob = bucket.blob(filename)
  blob.upload_from_string(json.dumps(data), content_type="application/json")
  print(f"file uploaded {filename} to {bucket_name}")

if __name__ == "__main__":
  providers = ["TV", "Meta", "Google"]
  for provider in providers:
    data = generate_report(provider)
    filename = f"{provider}_report.json"
    upload_to_gcs(BUCKET_NAME, filename, data)    
