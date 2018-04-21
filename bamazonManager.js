var inquirer = require("inquirer");
var connection = require("./connection.js");

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    ManagerPrompt();
  });

  var managerChoices = ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product","Quit"];

  function ManagerPrompt(){
    inquirer.prompt([
        {
            type: "list",
            name: "options",
            choices: managerChoices,
            message: "As a manager of bamazon, What would you like to do? "
        }]).then(function (response) {
            if(response.options == managerChoices[0]){
                viewProductsForSale();
            }
            else if(response.options == managerChoices[1]){
                viewLowInventory();
            }
            else if(response.options == managerChoices[2]){
                promptToAddInventory();
            }
            else if(response.options == managerChoices[3]){
                promptItemIdAndCheck();
            }
            else if(response.options == managerChoices[4]){
                quit();
            }
            else{
                console.log("INVALID option!!");
            }
        });
}

function viewProductsForSale(){
    var query = connection.query("SELECT * FROM products ",  function(err, res) {
        if (err) throw err;
        console.log("Item ID | Product Name | Department Name | Price | Quantity");
        res.forEach(function(r){
            console.log(r.item_id + " | " + r.product_name + " | " + r.department_name + " | " + r.price + " | " + r.stock_quantity);
        });
        ManagerPrompt();
    });

    console.log(query.sql);  
}

function viewLowInventory() {
    var query = connection.query("SELECT * FROM products  WHERE stock_quantity < 5",  function(err, res) {
        if (err) throw err;
        console.log("Item ID | Product Name | Department Name | Price | Quantity");
        res.forEach(function(r){
            console.log(r.item_id + " | " + r.product_name + " | " + r.department_name + " | " + r.price + " | " + r.stock_quantity);
        });
        ManagerPrompt();
    });

    console.log(query.sql); 

}

function promptToAddInventory(){
    inquirer.prompt([
        {
            type: "input",
            name: "item",
            message: "Enter item number of product  :  "
        },
        {
            type: "input",
            name: "quantity",
            message: "Enter the quantity to be added:  "
        }]).then(function (response){
            addToInventory(response.item,response.quantity);
            
        });
}

function addToInventory(id,quantity) {
    var query = connection.query("UPDATE products SET stock_quantity=stock_quantity+? WHERE ?",[
        quantity,
       {
        item_id : id
      }], function(err,res) {
        if (err) throw err;
        console.log("Inventory Added!");
        console.log("**********************************************");
        ManagerPrompt();
      });
   
}

function promptItemIdAndCheck(){
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Enter item number for your new product  (make sure it's unique):  "
        }
    ]).then(function (response){
        checkIfItemExists(response.id);
    });
}

function checkIfItemExists(id){
    //i purposely did not make item_id auto_increment; 
    //so that it gives the manager maximum flexibility to enter them whatever they prefer, allows skipping of item numbers
    // ideally they can group item id's accordingly to their categories
    var query = connection.query("SELECT item_id FROM products WHERE item_id=?",[id],  
    function(err, res) {
        if (err) throw err;
        if(res[0]){
            console.log("This item id "+id+" is taken. Try again.");
            promptItemIdAndCheck();
        }
        else{
            console.log("This item id "+id+" is available. Let's enter the rest of the product data.");
            promptNewProduct(id);
        }
        
    });

    console.log(query.sql);  
}

function promptNewProduct(id){
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message : "Enter your product name: "
        },
        {
            type: "input",
            name: "dept",
            message : "Enter your product's department name: "
        },
        {
            type: "input",
            name: "price",
            message : "Enter your product's unit price: "
        },
        {
            type: "input",
            name: "quantity",
            message: "Enter the stock quantity :  "
        }]).then(function (response){
            addNewProduct(id,response.name,response.dept,response.price,response.quantity);
            
        });
}

function addNewProduct(id,name,dept,price,quantity) {
    var query = connection.query("INSERT INTO products VALUES(?,?,?,?,?,0)",[
        id,name,dept,price,quantity], function(err,res) {
        if (err) throw err;
        console.log("New Product Added!");
        console.log("**********************************************");
        ManagerPrompt();
      });
}

function quit(){
    console.log("Closing out Manager View");
    console.log("********************************************");
    connection.end();
    process.exit();
}