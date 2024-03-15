import { app } from 'electron'
import path from 'node:path'
import { type Database, verbose } from 'sqlite3'

const TAG = '[sqlite3]'
let database: Promise<Database>

export function getSqlite3(filename = path.join(app.getPath('userData'), 'database.sqlite3')) {
  return database ??= new Promise<Database>((resolve, reject) => {
    const db = new (verbose().Database)(filename, error => {
      if (error) {
        console.log(TAG, 'initialize failed :(')
        console.log(TAG, error)
        reject(error)
      } else {
        console.log(TAG, 'initialize success :)')
        console.log(TAG, filename)

        // Create the table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );`, (err) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log('Table created or already exists.');
          }
        });

        resolve(db)
      }
    })
  })
}

export function insertFormData(db, name) {
  db.run(`INSERT INTO test_table(name) VALUES(?)`, [name], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row inserted with rowid ${this.lastID}`);
  });
}
