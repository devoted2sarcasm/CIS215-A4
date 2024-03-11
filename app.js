/* DB Schema
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" INTEGER NOT NULL UNIQUE,
    "balance" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "street address" TEXT NOT NULL,
    "zip" INTEGER NOT NULL,
    "contact name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TABLE IF NOT EXISTS "items" (
    "id" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" NUMERIC NOT NULL
)

CREATE TABLE IF NOT EXISTS "line_purchases" (
    "id" INTEGER NOT NULL UNIQUE,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchase_order_id" INTEGER NOT NULL,
    FOREIGN KEY("item_id") REFERENCES "items"("id"),
    FOREIGN KEY("purchase_order_id") REFERENCES "purchase_orders"("id"),
    PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TABLE IF NOT EXISTS "purchase_orders" (
    "id" INTEGER NOT NULL UNIQUE,
    "account_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL,
    FOREIGN KEY("account_id") REFERENCES "accounts"("id"),
    PRIMARY KEY("id" AUTOINCREMENT)
)

*/

const express = require('express');
const cors = require('cors');
const path = require('path');
const dbOperations = require('./dbOperations');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const apiRoutes = require('./apiRoutes');
const createDatabase = require('./createDatabase');

const app = express();
const port = 8888;
const dbFile = path.join(__dirname, 'store.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log(`Connected to the database: ${dbFile}`);
    }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('C:\NCMC\CIS215-A4\CIS215-A4'));
app.use(express.json());
app.use('/', apiRoutes);

// Serve style.css with correct MIME type
app.get('/style.css', (req, res) => {
    res.header('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, '/style.css'));
});

// Serve script-index.js with correct MIME type
app.get('/script-index.js', (req, res) => {
    res.header('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, '/script-index.js'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});