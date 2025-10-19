const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/cursorpool.db')
const schemaPath = path.join(__dirname, '../../database/schema.sql')

const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
    throw err
  }
  console.log('Connected to SQLite database at:', dbPath)
})

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON')
})

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(schemaPath, 'utf8', (err, sql) => {
      if (err) {
        console.error('Error reading schema file:', err.message)
        reject(err)
        return
      }

      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const executeStatement = (index) => {
        if (index >= statements.length) {
          console.log('Database schema initialized successfully')
          resolve()
          return
        }

        db.run(statements[index], (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error('Error executing statement:', err.message)
            reject(err)
            return
          }
          executeStatement(index + 1)
        })
      }

      executeStatement(0)
    })
  })
}

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

module.exports = {
  db,
  initializeDatabase,
  query,
  run,
  get,
}
