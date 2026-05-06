const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1:3306",
  user: "admin",
  password: "rvupnm",
  database: "DBMS project"
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed");
  } else {
    console.log("Connected to MySQL ✅");
  }
});

module.exports = db;