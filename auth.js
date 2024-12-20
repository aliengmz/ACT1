// Function to check if user is logged in
function checkAuthState() {
    fetch('http://localhost:3000/check-auth', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const loginLink = document.getElementById('login-link');
        const userGreeting = document.getElementById('user-greeting');
        const usernameSpan = document.getElementById('username');

        if (data.loggedIn) {
            // User is logged in
            console.log('User is logged in');
            loginLink.style.display = 'none';
            userGreeting.style.display = 'inline';
            usernameSpan.textContent = data.username;
        } else {
            // User is not logged in
            console.log('User is not logged in');
            loginLink.style.display = 'inline';
            userGreeting.style.display = 'none';
            usernameSpan.textContent = '';
        }
    })
    .catch(error => {
        console.error('Error checking auth state:', error);
    });
}

// Check auth state when page loads
document.addEventListener('DOMContentLoaded', checkAuthState);