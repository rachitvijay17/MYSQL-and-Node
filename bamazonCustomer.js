var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

//Making the connection to the Local Host
var connection = mysql.createConnection({

    host: "localhost",
    port: 3306,
    user: "root",
    password: "Password12345",
    database: "bamazon"
});

//querying the database with the connection



connection.connect(function(err){
    if(err) throw err;

    console.log("Connection as ID: "+ connection.threadId);
    Start();
    //DisplayProducts();
    //ItemSelection();

});

function Start(){

    inquirer
    .prompt({
      name: "view",
      type: "rawlist",
      message: "Select the View you want to operate",
      choices: ["CUSTOMER", "MANAGER", "SUPERVISOR"]
    }).then(function(selection){

        if(selection.view === "CUSTOMER"){
            DisplayProducts();
        };
        if(selection.view === "MANAGER"){
            ManagerView();
        };
        if(selection.view === "SUPERVISOR"){
            SupervisorView();
        };


    });
};

function AvailableProducts(){

    connection.query("select item_id, product_name, CONCAT( '$',price) as price from products", function(err,res){

        if(err) throw err;
        //displaying the result on the console
        //console.log(JSON.stringify(res));
        for(var i = 0; i<res.length; i++){

            console.log("*********************************************************************");
            console.log("Item Number        : "+res[i].item_id);
            console.log("Product Name       : "+res[i].product_name);
            console.log("Price              : "+res[i].price);
            console.log("*********************************************************************");
        }
        console.log("End Connection");
        //connection.end();
    })
};

function DisplayProducts(){

    //Selecting the product details from the database
    connection.query("select item_id, product_name, CONCAT( '$',price) as price from products", function(err,res){

        if(err) throw err;
        //displaying the result on the console
        //console.log(JSON.stringify(res));
        for(var i = 0; i<res.length; i++){

            console.log("*********************************************************************");
            console.log("Item Number        : "+res[i].item_id);
            console.log("Product Name       : "+res[i].product_name);
            console.log("Price              : "+res[i].price);
            console.log("*********************************************************************");
        }
        console.log("End Connection");
        //connection.end();
        ItemSelection();
    })
};

function ItemSelection(){

    inquirer.prompt([
        {
            type: "input",
            name: "Itemnumber",
            message: "Which Item number you want to buy?",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
              }
        },
        {
            type: "input",
            name: "Quantity",
            message: "How many units of the product you want to buy?",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
              }
        }
    ]).then(function(answer){

        //checking if we can meet the order quantity
        console.log(answer.Itemnumber);

        var query = connection.query("select stock_quantity, price from products where ?",
        {
            item_id : parseInt(answer.Itemnumber)
        },
        function(err, res){

            if(err) throw err;

            console.log("The number of quantity for the product: ");
            console.log(res[0].stock_quantity);
            console.log(query.sql);

            var TotalQuantity = res[0].stock_quantity;
            var price = res[0].price;

            if (TotalQuantity < answer.Quantity){
                console.log("Insufficient quantity!")
            }else{

                console.log("The Total Cost of your order is $"+ answer.Quantity*res[0].price);
                UpdateQuantity(answer.Quantity, answer.Itemnumber, TotalQuantity, price);

            }

        })
    })
};

function UpdateQuantity(input1, input2, input3, input4){

    var query = connection.query("Update products set ? where ?",
        [
        {
            stock_quantity : parseInt(input3) - parseInt(input1),
            product_sale   : parseInt(input1)*parseFloat(input4)

        },    
        {
            item_id : parseInt(input2)
        }],
        function(err,res){
            if(err) throw err;

            console.log(query.sql);
            console.log(res.affectedRows+" row got updated");
            connection.end();

        })

};

function ManagerView(){

    inquirer
    .prompt({
      name: "menu",
      type: "rawlist",
      message: "Select from the following:",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }).then(function(option){
        //Displaying the products data
        if(option.menu === 'View Products for Sale'){

            var query = 
            connection.query("select item_id, product_name, CONCAT( '$',price) as price, stock_quantity from products",function(err,res){

                if (err) throw err;

                for(var i = 0; i<res.length; i++){
                console.log("*********************************************************************");
                console.log("Item Number        : "+res[i].item_id);
                console.log("Product Name       : "+res[i].product_name);
                console.log("Price              : "+res[i].price);
                console.log("Quantity           : "+res[i].stock_quantity);
                console.log("*********************************************************************");
                }
            })

        };
        //Displaying the View Low Inventory data
        if(option.menu === 'View Low Inventory'){

            var query = connection.query("select * from products where stock_quantity <5",function(err, res){

                if (err) throw err;

                for(var i = 0; i<res.length; i++){
                    console.log("*********************************************************************");
                    console.log("Item Number        : "+res[i].item_id);
                    console.log("Product Name       : "+res[i].product_name);
                    console.log("Price              : "+res[i].price);
                    console.log("Quantity           : "+res[i].stock_quantity);
                    console.log("*********************************************************************");
                    }

            })
        };
        //Displaying the 
        if(option.menu === 'Add to Inventory'){

            connection.query("select item_id, product_name, CONCAT( '$',price) as price, stock_quantity from products", function(err,res){

                if(err) throw err;
                //displaying the result on the console
                //console.log(JSON.stringify(res));
                for(var i = 0; i<res.length; i++){
        
                    console.log("*********************************************************************");
                    console.log("Item Number        : "+res[i].item_id);
                    console.log("Product Name       : "+res[i].product_name);
                    console.log("Price              : "+res[i].price);
                    console.log("Quantity           : "+res[i].stock_quantity);
                    console.log("*********************************************************************");
                }
                //console.log("End Connection");
                //connection.end();
                UpdateItem();
            })
            
            
        };

        if(option.menu === 'Add New Product'){

            inquirer
                    .prompt([
                    {
                        name: "productname",
                        type: "input",
                        message: "What is the item name you would like to add?"
                    },
                    {
                        name: "department",
                        type: "input",
                        message: "Which department you would like to add for the product?"
                    },
                    {
                        name: "price",
                        type: "input",
                        message: "What is the price of the product?"
                    },
                    {
                        name: "quantity",
                        type: "input",
                        message: "How much quantity you want to add?"
                    }
                    ]).then(function(res){

                        connection.query("INSERT INTO PRODUCTS SET ?",
                        {
                            product_name: res.productname,
                            department_name: res.department,
                            price: res.price,
                            stock_quantity: res.quantity
                        },function(err){
                            if(err) throw err;
                            console.log("Item inserted successfully");
                            connection.end();
                        })
                    })
            
        };

    })
};


function UpdateItem(){

    inquirer
            .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the item you would like to choose?"
            },
            {
                name: "Quantity",
                type: "input",
                message: "How much quantity you want to add?"
            }
            ]).then(function(item){

                connection.query("Update products SET ? WHERE ?",
                [
                    {
                        stock_quantity: item.Quantity
                    },
                    {
                        item_id: item.item
                    }
                ], function(err){
                    if(err) throw err;
                    console.log(res.affectedRows + "Items Updated successfully");
                })
            })
};

function SupervisorView(){

    inquirer
    .prompt({
      name: "menu",
      type: "rawlist",
      message: "Select from the following:",
      choices: ["View Product Sales by Department", "Create New Department"]
    }).then(function(input){

        if(input.menu === 'View Product Sales by Department'){

            connection.query("select d.department_id, d.department_name, d.over_head_costs, sum(p.product_sale) as product_sale, sum((p.product_sale-d.over_head_costs)) as total_profit from products p inner join departments d on p.department_name = d.department_name group by d.department_id, d.department_name, d.over_head_costs",
                        function(err,res){
                            if(err) throw err,
                            console.log("The result is: ");
                            console.table(res);
                        })

        }

        if(input.menu === 'Create New Department'){

            inquirer
            .prompt([
            {
                name: "Departmant_name",
                type: "input",
                message: "What is the department name you would like to add?"
            },
            {
                name: "overhead",
                type: "input",
                message: "How much is the over head cost for the department?"
            }
            ]).then(function(res){

                connection.query("INSERT INTO DEPARTMENTS SET ?",
                {
                    department_name: res.Departmant_name,
                    over_head_costs: res.overhead
                },function(err){
                    if(err) throw err;
                    console.log("Deparment created successfully");
                    connection.end();
                })
            })

        }



    })

}




