const sqlite3 = require('sqlite3').verbose();
const dbFile = 'store.db'; // Adjust the filename as needed
const db = new sqlite3.Database(dbFile);


// authenticate user
function authenticateUser(username, password) {
    return new Promise((resolve, reject) => {
        console.log('Authenticating user...(dbOps.js)');
        const sql = 'SELECT * FROM users WHERE username = ? and password = ?';
        db.get(sql, [username, password], (err, row) => {
            if (err) {
                reject(err);
                console.log('Error authenticating user:', err);
            } else {
                //resolve(row !== undefined);
                resolve(row);
            }
        });
    });
}

// Retrieve a list of all accounts
const getAccountNames = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT name, id FROM accounts';
        console.log('Fetching accounts...');
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching accounts:', err);
                reject(err);
            } else {
                console.log('Accounts retrieved successfully.');
                console.log('accounts retrieved: ' + rows.name, rows.id);
                resolve(rows);
            }
        });
    });
};

// Retrieve a list of all items
const getItems = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM items';
        console.log('Fetching items...');
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching items:', err);
                reject(err);
            } else {
                console.log('Items retrieved successfully.');
                resolve(rows);
            }
        });
    });
};

// Retrieve a list of all purchase orders for one account
const getPurchaseOrdersForAccount = (accountId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM purchase_orders WHERE account_id = ?';
        console.log(`Fetching purchase orders for account ID: ${accountId}`);
        db.all(query, [accountId], (err, rows) => {
            if (err) {
                console.error('Error fetching purchase orders:', err);
                reject(err);
            } else {
                console.log('Purchase orders retrieved successfully.');
                resolve(rows);
            }
        });
    });
};

// Add a new account with an initial balance of zero
const addAccount = (name, streetAddress, zip, contactName, phone, email) => {
  return new Promise((resolve, reject) => {
      const query = 'INSERT INTO accounts (balance, name, street_address, zip, contact_name, phone, email) VALUES (0, ?, ?, ?, ?, ?, ?)';
      console.log('Adding a new account...');
      db.run(query, [name, streetAddress, zip, contactName, phone, email], function (err) {
          if (err) {
              console.error('Error adding a new account:', err);
              reject(err);
          } else {
              console.log(`New account added successfully with ID: ${this.lastID}`);
              resolve({ id: this.lastID, name, balance: 0 });
          }
      });
  });
};

const addLinePurchase = (item_id, quantity, purchase_order_id) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO line_purchases (item_id, quantity, purchase_order_id) VALUES (?, ?, ?)';
        console.log('Adding a new line purchase...');
        db.run(query, [item_id, quantity, purchase_order_id], function (err) {
            if (err) {
                console.error('Error adding a new line purchase:', err);
                reject(err);
            } else {
                console.log(`New line purchase added successfully with ID: ${this.lastID}`);
                resolve({ id: this.lastID, item_id, quantity, purchase_order_id });
            }
        });
    });
};


// Enter a new purchase order with one or more line purchases
const enterPurchaseOrder = (accountId, date, total) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Begin a transaction for atomicity
            db.run('BEGIN TRANSACTION');

            // Insert a new purchase order
            const insertPurchaseOrderQuery = 'INSERT INTO purchase_orders (account_id, date, total, paid) VALUES (?, ?, ?, 0)';
            console.log('Entering a new purchase order...');
            db.run(insertPurchaseOrderQuery, [accountId, date, total], function (err) {
                if (err) {
                    console.error('Error entering a new purchase order:', err);
                    reject(err);
                    return db.run('ROLLBACK');
                }

                const purchaseOrderId = this.lastID;

                // Commit the transaction
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        reject(err);
                    } else {
                        console.log('New purchase order entered successfully.');
                        resolve(purchaseOrderId); // Resolve with the ID of the new purchase order
                    }
                });
            });
        });
    });
};

async function getLinePurchases(purchaseOrderId) {
    console.log('Fetching line purchases for purchase order ID:', purchaseOrderId);
    return new Promise((resolve, reject) => {
        const query = `SELECT line_purchases.id, items.name, items.description, line_purchases.quantity, items.price, (line_purchases.quantity * items.price) AS total 
                        FROM line_purchases 
                        JOIN items ON line_purchases.item_id = items.id 
                        WHERE line_purchases.purchase_order_id = ?`;

        db.all(query, [purchaseOrderId], (err, rows) => {
            if (err) {
                console.error('Error fetching line purchases:', err);
                reject('Failed to fetch line purchases');
            } else {
                console.log('Line purchases retrieved successfully.', rows);
                resolve(rows);
            }
        });
    });
}


const getPurchaseOrders = (accountId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM purchase_orders WHERE account_id = ?', [accountId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
                console.log('purchase orders retrieved for account: ' + rows);
            }
        });
    });
};

async function getCompanyInfo(purchaseOrderId) {
    console.log('Fetching company information for purchase order ID:', purchaseOrderId);
    return new Promise((resolve, reject) => {
        const query = `SELECT accounts.name AS companyName, accounts.street_address AS streetAddress, accounts.zip AS zipCode, 
                      accounts.contact_name AS contactName, accounts.phone AS contactPhone, accounts.email AS contactEmail
                      FROM accounts
                      JOIN purchase_orders ON accounts.id = purchase_orders.account_id
                      WHERE purchase_orders.id = ?`;

        db.get(query, [purchaseOrderId], (err, row) => {
            if (err) {
                console.error('Error fetching company information:', err);
                reject('Failed to fetch company information');
            } else {
                console.log('Company information retrieved successfully.', row);
                resolve(row);
            }
        });
    });
}


async function getAccountIdForPurchaseOrder(purchaseOrderId) {
    return new Promise((resolve, reject) => {
        console.log('Fetching account ID for purchase order ID:', purchaseOrderId);
        const query = 'SELECT account_id FROM purchase_orders WHERE id = ?';
        db.get(query, [purchaseOrderId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.account_id);
            }
        });
    });
}

async function executeQuery(query) {
    console.log('Executing query:', query);
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) {
                console.error('Error executing query:', err);
                reject('Failed to execute query');
            } else {
                console.log('Query executed successfully.', rows);
                resolve(rows);
            }
        });
    });
}


module.exports = {
    authenticateUser,
    getAccountNames,
    getItems,
    getPurchaseOrdersForAccount,
    addAccount,
    enterPurchaseOrder,
    addLinePurchase,
    getLinePurchases,
    getPurchaseOrders,
    getCompanyInfo,
    getAccountIdForPurchaseOrder,
    executeQuery
};
