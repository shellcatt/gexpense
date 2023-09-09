import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
// import { Storage } from '@google-cloud/storage';

import fs from 'fs/promises';
import mime from 'mime-types';
import path from 'path';

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default class ExpenseScanner {
  constructor({ projectId, location, processorId, target }) {
    this.config = { projectId, location, processorId, target };
    this.documentAIclient = new DocumentProcessorServiceClient({ apiEndpoint: 'eu-documentai.googleapis.com', });
    // const storageClient = new Storage();
  }

  async processSingleDocument(inputFile, outputFile = false) {
    const { projectId, location, processorId } = this.config;

    const inputFileParsed = path.parse(inputFile);
    if (!outputFile) {
      outputFile = `${inputFileParsed.dir}/${inputFileParsed.name}.json`
    }

    if (this.config.target !== 'prod') {
      console.log('Mocked response by pre-existing', {outputFile});
      await sleep(1000);
    }
    
    // The full resource name of the processor, e.g.:
    // projects/project-id/locations/location/processor/processor-id
    // You must create new processors in the Cloud Console first
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    // console.log({name});return ;
    // Read file into memory.
    const imageFile = await fs.readFile(inputFile);

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');
    const mimeType = mime.lookup(inputFile)
    const request = {
      name,
      rawDocument: {
        content: encodedImage,
        mimeType: mimeType,
      },
    };

    let result = null;
    try {
      [result] = (this.config.target === 'prod'
        // Dev: Call DocumentAI endpoint
        ? await this.documentAIclient.processDocument(request)
        // Dev: Return pre-saved JSON as mock-up
        : [JSON.parse((await fs.readFile(outputFile)).toString())]
      );
    } catch(e) {
      if (e.code == 'ENOENT') { // && this.config.target !== 'prod'
        console.error(`Local E: File ${inputFile} not mocked.`)
      } else {
        console.error('DocumentAI E:', JSON.stringify(e));
      }
      process.exit(1)
    }
    
    const { document } = result;
    
    // Optimize for storage
    delete document?.pages;

    // console.log({ document, outputFile });

    if (outputFile) { // && this.config.target !== 'prod'
      await fs.writeFile(outputFile, JSON.stringify(result));
    }

    return document.entities;
  }

  async #batchProcessDocument(gcsInputUri, gcsOutputUri) {
    const { projectId, location, processorId, mimeType } = this.config;

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // const gcsInputUri = 'gs://bucket/file.pdf';
    // const gcsOutputUri = 'gs://bucket/output/';  

    // Configure the batch process request.
    const request = {
      name,
      inputDocuments: {
        gcsDocuments: {
          documents: [
            {
              gcsUri: gcsInputUri,
              mimeType: mimeType,
            },
          ],
        },
      },
      documentOutputConfig: {
        gcsOutputConfig: {
          gcsUri: `${gcsOutputUri}`, // ${gcsOutputUriPrefix}/
        },
      },
    };

    console.log(JSON.stringify({ request }));
    // Batch process document using a long-running operation.
    // You can wait for now, or get results later.
    // Note: first request to the service takes longer than subsequent
    // requests.
    const [operation] = await this.documentAIclient.batchProcessDocuments(request);

    // Wait for operation to complete.
    await operation.promise();
    console.log('Document processing complete.');
  }
}