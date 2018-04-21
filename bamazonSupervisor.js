var inquirer = require("inquirer");
var connection = require("./connection.js");

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    SupervisorPrompt();
  });

  var supervisorChoices = ["View Product Sales by Department","Create New Department","Quit"];

  function SupervisorPrompt(){
    inquirer.prompt([
        {
            type: "list",
            name: "options",
            choices: supervisorChoices,
            message: "As a supervisor of bamazon, What would you like to do? "
        }]).then(function (response) {
            //console.log(JSON.stringify(response,null,''));
            if(response.options == supervisorChoices[0]){
                viewProductSalesByDept();
            }
            else if(response.options == supervisorChoices[1]){
                promptDeptIdAndCheck();
            }
            else if(response.options == supervisorChoices[2]){
                quit();
            }
            else{
                console.log("INVALID option!!");
            }
        });
  }

  function viewProductSalesByDept(){
    var query = connection.query("select d.*, SUM(p.product_sales) as product_sales_by_dept, SUM(p.product_sales)-d.over_head_costs as total_profit from products p inner join departments d on p.department_name=d.department_Name GROUP BY p.department_name ",  
    function(err, res) {
        if (err) throw err;
        console.log("Department ID | Department Name | Over Head Cost | Product Sales | Total Profit/Losses");
        res.forEach(function(r){
            console.log(r.dept_id + " | " + r.department_Name + " | " + r.over_head_costs + " | " + r.product_sales_by_dept 
            + " | " + r.total_profit);
        });
        SupervisorPrompt();
    });

    console.log(query.sql);  
  }

  function promptDeptIdAndCheck(){
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Enter an ID for your new Department  (make sure it's unique):  "
        }
    ]).then(function (response){
        checkIfDeptExists(response.id);
    });
}

function checkIfDeptExists(id){
    //for similar reason as manager view for item ID's, i'm doing this on purpose
    var query = connection.query("SELECT dept_id FROM departments WHERE dept_id=?",[id],  
    function(err, res) {
        if (err) throw err;
        if(res[0]){
            console.log("This dept id "+id+" is taken. Try again.");
            promptDeptIdAndCheck();
        }
        else{
            console.log("This dept id "+id+" is available. Let's enter the rest of the department data.");
            promptNewDept(id);
        }
        
    });
    console.log(query.sql);  
}

function promptNewDept(id){
    inquirer.prompt([
        {
            type: "input",
            name: "dept",
            message : "Enter your product's department name: "
        },
        {
            type: "input",
            name: "overhead",
            message : "Enter your department's overhead cost :  "
        }]).then(function (response){
            createNewDept(id,response.dept,response.overhead);
        });
}

function createNewDept(id,dept,overhead){
    var query = connection.query("INSERT INTO departments VALUES(?,?,?)",[id,dept,overhead], 
    function(err,res) {
        if (err) throw err;
        console.log("New Department Added!");
        console.log("**********************************************");
        SupervisorPrompt();
      });
}

  function quit(){
    console.log("Closing out Supervisor View");
    console.log("********************************************");
    connection.end();
    process.exit();
}