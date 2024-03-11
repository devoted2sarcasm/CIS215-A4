const sqlite3 = require('sqlite3').verbose();
const dbFile = 'store.db'; // Adjust the filename as needed
const db = new sqlite3.Database(dbFile);

// Retrieve a list of all accounts
const getAccountNames = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT name FROM accounts';
        console.log('Fetching accounts...');
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching accounts:', err);
                reject(err);
            } else {
                console.log('Accounts retrieved successfully.');
                console.log('accounts retrieved: ' + rows)
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


// Enter a new purchase order with one or more line purchases
const enterPurchaseOrder = (accountId, date, linePurchases) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Begin a transaction for atomicity
            db.run('BEGIN TRANSACTION');

            // Insert a new purchase order
            const insertPurchaseOrderQuery = 'INSERT INTO purchase_orders (account_id, date) VALUES (?, ?)';
            console.log('Entering a new purchase order...');
            db.run(insertPurchaseOrderQuery, [accountId, date], function (err) {
                if (err) {
                    console.error('Error entering a new purchase order:', err);
                    reject(err);
                    return db.run('ROLLBACK');
                }

                const purchaseOrderId = this.lastID;

                // Insert line purchases for the new purchase order
                const insertLinePurchasesQuery = 'INSERT INTO line_purchases (item_id, quantity, purchase_order_id) VALUES (?, ?, ?)';
                console.log('Entering line purchases...');
                linePurchases.forEach((linePurchase) => {
                    db.run(insertLinePurchasesQuery, [linePurchase.item_id, linePurchase.quantity, purchaseOrderId], (err) => {
                        if (err) {
                            console.error('Error entering line purchase:', err);
                            reject(err);
                            return db.run('ROLLBACK');
                        }
                    });
                });

                // Commit the transaction
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        reject(err);
                    } else {
                        console.log('New purchase order entered successfully.');
                        resolve({ id: purchaseOrderId, account_id: accountId, date, linePurchases });
                    }
                });
            });
        });
    });
};

module.exports = {
    getAccountNames,
    getItems,
    getPurchaseOrdersForAccount,
    addAccount,
    enterPurchaseOrder,
};
