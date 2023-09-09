// import {  } from 'lodash';
import SQLiteWrapper from './SQLiteWrapper.class.mjs';
import ExpenseScanner from './ExpenseScanner.class.mjs';
import moment from 'moment';
import fs from 'fs/promises';
import path, { resolve } from 'path';


export default class ExpenseManager {
  constructor(config) {
    this.config = config;

    this.db = new SQLiteWrapper(config.dbPath);
    this.scanner = new ExpenseScanner(config);
  }

  async init() {
    return new Promise(async (resolve, reject) => {
      // Init DB
      try {
        await this.db.init();
        await this.db.createIndexFor(['file', 'size'])
        resolve();
      } catch (e) {
        return reject({ msg: e.message });
      }
    })
  }
  async processExpense(file, size) {
    return new Promise(async (resolve, reject) => {
      let res = {
        entry: null,
        msg: `Gonna process ${file}`
      };

      const inputFileName = path.parse(file).name;
      const fullInputPath = `${this.config.inputPath}/${file}`;
      const fullOutputPath = `${this.config.outputPath}/${inputFileName}.json`;

      // Check file 
      try {
        let stat = await fs.stat(fullInputPath);
        size = stat.size;
      } catch (e) {
        res.msg = e.message;
        return reject(res);
      }
      
      // Check DB existing
      res.entry = await this.db.findBy({ file, size });

      if (res.entry?.length > 0) {
        let entry = res.entry[0]
        res.msg = `Expense already scanned: ${entry.file} (${moment(entry.date*1000).format(this.config.dateFormat)} = ${entry.amount})`;
        // console.log(res.entry);
        return reject(res);
      }

      // Process
      console.log(`Sending ${fullInputPath} for scanning...`);
      try {
        const entities = await this.scanner.processSingleDocument(fullInputPath, fullOutputPath);
        res.msg = 'Expense scanned.';
        // console.log({ entities });
        if (!entities) {
          res.msg = 'No entities?';
          return reject(res);
        }
        // Check & write in DB
        const entryAmount = entities.find(e => e.type == 'total_amount')
        const entryDate = entities.find(e => e.type == 'receipt_date')
        // const entryTime = entities.find(e => e.type == 'purchase_time')

        // 0's can be interpreted as 8's sometimes
        // ... other edge cases, we cannot cover here
        let edited = false;
        const autoCorrect = (str) => {
          if (!str) return str;
          const replace = {
            '-8': '-0',
            '-282': '-202',
          };

          return Object.entries(replace).reduce((acc, [mistake, correct]) => {
            if (acc.match(new RegExp(mistake, 'gi'))) {
              edited = true;
              return acc.replace(mistake, correct)
            }
            return acc;
          }, str).trim();
        }

        const amount = autoCorrect(entryAmount?.normalizedValue?.text) || 0; ///TODO: safe `structuredValue`
        const date = autoCorrect(entryDate?.mentionText) || 0; ///TODO: optimize for now, not 0
        // const time = entryTime?.mentionText || 0; // normalizedValue?.text
        const datetime = moment(date, this.config.dateFormat).unix();// + moment(time).unix();

        res.entry = {
          file: file,
          size: size,
          amount: parseFloat(amount),
          date: datetime, 
          body: JSON.stringify(entities),
          edited: edited,
        };
        // console.log({ res });
        // return resolve(res);

        res.entry = await this.db.insertRow(res.entry);
        res.msg = 'Data saved.';
        // console.log(res);

        // Check duplicates
        res.entry = await this.db.findBy({ amount, date: datetime });
        // console.log({res});

        if (res.entry?.length > 1) {
          res.msg = (`Found ${res.entry.length-1} possible duplicates for ${date} (${amount})`);
          console.log(res.entry);
          return reject(res);
        }
      } catch (e) {
        console.error(e.message);
        res.msg = e.message;
        return reject(res);
      }
      return resolve(res);
    });
  }
}