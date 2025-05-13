# Build container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cmm-compute

# (Optional) Set IAM permissions for Confidential Space runtime to pull the image
