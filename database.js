const mysql = require('mysql');

const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'publicwifi'
});

connection.connect((err) => {
  if(err) throw err;
  console.log('Connected to MYSQL database!');
});

module.exports = connection;