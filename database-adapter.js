// Database Adapter - Works with PostgreSQL or SQLite
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

class DatabaseAdapter {
  constructor() {
    const dbUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';
    this.useSQLite = dbUrl.startsWith('sqlite:');
    
    if (this.useSQLite) {
      const dbPath = dbUrl.replace('sqlite:', '');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('SQLite connection error:', err);
        } else {
          console.log('Connected to SQLite database');
        }
      });
    } else {
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      console.log('Connected to PostgreSQL database');
    }
  }

  async query(sql, params = []) {
    if (this.useSQLite) {
      return new Promise((resolve, reject) => {
        // Convert PostgreSQL $1, $2 to SQLite ?
        const sqliteSql = sql.replace(/\$\d+/g, '?');
        
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          this.db.all(sqliteSql, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
          });
        } else {
          this.db.run(sqliteSql, params, function(err) {
            if (err) reject(err);
            else resolve({ rows: [{ id: this.lastID }], rowCount: this.changes });
          });
        }
      });
    } else {
      return await this.pool.query(sql, params);
    }
  }

  async connect() {
    if (this.useSQLite) {
      return {
        query: this.query.bind(this),
        release: () => {}
      };
    } else {
      return await this.pool.connect();
    }
  }
}

module.exports = DatabaseAdapter;
