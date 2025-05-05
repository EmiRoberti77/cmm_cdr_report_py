# Proof of Concept: Secure CMM Report Processing with Google Confidential Compute

## 📌 Overview

This proof of concept (POC) demonstrates how to securely process **Cross Media Measurement (CMM)** reports using **Google Confidential VMs** — part of Google Cloud’s Confidential Computing product suite. The goal is to ensure **data privacy and in-use encryption** during sensitive report computation.

---

## 🧱 Architecture Summary

1. **Simulated Data Providers** generate fake CMM JSON reports (e.g., reach from TV, Meta, Google).
2. Reports are uploaded to a **GCS input bucket**.
3. A **Confidential VM** is launched to:
   - Download reports from GCS
   - Perform aggregation and compute deduplicated reach
   - Upload results to an **output GCS bucket**
4. Optionally: Disable external IP access, use Workload Identity, or restrict access via firewall.

---

## 🔐 What is Google Confidential Computing?

Google Confidential Computing allows you to process data in the cloud **without exposing it to Google or other tenants**, even while it's being used in memory.

Key technology: **AMD SEV (Secure Encrypted Virtualization)**

- Data is encrypted in RAM.
- Decryption keys are managed by the **hardware itself**, not software.
- Even Google can’t inspect memory state of Confidential VMs.

### 🛡️ Security Guarantees

- **Encryption at rest** – data in GCS and disks
- **Encryption in transit** – TLS for all communications
- **Encryption in use** – RAM encryption on Confidential VMs
- **Isolated execution environment** – tamper-resistant and verified boot

---

## 📦 Components in the POC

### 1. Fake CMM Report Generator (Python)

Generates mock reports and uploads them to GCS.

```python
# Simulated example
{
    "provider": "TV",
    "reach": 10_000_000
}
```

### 2. Confidential Compute Processor (Python)

Executed inside a Confidential VM. It:

- Downloads all reports from the input bucket.
- Aggregates gross reach.
- Deduplicates using a 15% overlap estimate.
- Uploads the final report to the output bucket.

### 3. Startup Script

Provisioned via `--metadata-from-file` to run on VM boot.

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y python3-pip
pip3 install google-cloud-storage
gsutil cp gs://<your-bucket>/confidential_vm_processor.py .
python3 confidential_vm_processor.py
```

---

## 🚀 VM Launch Example

```bash
gcloud compute instances create confidential-vm   --zone=us-central1-a   --machine-type=n2d-standard-4   --confidential-compute-type=SEV   --image-family=ubuntu-2004-lts   --image-project=ubuntu-os-cloud   --scopes=https://www.googleapis.com/auth/cloud-platform   --metadata-from-file startup-script=startup-script.sh
```

---

## 🔍 Debugging

SSH into the VM (if external IP is allowed):

```bash
gcloud compute ssh confidential-vm --zone=us-central1-a
```

Check logs:

```bash
cat /var/log/syslog
cat /var/lib/google/startupscript.log
```

---

## 🧪 Outcome

The final CMM report is processed inside a **hardware-isolated environment**, providing high assurance that sensitive measurement data is never exposed to external systems or users — not even to Google.
