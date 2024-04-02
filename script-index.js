document.addEventListener('DOMContentLoaded', () => {
    const newAccountBtn = document.getElementById('newAccountBtn');
    const newOrder = document.getElementById('newOrder');
    const reviewOrders = document.getElementById('reviewOrders');
    const xqueryBtn = document.getElementById('xqueryBtn');
    const mainContent = document.getElementById('main-content');
    const title = document.getElementById('title');

    // ADD ACCOUNT
    /////////////////////////////////////////////////

    newAccountBtn.addEventListener('click', () => {
        // Handle the click event for the "New Account" button
        title.innerHTML = 'Create a New Account';
        mainContent.innerHTML = `
    <form id="newAccountForm">
        <table>
            <tr>
                <td><label for="companyName">Company Name:</label></td>
                <td><input type="text" id="companyName" name="companyName" required autofocus></td>
            </tr>
            <tr>
                <td><label for="streetAddress">Street Address:</label></td>
                <td><input type="text" id="streetAddress" name="streetAddress" required></td>
            </tr>
            <tr>
                <td><label for="zipCode">Zip Code:</label></td>
                <td><input type="text" id="zipCode" name="zipCode" required></td>
            </tr>
            <tr>
                <td><label for="contactName">Contact Name:</label></td>
                <td><input type="text" id="contactName" name="contactName" required></td>
            </tr>
            <tr>
                <td><label for="contactPhone">Contact Phone:</label></td>
                <td><input type="tel" id="contactPhone" name="contactPhone" required></td>
            </tr>
            <tr>
                <td><label for="contactEmail">Contact Email:</label></td>
                <td><input type="email" id="contactEmail" name="contactEmail" required></td>
            </tr>
            <tr>
                <td colspan="2" style="text-align:center;">
                    <button class="button" type="submit">Create Account</button>
                </td>
            </tr>
        </table>
    </form>
`;

        const newAccountForm = document.getElementById('newAccountForm');
        newAccountForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Retrieve form data
            const formObject = {
                companyName: document.getElementById('companyName').value,
                streetAddress: document.getElementById('streetAddress').value,
                zipCode: document.getElementById('zipCode').value,
                contactName: document.getElementById('contactName').value,
                contactPhone: document.getElementById('contactPhone').value,
                contactEmail: document.getElementById('contactEmail').value,
            };

            console.log('New account form data:', formObject);

            // Make a POST request to create a new account
            try {
                const response = await fetch('/accounts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formObject),
                });

                if (response.ok) {
                    console.log('New account created successfully.');
                    window.location.href = '/';
                } else {
                    console.error('Failed to create a new account.');
                }
            } catch (error) {
                console.error('Error making POST request:', error);
            }
        });
    });

    // NEW PURCHASE ORDER
    //////////////////////////////////////////////////////

    newOrder.addEventListener('click', async () => {
        try {
            // Fetch accounts
            const accountsResponse = await fetch('/accountNames');
            if (!accountsResponse.ok) {
                throw new Error(`Failed to fetch accounts: ${accountsResponse.status} ${accountsResponse.statusText}`);
            }
            const accounts = await accountsResponse.json();

            if (accounts && accounts.length > 0) {
                // Prompt user for the number of items
                const itemsCount = prompt('How many items do you want to add to the purchase order?');

                if (itemsCount && !isNaN(itemsCount) && itemsCount > 0) {
                    //change title
                    title.innerHTML = 'Create a New Purchase Order';
                    // Initialize content with form for the specified number of items and account selection
                    let formContent = `
                        <table>
                            <tr>
                                <td colspan="3" style="text-align: center;">
                                    <label for="accountSelect">Select Account:</label>
                                    <select class="account-select" id="accountSelect" name="accountSelect" onchange="updateTitle(this)" style="width: 100%;" value="1">
                                        <option value="">Select Account</option> <!-- Empty option -->
                                        ${accounts.map(account => `<option value="${account.id}">${account.name}</option>`).join('')}
                                    </select>


                                    <input type="hidden" id="accountId" name="accountId" value=""> <!-- Hidden input field for storing accountId -->
                                </td>
                            </tr>
                    `;


                    for (let i = 1; i <= itemsCount; i++) {
                        formContent += `
                            <tr>
                                <td>
                                    <label for="itemSelect${i}">Item:</label>
                                    <select id="itemSelect${i}" name="itemSelect" required style="width: 100%;">
                                        <!-- Options for items will be dynamically populated -->
                                    </select>
                                </td>
                                <td>
                                    <label for="quantity${i}">Quantity:</label>
                                    <input type="number" id="quantity${i}" name="quantity" min="1" value="1" required onchange="updateTotalPrice(${i})" style="width: 100%;">
                                </td>
                                <td>
                                    <label for="totalPrice${i}">Total Price:</label>
                                    <span class="price" id="totalPrice${i}">0.00</span>
                                </td>
                            </tr>
                        `;
                    }

                    formContent += `
                            <tr>
                                <td colspan="3" style="text-align: center;">
                                    <button class="button-submitPO" type="submit" id="submitPO">Submit Purchase Order</button>
                                </td>
                            </tr>
                        </table>
                    `;

                    mainContent.innerHTML = formContent;


                    const submitPO = document.getElementById('submitPO');

                    submitPO.addEventListener('click', async () => {
                        // 1. Retrieve the selected account ID from the hidden field
                        const accountId = document.getElementById('accountId').value; // hidden field with id "accountId"
                        
                        // 2. Generate the current date
                        const date = new Date().toISOString().split('T')[0];
                        
                        // 3. Calculate the total purchase order price
                        let totalPrice = 0;
                        for (let i = 1; i <= itemsCount; i++) {
                            const totalPriceSpan = document.getElementById(`totalPrice${i}`);
                            totalPrice += parseFloat(totalPriceSpan.textContent);
                        }
                        console.log('Total price:', totalPrice.toFixed(2));
                        
                        // 4. Submit the purchase order to the server
                        const purchaseOrder = {
                            accountId,
                            date,
                            total: totalPrice,
                            paid: 0 // Assuming paid is set to 0 by default
                        };
                    
                        console.log('Purchase order:', purchaseOrder);
                        
                        try {
                            const purchaseOrderResponse = await fetch('/purchase-orders', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(purchaseOrder),
                            });
                        
                            if (purchaseOrderResponse.ok) {
                                console.log('New purchase order created successfully.');
                                const purchaseOrderData = await purchaseOrderResponse.json();
                        
                                // 5. Upon successful creation of the purchase order, submit each line purchase
                                for (let i = 1; i <= itemsCount; i++) {
                                    const itemSelect = document.getElementById(`itemSelect${i}`);
                                    const quantity = document.getElementById(`quantity${i}`);
                                    const itemId = itemSelect.options[itemSelect.selectedIndex].getAttribute('data-item-id');
                                    const qty = quantity.value;
                        
                                    const linePurchaseData = {
                                        itemId,
                                        quantity: qty,
                                        purchaseOrderId: purchaseOrderData.id, // Use the ID of the newly created purchase order
                                    };
                        
                                    try {
                                        const linePurchaseResponse = await fetch('/line-purchases', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(linePurchaseData),
                                        });
                        
                                        if (linePurchaseResponse.ok) {
                                            console.log('New line purchase created successfully.');
                                        } else {
                                            console.error('Failed to create a new line purchase.');
                                        }
                                    } catch (error) {
                                        console.error('Error making line purchase POST request:', error);
                                    }
                                }
                                
                                window.location.href = '/';
                            } else {
                                console.error('Failed to create a new purchase order.');
                            }
                        } catch (error) {
                            console.error('Error making purchase order POST request:', error);
                        }
                    });
                
                    // Populate item options in the dropdowns
                    for (let i = 1; i <= itemsCount; i++) {
                        const itemSelect = document.getElementById(`itemSelect${i}`);
                        await populateItems(itemSelect);
                    }
                } else {
                    alert('Invalid input. Please enter a valid number greater than 0.');
                }
            } else {
                alert('No accounts available. Please create an account first.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });

    /////////////////////////////////////////////////////////
    // REVIEW PURCHASE ORDERS

    reviewOrders.addEventListener('click', async () => {
        try {
            // Fetch accounts
            const accountsResponse = await fetch('/accountNames');
            if (!accountsResponse.ok) {
                throw new Error(`Failed to fetch accounts: ${accountsResponse.status} ${accountsResponse.statusText}`);
            }
            const accounts = await accountsResponse.json();
    
            if (accounts && accounts.length > 0) {
                // Change title
                title.innerHTML = 'Review Purchase Orders';
    
                // Initialize content with account selection dropdown
                let formContent = `
                    <table>
                        <tr>
                            <td colspan="3" style="text-align: center;">
                                <label for="accountSelect">Select Account:</label>
                                <select class="account-select" id="accountSelect" name="accountSelect" onchange="fetchPurchaseOrders(),reviewTitle(this)" style="width: 100%;" value="1">
                                    <option value="">Select Account</option> <!-- Empty option -->
                                    ${accounts.map(account => `<option value="${account.id}">${account.name}</option>`).join('')}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <table id="purchaseOrdersTable">
                                    <thead>
                                        <tr>
                                            <th>Purchase Order ID</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody id="purchaseOrdersBody"></tbody>
                                </table>
                            </td>
                        </tr>
                    </table>
                `;
    
                // Update form content
                mainContent.innerHTML = formContent;
            } else {
                console.error('No accounts found.');
            }
        } catch (error) {
            console.error('Error loading review page:', error);
        }
    });


        // execute query
    /////////////////////////////////////////////////
    xqueryBtn.addEventListener('click', async () => {
        const queryMessage = prompt('Enter your SQL query');
        try {
            const response = await fetch('/execute-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: queryMessage }),
            });

            if (response.ok) {
                const queryResults = await response.json();
                console.log('Query results:', queryResults);
                mainContent.innerHTML = `<div id="queryResults" class="query-results">
                <p>Query executed successfully:</p>
                <p>${queryMessage}</p>
                <p>Results:</p>
                <pre>${JSON.stringify(queryResults, null, 2)}</pre>
            </div>
            `;
            } else {
                console.error('Failed to execute query.');
            }
        }
        catch (error) {
            console.error('Error executing query:', error);
        }
    });
});




async function updateTotalPrice(lineNumber) {
    try {
        const quantityInput = document.getElementById(`quantity${lineNumber}`);
        const totalPriceSpan = document.getElementById(`totalPrice${lineNumber}`);
        const itemSelect = document.getElementById(`itemSelect${lineNumber}`);
        const selectedOption = itemSelect.options[itemSelect.selectedIndex];

        const itemId = selectedOption.getAttribute('data-item-id');
        const itemName = selectedOption.text; // Retrieve the text of the selected option
        const itemPrice = parseFloat(selectedOption.getAttribute('data-item-price'));

        const quantity = parseInt(quantityInput.value, 10);
        const total = (isNaN(quantity) || quantity < 1) ? 0 : (quantity * itemPrice).toFixed(2);
        totalPriceSpan.textContent = total;

        console.log(`Item ${lineNumber}: ${itemName}, ID: ${itemId}`); // Log the item number, name, and itemId of the selected item
    } catch (error) {
        console.error('Error updating total price:', error);
    }
    console.log(`Total price updated for item ${lineNumber}`);
}


function updateTitle(select) {
    console.log("Update title function called");
    const selectedOption = select.options[select.selectedIndex];
    console.log("Selected option:", selectedOption);
    title.innerHTML = `Create a New Purchase Order for ${selectedOption.text}`;

    // Update the hidden input field with the selected account ID
    const accountIdInput = document.getElementById('accountId');
    accountIdInput.value = selectedOption.value;
    console.log("Account is now:", accountIdInput.value);
}

function reviewTitle(select) {
    console.log("Review title function called");
    const selectedOption = select.options[select.selectedIndex];
    console.log("Selected option:", selectedOption);
    title.innerHTML = `Review Purchase Orders for ${selectedOption.text}`;

    // Update the hidden input field with the selected account ID
    const accountIdInput = document.getElementById('accountId');
    accountIdInput.value = selectedOption.value;
    console.log("Account is now:", accountIdInput.value);
}



function updateItemOptions(lineNumber) {
    const itemSelect = document.getElementById(`itemSelect${lineNumber}`);
    populateItems(itemSelect);
}

async function populateItems(itemSelect) {
    try {
        const itemsResponse = await fetch('/items');  // Assuming you have an endpoint for fetching items
        if (!itemsResponse.ok) {
            throw new Error(`Failed to fetch items: ${itemsResponse.status} ${itemsResponse.statusText}`);
        }
        const items = await itemsResponse.json();

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.text = item.name;
            option.setAttribute('data-item-id', item.id); // Set item ID as custom attribute
            option.setAttribute('data-item-price', item.price); // Set item price as custom attribute
            itemSelect.add(option);
        });
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

async function fetchPurchaseOrders() {
    const accountId = document.getElementById('accountSelect').value;

    // Fetch purchase orders for the selected account
    try {
        const response = await fetch(`/view-purchase-orders?accountId=${accountId}`);
        if (response.ok) {
            const purchaseOrders = await response.json();
            populatePurchaseOrdersTable(purchaseOrders);
        } else {
            console.error('Failed to fetch purchase orders:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
    }
}

function populatePurchaseOrdersTable(purchaseOrders) {
    const tableBody = document.getElementById('purchaseOrdersBody');
    tableBody.innerHTML = '';

    purchaseOrders.forEach(purchaseOrder => {
        const row = document.createElement('tr');
        const paidStatus = purchaseOrder.paid ? 'Paid' : 'Unpaid';
        row.innerHTML = `
            <td>${purchaseOrder.id}</td>
            <td>${purchaseOrder.date}</td>
            <td>${purchaseOrder.total.toFixed(2)}</td>
            <td>${paidStatus}</td>
            <td>
                <button onclick="viewLinePurchases(${purchaseOrder.id})">Print Invoice</button>
            </td>
          
        `;
        tableBody.appendChild(row);
    });
}

async function viewLinePurchases(purchaseOrderId) {
    console.log('Starting viewLinePurchases function, purchaseOrderId:', purchaseOrderId);
    try {
        const response = await fetch(`/view-line-purchases/${purchaseOrderId}`);
        if (response.ok) {
            const linePurchases = await response.json();
            console.log('Line purchases retrieved successfully.', linePurchases);

            // Fetch company information
            const companyInfoResponse = await fetch(`/company-info/${purchaseOrderId}`);
            if (companyInfoResponse.ok) {
                const companyInfo = await companyInfoResponse.json();
                console.log('Company information retrieved successfully.', companyInfo);

                // Open a new window
                const newWindow = window.open('', '_blank');
                newWindow.document.write('<html><head><title>Invoice</title></head><body>');

                // Print Invoice ID
                newWindow.document.write(`<h1>Invoice: ${purchaseOrderId}</h1>`);

                // Print company contact, name, and address
                newWindow.document.write(`<p>Contact: ${companyInfo.contactName}</p>`);
                newWindow.document.write(`<p>Company: ${companyInfo.companyName}</p>`);
                newWindow.document.write(`<p>Address: ${companyInfo.streetAddress}, ${companyInfo.zipCode}</p>`);

                // Print line purchases table
                newWindow.document.write('<table border="1">');
                newWindow.document.write('<tr><th>Item Number</th><th>Item Name</th><th>Description</th><th>Quantity Ordered</th><th>Item Price</th><th>Total Price</th></tr>');
                let total = 0;
                linePurchases.forEach(linePurchase => {
                    newWindow.document.write(`<tr><td>${linePurchase.id}</td><td>${linePurchase.name}</td><td>${linePurchase.description}</td><td>${linePurchase.quantity}</td><td>${linePurchase.price}</td><td>${linePurchase.total.toFixed(2)}</td></tr>`);
                    total += linePurchase.total;
                });
                total = total.toFixed(2); // Round total to 2 decimal places
                newWindow.document.write(`<tr><td colspan="5">Invoice Total:</td><td>${total}</td></tr>`);
                newWindow.document.write('</table>');

                // Print payment message
                newWindow.document.write('<p>Please remit payment at your earliest convenience.</p>');

                newWindow.document.write('</body></html>');
                newWindow.document.close();
            } else {
                console.error('Failed to fetch company information:', companyInfoResponse.statusText);
            }
        } else {
            console.error('Failed to fetch line purchases:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching line purchases:', error);
    }
}

