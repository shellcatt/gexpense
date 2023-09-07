// import {  } from 'lodash';
import SQLiteWrapper from './SQLiteWrapper.class.mjs';
import ExpenseScanner from './ExpenseScanner.class.mjs';
import moment from 'moment';
import fs from 'fs/promises';

const DATE_FORMAT = 'DD-MM-YYYY';

export default class ExpenseManager {
    constructor(config) {
      this.config = config;

      this.db = new SQLiteWrapper(config.dbPath);
      this.scanner = new ExpenseScanner(config);
    }
  
    async processExpense(file, size) {
      return new Promise(async (resolve, reject) => {
        let res = {
          entry: null,
          msg: `Gonna process ${file}`
        };
        
        const fullInputPath = `${this.config.inputPath}/${file}`;
        const fullOutputPath = `${this.config.inputPath}/${file}.json`;
        // Check file 
        try {
          let stat = await fs.stat(fullInputPath);
          size = stat.size;
        } catch (e) {
          res.msg = e.message;
          reject(res);
        }
        // Init DB
        try {
          await this.db.init();
          await this.db.createIndexFor(['file', 'size'])
        } catch(e) {
          res.msg = e.message;
          reject(res);
        }
        // Check DB existing
        res.entry = await this.db.findBy({file, size});
    
        if (res.entry?.length > 0) {
          res.msg = 'Expense already scanned.';
          reject(res);
        }

        // Process
        console.log(`Sending ${fullInputPath} for scanning...`);
        try {
          const dataEntries = await this.scanner.processSingleDocument(fullInputPath, fullOutputPath);
          res.msg = 'Expense scanned.';

          // Check & write in DB
          const entryAmount = dataEntries.find(e => e.type == 'total_amount')
          const entryDate = dataEntries.find(e => e.type == 'receipt_date')
          const entryTime = dataEntries.find(e => e.type == 'purchase_time')
          
          const amount = entryAmount?.normalizedValue?.text; ///TODO: safe `structuredValue`
          const date = entryDate?.mentionText;
          // const time = entryTime?.mentionText; // normalizedValue?.text

          res.entry = {
            file: file, 
            size: size,
            amount: parseFloat(amount),
            date: moment(date, DATE_FORMAT).valueOf(), ///TODO: parse `time` as well
            // body: dataEntries
          };
          console.log({res});
          entry.body = dataEntries;
    
          await this.db.insertRow(entry);  
          res.msg = 'Data saved.';

          // Check duplicates
          res.entry = await this.db.findBy({amount, date});
          
          if (res.entry.length > 1) {
            msg = (`${similarRows.length} Possible duplicates for ${date} (${amount})`);
            reject(res);
          }
        } catch (e) {
          res.msg = e.message;
          reject(res);
        }
        resolve({entry, msg});
      });
    }
}