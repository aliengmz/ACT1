document.addEventListener('DOMContentLoaded', async function () {
    // Check if the user is logged in and update the navigation bar accordingly
    const authSection = document.getElementById('auth-section');
    const loginLink = document.getElementById('login-link');
    const userGreeting = document.getElementById('user-greeting');
    const usernameSpan = document.getElementById('username');

    try {
        const response = await fetch('http://localhost:3000/check-auth', {method: 'GET', credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            if (data.loggedIn) {
                // User is logged in
                console.log('User is logged in');
                loginLink.style.display = 'none'; // Hide the login link
                userGreeting.style.display = 'inline'; // Show the greeting
                usernameSpan.textContent = data.username; // Display the username
            } else {
                // User is not logged in
                loginLink.style.display = 'inline'; // Show the login link
                userGreeting.style.display = 'none'; // Hide the greeting
                usernameSpan.textContent = ''; // Clear the username
            }
        } else {
            // User not logged in
            console.log('User is logged in');
            loginLink.style.display = 'inline-block';
            userGreeting.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        loginLink.style.display = 'inline-block';
        userGreeting.style.display = 'none';
    }
});

// Function to navigate to index.html when clicking on the logo
function goToIndex() {
    window.location.href = 'index.html';
}

// Add click listener to the logo
document.addEventListener('DOMContentLoaded', function () {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', goToIndex);
    }
});

// Add active state to About section
document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.about-section');

    sections.forEach(section => {
        section.addEventListener('click', function () {
            sections.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// Add hover effect to service items
document.querySelectorAll('.service-item').forEach(item => {
    item.addEventListener('mouseover', () => {
        const img = item.querySelector('.service-image img');
        img.style.transform = 'scale(1.1)';
        item.style.transform = 'translateY(-10px)';
    });

    item.addEventListener('mouseout', () => {
        const img = item.querySelector('.service-image img');
        img.style.transform = 'scale(1)';
        item.style.transform = 'translateY(0)';
    });
});
