                                +-------------------------+
                                |   External Verifier     |
                                | (CI/CD, Auditor, etc.)  |
                                +-----------+-------------+
                                            |
                                            | 1. Request Attestation Token
                                            |

+------------------------+ 2. Token |
| Confidential Space | <----------------+
| (Containerized Workload)|
| +--------------------+ |
| | Node.js App / Your | | 3. Process Data, Fetch KMS Keys if Validated
| | Python App | |
| +----------+---------+ |
| | |
| Metadata | |
| Server | |
| (Attestation Token) |
| |
+------------+-----------+
|
| 4. Access Encrypted Data or KMS Key Based on Verified Token
v
+----+----+
| KMS |
+----+----+
|
v
+-------+-------+
| Encrypted |
| Storage (GCS) |
+---------------+

## Key Flows

1. Attestation Token Issuance

- Workload fetches token from metadata server.

2. Token Verification

- External system verifies token claims and image integrity.

3. KMS Conditional Access

- If attestation is verified, workload gets access to KMS keys.

4. Secure Processing

- Workload decrypts data, processes it, and outputs securely.

[ Confidential VM (AMD SEV-SNP) ]
|
[ Confidential Space Runtime ]
|
[ Your Private Container Image (based on gcr.io/confidential-space-images/nodejs:20) ]
|
[ Your App Logic: Fetch GCS, Compute, KMS Access, etc. ]
