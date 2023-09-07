import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
// import { Storage } from '@google-cloud/storage';

import fs from 'fs/promises';
import mime from 'mime-types';


export default class ExpenseScanner {
    constructor({ projectId, location, processorId }) {
        this.config = { projectId, location, processorId };
        this.documentAIclient = new DocumentProcessorServiceClient({ apiEndpoint:  'eu-documentai.googleapis.com', });
        // const storageClient = new Storage();
    } 

    async processSingleDocument(inputFile, outputFile = false) {
      const { projectId, location, processorId } = this.config;

      // The full resource name of the processor, e.g.:
      // projects/project-id/locations/location/processor/processor-id
      // You must create new processors in the Cloud Console first
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
        // console.log({name});return ;
        // Read the file into memory.
        const imageFile = await fs.readFile(inputFile);
        // console.log({imageFile});return;
        // console.log({inputFile});return;
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
        
        // Recognizes text entities in the PDF document
        const [ result ] = (target === 'prod'
           ? await this.documentAIclient.processDocument(request)
           : fs.readFile(`${inputFile}.json`)
        );
        // console.log({result, outputFile});
        if (outputFile) { // && target !== 'prod'
          await fs.writeFile(outputFile, result);
        }
        const { document } = result;
        return document;
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
      
        console.log(JSON.stringify({request}));
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