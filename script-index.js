document.addEventListener('DOMContentLoaded', () => {
    const newAccountBtn = document.getElementById('newAccountBtn');
    const newOrder = document.getElementById('newOrder');
    const reviewOrders = document.getElementById('reviewOrders');
    const mainContent = document.getElementById('main-content');
    const title = document.getElementById('title');

    // ADD ACCOUNT
    /////////////////////////////////////////////////

    newAccountBtn.addEventListener('click', () => {
        // Handle the click event for the "New Account" button
        title.innerHTML = 'Create a New Account';
        mainContent.innerHTML = `
            <form id="newAccountForm">
                <label for="companyName">Company Name:</label>
                <input type="text" id="companyName" name="companyName" required autofocus>

                <label for="streetAddress">Street Address:</label>
                <input type="text" id="streetAddress" name="streetAddress" required>

                <label for="zipCode">Zip Code:</label>
                <input type="text" id="zipCode" name="zipCode" required>

                <label for="contactName">Contact Name:</label>
                <input type="text" id="contactName" name="contactName" required>

                <label for="contactPhone">Contact Phone:</label>
                <input type="tel" id="contactPhone" name="contactPhone" required>

                <label for="contactEmail">Contact Email:</label>
                <input type="email" id="contactEmail" name="contactEmail" required>

                <button type="submit">Create Account</button>
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
                    // Initialize content with form for the specified number of items and account selection
                    let formContent = `
                        <div>
                            <label for="accountSelect">Select Account:</label>
                            <select id="accountSelect" name="accountSelect" onchange="updateTitle(this)">
                                ${accounts.map(account => `<option value="${account.id}">${account.companyName}</option>`).join('')}
                            </select>
                        </div>
                    `;
                    for (let i = 1; i <= itemsCount; i++) {
                        formContent += `
                            <div class="purchase-line" id="purchaseLine${i}">
                                <label for="itemSelect${i}">Item:</label>
                                <select id="itemSelect${i}" name="itemSelect" required>
                                    <!-- Options for items will be dynamically populated -->
                                </select>

                                <label for="quantity${i}">Quantity:</label>
                                <input type="number" id="quantity${i}" name="quantity" min="1" value="1" required onchange="updateTotalPrice(${i})">

                                <label for="totalPrice${i}">Total Price:</label>
                                <span id="totalPrice${i}">0.00</span>
                            </div>
                        `;
                    }

                    formContent += `<button type="submit">Submit Purchase Order</button>`;
                    mainContent.innerHTML = formContent;

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

    reviewOrders.addEventListener('click', () => {
        // Handle the click event for the "Review Purchase Orders" button
        mainContent.innerHTML = '<p>Form for reviewing purchase orders will go here.</p>';
    });
});

function updateTotalPrice(lineNumber) {
    const quantityInput = document.getElementById(`quantity${lineNumber}`);
    const totalPriceSpan = document.getElementById(`totalPrice${lineNumber}`);
    const itemPrice = 19.99;  // Replace with the actual price of the selected item

    const quantity = parseInt(quantityInput.value, 10);
    const total = (isNaN(quantity) || quantity < 1) ? 0 : (quantity * itemPrice).toFixed(2);
    
    totalPriceSpan.textContent = total;
}

function updateTitle(select) {
    const selectedOption = select.options[select.selectedIndex];
    title.innerHTML = `Create a New Purchase Order for ${selectedOption.text}`;
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
            itemSelect.add(option);
        });
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}
