// ./src/azure-storage-blob.ts

// <snippet_package>
// THIS IS SAMPLE CODE ONLY - NOT MEANT FOR PRODUCTION USE
import { BlobServiceClient, ContainerClient} from '@azure/storage-blob';
import {progressService} from "./services/progress.service";
import moment from 'moment';
import uuid from 'react-uuid';

const containerName = `upload`;
const sasToken = process.env.REACT_APP_STORAGESASTOKEN;
const storageAccountName = process.env.REACT_APP_STORAGERESOURCENAME; 
// </snippet_package>

// <snippet_isStorageConfigured>
// Feature flag - disable storage feature to app if not configured
export const isStorageConfigured = () => {
  return (!storageAccountName || !sasToken) ? false : true;
}
// </snippet_isStorageConfigured>

// <snippet_getBlobsInContainer>
// return list of blobs in container to display
const getBlobsInContainer = async (containerClient: ContainerClient) => {
  const returnedBlobUrls: string[] = [];

  // get list of blobs in container
  // eslint-disable-next-line
  for await (const blob of containerClient.listBlobsFlat()) {
    // if image is public, just construct URL
    returnedBlobUrls.push(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
    );
  }

  return returnedBlobUrls;
}
// </snippet_getBlobsInContainer>

// <snippet_createBlobInContainer>
const createBlobInContainer = async (containerClient: ContainerClient, file: File, period: any, tipologia: string, cliente: string) => {
  console.log(period);
  const p = moment(period);
  const uid = uuid();
  const month = p.format('M');
  const year  = p.format('YYYY');
  // create blobClient for container
  const blobClient = containerClient.getBlockBlobClient(uid);

  

  // upload file
  await blobClient.uploadData(file, {
    blockSize: 4 * 1024 * 1024, // 4MB block size
    concurrency: 20, // 20 concurrency
    onProgress: (ev) => {
      console.log(`you have upload ${ev.loadedBytes} bytes`);
      console.log((ev.loadedBytes / file.size) * 100);
      progressService.sendProgressBar((ev.loadedBytes / file.size) * 100);
      // this.progress = (ev.loadedBytes / this.currentFile.size) * 100;

    },
    blobHTTPHeaders: { blobContentType: file.type },
    metadata: {anno: year, mese: month, tipologia: tipologia, cliente: cliente, uid: uid, filename: file.name}
  });
}
// </snippet_createBlobInContainer>

// <snippet_uploadFileToBlob>
const uploadFileToBlob = async (file: File | null, period: any, tipologia: string, cliente: string): Promise<string[]> => {
  if (!file) return [];

  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient = blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: 'container',
  });

  // upload file
  await createBlobInContainer(containerClient, file, period, tipologia, cliente);

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};

export const getContainerList = async (): Promise<string[]> => {

  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient = blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: 'container',
  });

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};
// </snippet_uploadFileToBlob>

export default uploadFileToBlob;

