import sqlite3 from 'sqlite3';

const DB_TABLE = 'expenses';

// Helper
const FIELDS = new Map(Object.entries({
    'file':     'TEXT',
    'size':     'INTEGER',
    'amount':   'INTEGER',
    'date':     'INTEGER',
    'body':     'TEXT',
    'scanned':  "TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime'))",
    'edited':   "BOOLEAN NOT NULL CHECK (edited IN (0, 1))"
}));
///TODO: validate destructured data in methods for existance in FIELDS 

export default class SQLiteWrapper {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('Error connecting to SQLite database:', err);
            } else {
                console.log('Connected to SQLite database.');
            }
        });
    }

    async init() {
        return new Promise((resolve, reject) => {
            const flds = Array.from(FIELDS.entries()).map(([f, t]) => `${f} ${t}`).join(", \n");
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS ${DB_TABLE} (
                    ${flds}
                )
            `.trim();
            // console.log({createTableSQL});
            
            this.db.run(createTableSQL, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    reject(err);
                } else {
                    console.log('Table initialized.');
                    resolve();
                }
            });
        });
    }

    async createIndexFor(data) {
        return new Promise((resolve, reject) => {
            const flds = data.join(', ');
            const idx = data[0];
            const createIndexSQL = `
                CREATE INDEX IF NOT EXISTS ${idx} ON ${DB_TABLE} (${flds})
            `.trim();
            // console.log({createIndexSQL});
            this.db.run(createIndexSQL, (err) => {
                if (err) {
                    console.error('Error creating index:', err);
                    reject(err);
                } else {
                    console.log('Index created.');
                    resolve();
                }
            });
        });
    }

    async rowExists(data) {
        return new Promise((resolve, reject) => {
            const where = Object.keys(data).map((f) => `${f} = ?`).join(' AND ')
            const selectSQL = `
                SELECT COUNT(*) as count FROM ${DB_TABLE} WHERE ${where}
            `.trim();

            this.db.get(selectSQL, Object.values(data), (err, row) => {
                if (err) {
                    console.error('Error checking row existence:', err);
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

    async insertRow(data) {
        return new Promise((resolve, reject) => {
            // Counting on Sqlite3 to create this automatically
            // data['scanned'] = moment().unix();
            try {
                const flds = Object.keys(data).join(', ');
                const phs = Array.from({ length: Object.keys(data).length }, () => '?').join(', ');

                const insertSQL = `
                    INSERT INTO ${DB_TABLE} (${flds}) VALUES (${phs})
                `.trim();
                // console.log({insertSQL});
                this.db.run(insertSQL, Object.values(data), function(err) {
                    if (err) {
                        console.error('Error inserting row:', err);
                        reject(err);
                    } else {
                        console.log('Row inserted.');
                        resolve({ lastID: this.lastID });
                    }
                });
            } catch (e) {
                ///TODO: handle
                reject(e);
            }

        });
    }

    async findBy(data) {
        return new Promise((resolve, reject) => {
            const where = Object.keys(data).map((f) => `${f} = ?`).join(' AND ')
            let selectSQL = `
                SELECT * FROM ${DB_TABLE} WHERE ${where}
            `.trim();
            // console.log({selectSQL}, Object.values(data));
            this.db.all(selectSQL, Object.values(data), (err, rows) => {
                if (err) {
                    console.error('Error checking row existence:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

