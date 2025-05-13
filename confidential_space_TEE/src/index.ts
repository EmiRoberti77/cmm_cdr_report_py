import { Storage } from '@google-cloud/storage';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import axios from 'axios';
import * as fs from 'fs';

const client = new KeyManagementServiceClient();

const projectId = 'emi-dev-env-2';
const locationId = 'global';
const keyRingId = 'cmm-key-ring';
const cryptoKeyId = 'cmm-key';

// Resource name of the KMS key
const keyName = client.cryptoKeyPath(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId
);

const IN_BUCKET_NAME = 'cmm_reports';
const OUT_BUCKET_NAME = 'cmm_reports_out';
const TOKEN = '18B726B4-745C-4EF6-B54B-A780BEADD149';
const storage = new Storage();

async function downloadEncryptedReports(bucketName: string) {
  const [files] = await storage.bucket(bucketName).getFiles();
  return await Promise.all(
    files.map(async (file) => {
      const [contents] = await file.download();
      return { name: file.name, contents };
    })
  );
}

async function decryptBuffer(ciphertext: Buffer): Promise<Buffer> {
  const [result] = await client.decrypt({
    name: keyName,
    ciphertext,
  });
  return result.plaintext as Buffer;
}

function computeCmmMetrics(reports: any[]) {
  const grossReach = reports.reduce((sum, r) => sum + r.reach, 0);
  const duplication = Math.floor(grossReach * 0.15);
  const netReach = grossReach - duplication;
  return { grossReach, duplication, netReach };
}

async function saveReport(bucketName: string, filename: string, data: any) {
  const file = storage.bucket(bucketName).file(filename);
  await file.save(JSON.stringify(data, null, 2));
  console.log(`Saved computed output to ${filename} in ${bucketName}`);
}

async function getAttestationToken() {
  const response = await axios.get(
    'http://metadata.google.internal/computeMetadata/v1/instance/attestation-token',
    { headers: { 'Metadata-Flavor': 'Google' } }
  );
  return response.data;
}

async function getAttestationTokenLocal() {
  return TOKEN;
}

async function decryptReport(
  encryptedFilePath: string,
  outputFilePath: string
) {
  const encryptedData = fs.readFileSync(encryptedFilePath);

  const [result] = await client.decrypt({
    name: keyName,
    ciphertext: encryptedData,
  });

  fs.writeFileSync(outputFilePath, result.plaintext as Buffer);
  console.log(`Decrypted report saved to ${outputFilePath}`);
}

(async () => {
  const token = await getAttestationTokenLocal();
  if (token === TOKEN) {
    console.log('Downloading encrypted reports');
    const encryptedReports = await downloadEncryptedReports(IN_BUCKET_NAME);

    console.log('KMS decryption');
    const decryptedReports = await Promise.all(
      encryptedReports.map(async ({ name, contents }) => {
        const decrypted = await decryptBuffer(contents);
        return JSON.parse(decrypted.toString()); // Parse after decryption
      })
    );

    console.log('Computing reports');
    const result = computeCmmMetrics(decryptedReports);

    console.log('Saving computed reports');
    await saveReport(OUT_BUCKET_NAME, 'final_cmm_report.json', result);
  } else {
    console.log('attestation failed');
  }
})();
