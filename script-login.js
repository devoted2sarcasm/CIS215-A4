document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Define an async function to handle the form submission
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log('Authenticating with username:', username, 'and password:', password);

        try {
            console.log('Authenticating user...(script-login.js) before fetch');
            const response = await fetch('/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Authenticating user...(script-login.js) after fetch');

            if (response.ok) {
                window.location.href = '/index';
            } else {
                alert('Invalid username or password. Please try again.');
            }
        } catch (error) {
            console.error('Error authenticating user:', error);
            alert('An error occurred while authenticating. Please try again later.');
        }
    };

    // Attach the async function to the form submit event
    loginForm.addEventListener('submit', handleFormSubmit);
});
