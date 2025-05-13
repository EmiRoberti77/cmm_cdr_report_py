import { KeyManagementServiceClient } from '@google-cloud/kms';
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

async function encryptReport(inputFilePath: string, outputFilePath: string) {
  const reportData = fs.readFileSync(inputFilePath);

  const [result] = await client.encrypt({
    name: keyName,
    plaintext: reportData,
  });

  fs.writeFileSync(outputFilePath, result.ciphertext as Buffer);
  console.log(`Encrypted report saved to ${outputFilePath}`);
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
  const inputFile = './src/report.json';
  const encryptedFile = './src/report.enc';
  const decryptedFile = './src/report-decrypted.json';

  // Encrypt
  await encryptReport(inputFile, encryptedFile);

  // Decrypt
  await decryptReport(encryptedFile, decryptedFile);
})();
