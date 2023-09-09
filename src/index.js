import ExpenseManager from './lib/ExpenseManager.class.mjs';
import fs from 'fs/promises';
import mime from 'mime-types';

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main(/** projectId, location, processorId, filePath */) {
  // ----------------------------------------
  const { PROJECT_ID, LOCATION, PROCESSOR_ID, INPUT_DIR, MIME_TYPE, OUTPUT_DIR, DATE_FORMAT, DATA_DIR, DATA_FILE, TARGET } = process.env;
  const config = { 
    projectId: PROJECT_ID, 
    location: LOCATION, 
    processorId: PROCESSOR_ID, 
    dbPath: `/${DATA_DIR}/${DATA_FILE}`, 
    inputPath: `/${INPUT_DIR}`,
    outputPath: `/${OUTPUT_DIR}`,
    target: TARGET,
    dateFormat: DATE_FORMAT,
  }

  const backend = new ExpenseManager(config);

  await backend.init();

  for (let file of await fs.readdir(`/${INPUT_DIR}`)) {
    try {
      let mimeType = mime.lookup(file);
      if (MIME_TYPE == mimeType) {
        const entry = await backend.processExpense(file);
        console.log(`Msg: ${entry.msg}`);
      }
    } catch (e) {
      console.error('E: ', e?.msg || e?.message || 'Unknown x(')
    }
    await sleep(1000);
  }

  // ----------------------------------------
}

 main(...process.argv.slice(2)).catch(err => {
   console.error(err);
   process.exitCode = 1;
 });