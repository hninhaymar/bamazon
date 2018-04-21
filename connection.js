var mysql = require("mysql");


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "haymarMySql2018",
    database: "bamazon"
  });


  module.exports = connection;