// SETUP
// ==================================================

// Require the necessary Node.js modules
require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");

// Setup the DB connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "bamazon"
});


// FUNCTIONS
// ==================================================

// Show the complete and updated product catalog
var showProducts = function(res) {
    console.log("-------\nHere's the complete and updated catalog...\n-------");
    for (var i = 0; i < res.length; i++) {
        console.log("ID # " + res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price + " | # of units left: " + res[i].stock_quantity);
    }
    console.log("----------");
};

// Show the products with less than 5 units available
var showLowInventory = function(res) {
    console.log("-------\nThe following items have less than 5 units available...\n-------");
    for (var i = 0; i < res.length; i++) {
        if (res[i].stock_quantity < 5) {
            console.log("ID # " + res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price + " | # of units left: " + res[i].stock_quantity);
        }
    }
    console.log("----------");
};

// Update the product quantity in the database
var updateDbQuantity = function(res, answer) {

    var updateId = parseInt(answer.update);
    var idArray = [];

    // Create an array with all the available item IDs
    for (var i = 0; i < res.length; i++) {
        idArray.push(res[i].item_id);
    };

    // Check if the manager's prompt is among the available IDs
    if (idArray.indexOf(updateId) === -1) {
        console.log("Sorry, that was not a correct selection.");
        updateQuantity(res);
    }
    else {
        inquirer
        .prompt([
        {
        name: "units",
        type: "input",
        message: "Ok. What is the new quantity of item # " + updateId + " (" + res[(updateId - 1)].product_name + ") in inventory?"
        }
        ])
        .then(function(answer) {

            var chosenProduct = res[(updateId - 1)];
            var newQuantity = parseInt(answer.units);

            // Update the DB
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                    stock_quantity: newQuantity
                    },
                    {
                    item_id: chosenProduct.item_id
                    }
                ],
                function(err) {
                    if (err) throw err;
                    console.log("Update successful! The new quantity of item # " + updateId + " is " + newQuantity);

                    // Query the DB for updated data
                    connection.query("SELECT * FROM products", function(err, res) {
                    if (err) throw err;
                    // Start the main function
                    queryManager(res);
                    });
                }
            );
        });
    }

}

// Let a manager update the quantity of existing products
var updateQuantity = function(res) {
    showProducts(res);
    inquirer
    .prompt([
    {
      name: "update",
      type: "input",
      message: "Which item would you like to update? (Please type the corresponding ID #)"
    },
    ])
    .then(function(answer) {
        updateDbQuantity(res, answer);
    });
}

// Add a new product to the inventory
var updateDbProduct= function(res, answer) {

    connection.query(
        "INSERT INTO products SET ?",
    {
      product_name: answer.product,
      department_name: answer.department,
      price: answer.price,
      stock_quantity: answer.stock
    },
    function(err, res) {
        if (err) throw err;
        console.log("Update successful!");

        // Query the DB for updated data
        connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // Start the main function
        queryManager(res);
        });
    }
    );

}

// Let the manager add a new product
var addProduct = function(res) {
    // Ask prompts for the necessary details
    inquirer
    .prompt([
    {
    name: "product",
    type: "input",
    message: "What is the product name?"
    },
    {
    name: "department",
    type: "input",
    message: "What is the department name?"
    },
    {
    name: "price",
    type: "input",
    message: "What is the product price? $"
    },
    {
    name: "stock",
    type: "input",
    message: "Which is the quantity in stock?"
    },
    ])
    .then(function(answer) {
        updateDbProduct(res, answer);
    });
}


// MAIN PROCESS
// ==================================================

// Main function
function queryManager(res) {

    inquirer
    .prompt({
      name: "managerChoice",
      type: "list",
      message: "What would you like to do next?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    })
    .then(function(answer) {
      if (answer.managerChoice === "View Products for Sale") {
        showProducts(res);
        queryManager(res);
      }
      else if (answer.managerChoice === "View Low Inventory") {
        showLowInventory(res);
        queryManager(res);
      }
      else if (answer.managerChoice === "Add to Inventory") {
        updateQuantity(res);
      }
      else if (answer.managerChoice === "Add New Product") {
        addProduct(res);
      }
      else if (answer.managerChoice === "Exit") {
        connection.end();
      }
    });

}

// Connect to the DB
connection.connect(function(err) {
    if (err) throw err;
    // Query the DB
    connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("***** Welcome, Manager. *****");
    // Start the main function
    queryManager(res);
    });
});