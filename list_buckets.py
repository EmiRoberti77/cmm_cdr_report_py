from google.cloud import storage
import json

GOOGLE_CREDENTIALS = "emi-gcp-key.json"

def get_project_name():
  with open(GOOGLE_CREDENTIALS, "r") as file:
    return json.load(file)["project_id"]


def list_buckets():
  """list buckets on gcp"""
  storage_client = storage.Client(project=get_project_name())
  buckets = storage_client.list_buckets()
  print('Buckets')
  for bucket in buckets:
    print(bucket)
  


list_buckets()