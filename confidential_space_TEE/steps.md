+----------------------------------------------------+
| Google Confidential Space |
| +-----------------------------------------------+ |
| | Containerized Node.js App (TypeScript) | |
| | - Reads from GCS | |
| | - Computes CMM Metrics | |
| | - Saves to GCS | |
| | - Fetches Attestation Token | |
| +-----------------------------------------------+ |
+----------------------------------------------------+

                   ↓ Writes Results + Token

        GCS Bucket (cmm_reports_out)

run podman

```bash
podman machine init
podman machine start
```
