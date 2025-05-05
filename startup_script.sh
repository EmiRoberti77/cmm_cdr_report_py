#!/bin/bash
set -e

# Update and install dependencies
sudo apt-get update
sudo apt-get install -y python3-pip

# Install GCP SDK
pip3 install google-cloud-storage

# Copy files from GCS
gsutil cp gs://confidential_computing/confidential_vm_processing.py .
gsutil cp gs://confidential_computing/emi-gcp-key.json .
gsutil cp gs://confidential_computing/list_buckets.py .

# Set environment variable for Google credentials
export GOOGLE_APPLICATION_CREDENTIALS="emi-gcp-key.json"

# Run the processor
python3 confidential_vm_processing.py
