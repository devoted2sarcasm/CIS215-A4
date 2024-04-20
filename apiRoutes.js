const express = require('express');
const router = express.Router();
const dbOperations = require('./dbOperations');

router.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Authenticating user...(apiRoutes.js)');
        const isAuthenticated = await dbOperations.authenticateUser(username, password);
        if (isAuthenticated) {
            res.status(200).json({ message: 'Authentication successful' });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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

router.get('/view-purchase-orders', async (req, res) => {
    const accountId = req.query.accountId;

    try {
        console.log(`Fetching purchase orders for account ID: ${accountId}`);
        const purchaseOrders = await dbOperations.getPurchaseOrders(accountId);
        console.log('Purchase orders retrieved successfully.', purchaseOrders);
        res.json(purchaseOrders);
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/accounts', async (req, res) => {
    console.log(req.body);
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

router.get('/item-updates', async (req, res) => {
    try {
        console.log('Fetching item updates...');
        const itemUpdates = await dbOperations.getItemUpdates();
        console.log('Item updates retrieved successfully.');
        res.json(itemUpdates);
    } catch (error) {
        console.error('Error fetching item updates:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/purchase-orders', async (req, res) => {
    const { accountId, date, total } = req.body;

    try {
        console.log('Making a new purchase order...');
        const purchaseOrderId = await dbOperations.enterPurchaseOrder(accountId, date, total);
        console.log('New purchase order made successfully:', purchaseOrderId);
        res.json({ id: purchaseOrderId }); // Send the ID of the new purchase order in the response
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

router.post('/line-purchases', async (req, res) => {
    const { itemId, quantity, purchaseOrderId } = req.body;

    try {
        console.log('Adding a new line purchase...');
        const newLinePurchase = await dbOperations.addLinePurchase(itemId, quantity, purchaseOrderId);
        console.log('New line purchase added successfully.');
        res.json(newLinePurchase);
    } catch (error) {
        console.error('Error adding a new line purchase:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/view-line-purchases/:purchaseOrderId', async (req, res) => {
    const purchaseOrderId = req.params.purchaseOrderId;

    try {
        console.log(`Fetching line purchases for purchase order ID: ${purchaseOrderId}`);
        const linePurchases = await dbOperations.getLinePurchases(purchaseOrderId);
        console.log('Line purchases retrieved successfully.', linePurchases);
        res.json(linePurchases);
    } catch (error) {
        console.error('Error fetching line purchases:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/company-info/:purchaseOrderId', async (req, res) => {
    const purchaseOrderId = req.params.purchaseOrderId;

    try {
        console.log(`Fetching company information for purchase order ID: ${purchaseOrderId}`);
        const companyInfo = await dbOperations.getCompanyInfo(purchaseOrderId);
        console.log('Company information retrieved successfully.', companyInfo);
        res.json(companyInfo);
    } catch (error) {
        console.error('Error fetching company information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/execute-query', async (req, res) => {
    const { query } = req.body;

    try {
        const result = await dbOperations.executeQuery(query);
        res.json(result);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});    


module.exports = router;
