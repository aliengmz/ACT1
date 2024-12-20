const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000'], // Replace with your frontend origins
    credentials: true // Allow cookies to be sent
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session Configuration
app.use(session({
    secret: 'your-secret-key', // Replace with a strong, randomly generated secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Replace with your MySQL username
    password: '',      // Replace with your MySQL password
    database: 'userdatabase' // Replace with your database name
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Signup Route
app.post('/signup', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match.');
    }

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error('Error inserting user into the database:', err);
            return res.status(500).send('Error inserting user into the database.');
        }
        res.status(200).json({ message: 'User registered successfully!' });
    });
});

// Login Route
// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Please provide both email and password.');
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('An error occurred while querying the database.');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid email or password.');
        }

        const user = results[0];
        if (user.password !== password) {
            return res.status(401).send('Invalid email or password.');
        }

        // Set session
        req.session.userId = user.id;

        // Send back username along with success message
        res.status(200).json({ 
            message: 'Login successful!',
            username: user.username,  // Add this line to include the username
            userId: user.id
        });
    });
});

// Check Auth State Route
app.get('/check-auth', (req, res) => {
    console.log('Session data:', req.session); // Log session data to ensure it's present
    if (req.session && req.session.userId) {
        const query = 'SELECT username FROM users WHERE id = ?';
        db.query(query, [req.session.userId], (err, results) => {
            if (err) {
                console.error('Error fetching user data:', err);
                return res.status(500).json({ loggedIn: false });
            }
            if (results.length > 0) {
                return res.status(200).json({
                    loggedIn: true,
                    username: results[0].username // Return the username if found
                });
            } else {
                return res.status(404).json({ loggedIn: false });
            }
        });
    } else {
        res.status(200).json({ loggedIn: false }); // If the user is not logged in, return loggedIn: false
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out.');
        }
        res.status(200).send('Logout successful.');
    });
});

// Save Cart Data Route
app.post('/cart', (req, res) => {
    const { userId, cartItems } = req.body;

    if (!userId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).send('Invalid or empty cart data.');
    }

    const query = 'INSERT INTO carts (user_id, product_name, product_price) VALUES ?';
    const values = cartItems.map(item => [userId, item.name, item.price]);

    db.query(query, [values], (err) => {
        if (err) {
            console.error('Error saving cart data:', err);
            return res.status(500).send('Error saving cart data.');
        }
        res.status(200).send('Cart saved successfully.');
    });
});

// Retrieve Cart Data Route
app.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = 'SELECT product_name, product_price FROM carts WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving cart data:', err);
            return res.status(500).send('Error retrieving cart data.');
        }
        res.status(200).json(results);
    });
});

// Save Product Data Route
app.post('/sell', (req, res) => {
    const { productName, productModel, price, description } = req.body;

    if (!productName || !productModel || !price || !description) {
        return res.status(400).send('All fields are required.');
    }

    const query = 'INSERT INTO products (product_name, product_model, price, description) VALUES (?, ?, ?, ?)';
    db.query(query, [productName, productModel, price, description], (err, result) => {
        if (err) {
            console.error('Error inserting product into the database:', err);
            return res.status(500).send('Error inserting product into the database.');
        }
        res.status(200).json({ message: 'Product listed successfully!' });
    });
});

// Retrieve Products Route for Marketplace
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving products:', err);
            return res.status(500).send('Error retrieving products.');
        }
        res.status(200).json(results);
    });
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
