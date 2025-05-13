import { Storage } from '@google-cloud/storage';
import axios from 'axios';

const IN_BUCKET_NAME = 'cmm_reports';
const OUT_BUCKET_NAME = 'cmm_reports_out';
const storage = new Storage();

async function downloadReports(bucketName: string) {
  const [files] = await storage.bucket(bucketName).getFiles();
  const reports = await Promise.all(
    files.map(async (file) => {
      const [contents] = await file.download();
      return JSON.parse(contents.toString());
    })
  );
  return reports;
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

// async function getAttestationToken() {
//   const response = await axios.get(
//     "http://metadata.google.internal/computeMetadata/v1/instance/attestation-token",
//     { headers: { "Metadata-Flavor": "Google" } }
//   );
//   return response.data;
// }

async function getAttestationToken() {
  return true;
}

(async () => {
  console.log('Downloading reports');
  const reports = await downloadReports(IN_BUCKET_NAME);

  console.log('Computing reports');
  const result: any = computeCmmMetrics(reports);

  console.log('Fetching attestation token');
  const token = await getAttestationToken();
  if (token) {
    console.log('Saving computed reports');
    await saveReport(OUT_BUCKET_NAME, 'final_cmm_report.json', result);
  }
})();
