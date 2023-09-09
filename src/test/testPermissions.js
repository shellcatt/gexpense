export async function testPermissions() {
    // Test Document AI API
    try {
        const processorName = `v1/projects/${projectId}/locations/${location}/processors/${processorId}`;
        await documentAIclient.getProcessor({name: processorName});
        console.log('Document AI API permissions are proper.');
    } catch (error) {
        console.error('Error accessing Document AI API:', error);
    }

    // Test reading from GCS bucket
    try {
        const bucket = storageClient.bucket(bucketName);
        const file = bucket.file(testFileName);
        await file.download();
        console.log('GCS read permissions are proper.');
    } catch (error) {
        console.error('Error reading from GCS bucket:', error);
    }

    // Test writing to GCS bucket
    try {
        const bucket = storageClient.bucket(bucketName);
        const file = bucket.file('test-write.txt');
        await file.save('Test content');
        console.log('GCS write permissions are proper.');
    } catch (error) {
        console.error('Error writing to GCS bucket:', error);
    }
}

// testPermissions().catch(console.error);
