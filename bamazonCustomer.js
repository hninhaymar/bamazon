var inquirer = require("inquirer");
var connection = require("./connection.js");

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    showAvailProducts();
  });

  function InitialPrompt(){
    inquirer.prompt([
        {
            type: "input",
            name: "item",
            message: "Enter item number of product you wish to buy :  "
        },
        {
            type: "input",
            name: "quantity",
            message: "Enter the quantity :  "
        }]).then(function (response){
            orderProduct(response.item,response.quantity);
            
        });
  }

  function quit(){
      console.log("Thanks for shopping with us!");
      console.log("********************************************");
      connection.end();
      process.exit();
  }

  function promptContinue(){
    inquirer.prompt([
        {
            type: "confirm",
            name: "continue",
            message: "Would you like to continue shopping?"
        }]).then(function (response){
            if(response.continue){
                showAvailProducts();
            }
            else{
                quit();
            }
            
        });
  }

  function orderProduct(id,quantity){
    var query = connection.query("SELECT item_id,stock_quantity as quantity, price,product_name FROM products WHERE ?",[ {
        item_id : id
    }],  function(err, res) {
        if (err) throw err;
        console.log("There are " + res[0].quantity + " units of " + res[0].product_name + " available for purchase");
  
        if(quantity > res[0].quantity) {
            console.log("Insufficient Quantity! Transaction aborted");
            console.log("**********************************************");
            promptContinue();
        }
        else{
            var new_quantity = res[0].quantity-quantity;
            console.log("Purchasing " + quantity + " "+ res[0].product_name + ", which will cost $"+(quantity*res[0].price));
            buyProduct(id,new_quantity,quantity);
        }
  
    });
      console.log(query.sql);
  }


  function buyProduct(id,new_quantity,quantity){
      var query = connection.query("UPDATE products SET ?, product_sales = product_sales + (price * ?) WHERE ?",[{
        stock_quantity : new_quantity,
      },quantity,
      {
        item_id : id
      }], function(err,res) {
        if (err) throw err;
        console.log("Purchase complete!");
        console.log("**********************************************");
        promptContinue();
      });
      console.log(query.sql);
  }

  

  function showAvailProducts(){
    var query = connection.query("SELECT * FROM products ",  function(err, res) {
        if (err) throw err;
        console.log("Item ID | Product Name | Department Name | Price | Quantity | Product Sales ");
        res.forEach(function(r){
            console.log(r.item_id + " | " + r.product_name + " | " + r.department_name + " | " 
            + r.price + " | " + r.stock_quantity + " | " + r.product_sales);
        });
        InitialPrompt();
      });

      console.log(query.sql);

  }