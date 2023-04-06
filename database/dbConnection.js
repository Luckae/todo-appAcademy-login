var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost', // Replace with your host name
  user: 'robialih_lawson',      // Replace with your database username
  password: 'Yb~Zcn,0R(ch',      // Replace with your database password
  database: 'robialih_appAcademy' // // Replace with your database Name
});

conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;
