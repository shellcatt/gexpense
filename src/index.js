import ExpenseManager from './lib/ExpenseManager.class.mjs';
import fs from 'fs/promises';

async function main(/** projectId, location, processorId, filePath */) {
  // ----------------------------------------
  const { PROJECT_ID, LOCATION, PROCESSOR_ID, INPUT_DIR, DATA_DIR, DATA_FILE } = process.env;
  const config = { 
    projectId: PROJECT_ID, 
    location: LOCATION, 
    processorId: PROCESSOR_ID, 
    dbPath: `/${DATA_DIR}/${DATA_FILE}`, 
    inputPath: `/${INPUT_DIR}`,
  }

  const backend = new ExpenseManager(config);


  for (let file of await fs.readdir(`/${INPUT_DIR}`)) {
    try {
      // console.log({file});
      const entry = await backend.processExpense(file);
      console.log(`Msg: ${entry.msg}`);
    } catch (e) {
      console.error(e)
    }
  }

  // ----------------------------------------
}
 
 main(...process.argv.slice(2)).catch(err => {
   console.error(err);
   process.exitCode = 1;
 });