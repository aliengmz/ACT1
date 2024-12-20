function signUp() {
    const username = document.querySelector('input[name="username"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

    const passwordValid = password.length > 8 && 
                          /[A-Z]/.test(password) && 
                          /[a-z]/.test(password) && 
                          /\d/.test(password) && 
                          /_/.test(password);

    if (!passwordValid) {
        alert('Password must be more than 8 characters, contain a capital letter, a lowercase letter, a number, and an underscore.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
    })
        .then((response) => {
            if (response.ok) {
                return response.json(); // Parse JSON response
            } else {
                return response.text().then((text) => {
                    throw new Error(text); // Handle server errors
                });
            }
        })
        .then((data) => {
            alert(data.message); // Show success message
            window.location.href = 'login.html'; // Redirect to login page
        })
        .catch((error) => {
            alert(`Error: ${error.message}`); // Show error message
            console.error(error);
        });
}  
