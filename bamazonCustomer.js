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
    console.log("-------\nHello. Here's our complete and updated catalog...\n-------");
    for (var i = 0; i < res.length; i++) {
        console.log("ID # " + res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price);
    }
};

// Prompt the user to pick an item to buy
var pickItem = function(res) {

    inquirer
    .prompt([
    {
      name: "order",
      type: "input",
      message: "Which item would you like to order? (Please type the corresponding ID #)"
    },
    ])
    .then(function(answer) {

        var orderId = parseInt(answer.order);
        var idArray = [];

        // Create an array with all the available item IDs
        for (var i = 0; i < res.length; i++) {
            idArray.push(res[i].item_id);
        };

        // Check if the user prompt is among the available IDs
        if (idArray.indexOf(orderId) === -1) {
            console.log("Sorry, that was not a correct selection.");
            pickItem(res);
        }
        else {
            chooseQuantity(res, orderId);
        }

    });
};

// Ask the user how many units he wants to buy
var chooseQuantity = function(res, orderId) {

    inquirer
    .prompt([
    {
    name: "units",
    type: "input",
    message: "How many units of item # " + orderId + " do you wish to order?"
    }
    ])
    .then(function(answer) {

        var chosenProduct = res[(orderId - 1)];
        var chosenQuantity = parseInt(answer.units);
        var availableQuantity = chosenProduct.stock_quantity;

        if (isNaN(chosenQuantity)) {
            console.log("Please insert a number.");
            chooseQuantity(res, orderId);
        }

        else if (chosenQuantity > availableQuantity) {
            console.log("Sorry, we only have " + availableQuantity + " units left of this product.");
            chooseQuantity(res, orderId);
        }
        else {
            depleteInventory(chosenProduct, chosenQuantity, availableQuantity);
        }

    });

};

// Remove any units sold from the product inventory
var depleteInventory = function(chosenProduct, chosenQuantity, availableQuantity) {

    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: (availableQuantity - chosenQuantity)
          },
          {
            item_id: chosenProduct.item_id
          }
        ],
        function(err, res) {
            if (err) throw err;
            closeOrder(chosenProduct, chosenQuantity);
        }
      );

};

// Confirm order with the user
var closeOrder = function(chosenProduct, chosenQuantity) {
    console.log("Thanks for your order! Your total is $" + (chosenProduct.price * chosenQuantity));
    console.log("You will receive " + chosenQuantity + " unit(s) of \"" + chosenProduct.product_name + "\" in the next 2 - 3 days.\nGoodbye!");
    connection.end();
};


// MAIN PROCESS
// ==================================================

// Main function
function startProcess() {

    // Query the DB
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;

      // Show the catalog
      showProducts(res);

      // Prompt the user to choose an item
      pickItem(res);

    });
}

// Connect to the DB and run the main function
connection.connect(function(err) {
    if (err) throw err;
    startProcess();
});