const sqlite3 = require('sqlite3').verbose();

const dbFile = './store.db'; // Adjust the path as needed

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log(`Connected to the database: ${dbFile}`);
  }
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS "accounts" (
        "id" INTEGER NOT NULL UNIQUE,
        "balance" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "street_address" TEXT NOT NULL,
        "zip" INTEGER NOT NULL,
        "contact_name" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        PRIMARY KEY("id" AUTOINCREMENT)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS "items" (
        "id" INTEGER NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" NUMERIC NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS "line_purchases" (
        "id" INTEGER NOT NULL UNIQUE,
        "item_id" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL,
        "purchase_order_id" INTEGER NOT NULL,
        FOREIGN KEY("item_id") REFERENCES "items"("id"),
        FOREIGN KEY("purchase_order_id") REFERENCES "purchase_orders"("id"),
        PRIMARY KEY("id" AUTOINCREMENT)
    )
  `);

  // db.run(`
  // INSERT INTO items (id, name, description, price) VALUES
  // (1, 'CPU', 'Runs processes on computer', 249.99),
  // (2, 'RAM', 'Stores temporary data', 99.99),
  // (3, 'Motherboard', 'Connects all components', 149.99),
  // (4, 'GPU', 'Renders graphics', 399.99),
  // (5, 'PSU', 'Powers the computer', 79.99),
  // (6, 'Case', 'Holds all components', 59.99),
  // (7, 'SSD', 'Stores data', 129.99),
  // (8, 'HDD', 'Stores data', 79.99),
  // (9, 'Monitor', 'Displays output', 199.99),
  // (10, 'Keyboard', 'Inputs data', 49.99),
  // (11, 'Mouse', 'Inputs data', 29.99),
  // (12, 'Headset', 'Outputs audio', 79.99),
  // (13, 'Speakers', 'Outputs audio', 49.99),
  // (14, 'Webcam', 'Inputs video', 39.99),
  // (15, 'Microphone', 'Inputs audio', 29.99),
  // (16, 'Printer', 'Outputs data', 99.99),
  // (17, 'Scanner', 'Inputs data', 79.99),
  // (18, 'Router', 'Routes connections in network', 59.99),
  // (19, 'Switch', 'Manages connected network components', 49.99),
  // (20, 'Hub', 'Connects network components', 39.99),
  // (21, 'Firewall', 'Protects network', 199.99),
  // (22, 'UPS', 'Provides backup power', 149.99),
  // (23, 'Surge Protector', 'Protects from power surges', 29.99),
  // (24, 'Ethernet Cable', 'Connects compatible Ethernet components', 9.99),
  // (25, 'HDMI Cable', 'Connects compatible HDMI components', 14.99),
  // (26, 'Optical Cable', 'Connects compatible optical components', 19.99),
  // (27, 'USB Cable', 'Connects compatible USB components', 4.99),
  // (28, 'VGA Cable', 'Connects compatible VGA components', 9.99),
  // (29, 'DVI Cable', 'Connects compatible DVI components', 14.99),
  // (30, 'DisplayPort Cable', 'Connects compatible DisplayPort components', 19.99),
  // (31, 'Thunderbolt Cable', 'Connects compatible Thunderbolt components', 24.99),
  // (32, 'Serial Cable', 'Connects compatible serial components', 9.99);
  // `);

  db.run(`
    CREATE TABLE IF NOT EXISTS "purchase_orders" (
        "id" INTEGER NOT NULL UNIQUE,
        "account_id" INTEGER NOT NULL,
        "date" TEXT NOT NULL,
        "paid" BOOLEAN NOT NULL,
        FOREIGN KEY("account_id") REFERENCES "accounts"("id"),
        PRIMARY KEY("id" AUTOINCREMENT)
    )
  `);


  console.log('Database schema created.');
});

db.close();
