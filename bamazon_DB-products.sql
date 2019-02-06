USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
("Harry Potter: The Complete 8-Film Collection", "DVDs", 39.99, 20),
("Avengers: Infinity War", "DVDs", 14.99, 10),
("The Aristocats", "DVDs", 6.99, 2),
("Dumbo", "DVDs", 10.57, 5),
("Frozen", "DVDs", 14.99, 15),
("A Place Called Freedom", "Books", 11.11, 4),
("The Eye of the Needle", "Books", 11.99, 3),
("A Subtle Murder", "Books", 3.99, 8),
("Amazon Smart Plug", "Smart Home", 19.99, 47),
("Amazon Echo Spot", "Smart Home", 99.99, 89);

SELECT * FROM bamazon.products;