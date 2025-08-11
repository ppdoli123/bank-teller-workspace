const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// SQLite 데이터베이스 경로
const dbPath = path.join(__dirname, '../database.sqlite');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite 연결 오류:', err);
    process.exit(-1);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
  }
});

// Promise를 사용한 쿼리 함수
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
};

// 단일 실행 함수
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          lastID: this.lastID, 
          changes: this.changes,
          rows: [{ lastID: this.lastID, changes: this.changes }]
        });
      }
    });
  });
};

module.exports = { db, query, run };