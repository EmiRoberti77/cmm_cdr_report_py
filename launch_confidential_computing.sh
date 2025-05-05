gcloud compute instances create confidential-vm-cmm \
  --zone=us-central1-a \
  --machine-type=n2d-standard-4 \
  --confidential-compute-type=SEV \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --metadata=startup-script=startup_script.sh