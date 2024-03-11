const express = require('express');
const router = express.Router();
const dbOperations = require('./dbOperations');

router.get('/accountNames', async (req, res) => {
    try {
        console.log('Fetching accounts... (apiRoutes.js)');
        console.log('fetched accounts: ' + dbOperations.getAccountNames());
        const accounts = await dbOperations.getAccountNames();
        console.log('Accounts retrieved successfully. (apiRoutes.js)');
        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts : ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/purchase-orders/:accountId', async (req, res) => {
    const accountId = req.params.accountId;

    try {
        console.log(`Fetching purchase orders for account ID: ${accountId}`);
        const purchaseOrders = await dbOperations.getPurchaseOrders(accountId);
        console.log('Purchase orders retrieved successfully.');
        res.json(purchaseOrders);
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/accounts', async (req, res) => {
    const { companyName, streetAddress, zipCode, contactName, contactPhone, contactEmail } = req.body;

    try {
        console.log('Adding a new account...');
        const newAccount = await dbOperations.addAccount(companyName, streetAddress, zipCode, contactName, contactPhone, contactEmail);
        console.log('New account added successfully.');
        res.json(newAccount);
    } catch (error) {
        console.error('Error adding a new account:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.post('/purchase-orders', async (req, res) => {
    const { accountId, date, linePurchases } = req.body;

    try {
        console.log('Making a new purchase order...');
        const newPurchaseOrder = await dbOperations.makePurchaseOrder(accountId, date, linePurchases);
        console.log('New purchase order made successfully.');
        res.json(newPurchaseOrder);
    } catch (error) {
        console.error('Error making a new purchase order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/items', async (req, res) => {
    try {
        console.log('Fetching items...');
        const items = await dbOperations.getItems();
        console.log('Items retrieved successfully.');
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
