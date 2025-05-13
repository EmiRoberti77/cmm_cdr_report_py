import { Storage } from '@google-cloud/storage';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import path from 'path';
import fs from 'fs';

const edpCollection = ['TV', 'Meta', 'Google'];
const BUCKET_NAME = 'cmm_reports';
const jsonReportName = (edp: string) => `${edp}_report.json`;
const encryptedReportName = (edp: string) => `${edp}_report.enc`;

const projectId = 'emi-dev-env-2';
const locationId = 'global';
const keyRingId = 'cmm-key-ring';
const cryptoKeyId = 'cmm-key';

const client = new KeyManagementServiceClient();
// Resource name of the KMS key
const keyName = client.cryptoKeyPath(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId
);

interface Measurements {
  provider: string;
  reach: number;
}
async function encryptReport(inputFilePath: string, outputFilePath: string) {
  const reportData = fs.readFileSync(inputFilePath);

  const [result] = await client.encrypt({
    name: keyName,
    plaintext: reportData,
  });

  fs.writeFileSync(outputFilePath, result.ciphertext as Buffer);
  console.log(`Encrypted report saved to ${outputFilePath}`);
}

async function main() {
  const storage = new Storage({
    projectId: 'emi-dev-env-2',
    keyFilename: path.join(__dirname, '..', 'emi-gcp-key.json'),
  });
  const bucket = storage.bucket(BUCKET_NAME);

  Promise.all(
    edpCollection.map(async (edp) => {
      const measurements: Measurements = {
        provider: edp,
        reach: reach(200000, 10000000),
      };

      const targetFileName = jsonReportName(edp);
      const file = bucket.file(targetFileName);
      const jsonReport = JSON.stringify(measurements, null, 2);
      fs.writeFileSync(targetFileName, jsonReport);
      const encReport = encryptedReportName(edp);
      await encryptReport(targetFileName, encReport);
      console.log('saved local file', targetFileName, encReport);

      try {
        //await file.save(jsonReport);
        console.log(`${edp}-to-GCP`, targetFileName, encReport);
        await storage.bucket(BUCKET_NAME).upload(encReport);
      } catch (err: any) {
        console.log(err.message);
      }

      console.log('KMS encryption needs to be done before saving');

      console.log(`${BUCKET_NAME}/${targetFileName}`);
    })
  );
  //save them to bucket
}

function reach(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min) + min);
}

main();
