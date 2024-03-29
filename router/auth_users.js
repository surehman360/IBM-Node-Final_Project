const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Use 'secret' consistently as the variable name for the JWT secret
const secret = process.env.JWT_SECRET || 'fingerprint_customer';

let users = [];

// Basic validation for username
const isValid = (username) => {
    console.log(`Validating username: ${username}`);
    const result = /^[A-Za-z0-9_]{3,30}$/.test(username);
    console.log(`Validation result for "${username}": ${result}`);
    return result;
};

// Check if username and password match any user in the records
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// User login endpoint
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
  
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
  
    // Generate JWT using 'secret'
    const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
  
    res.json({ token });
});

// Endpoint to add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
  
    if (!review) {
        return res.status(400).json({ message: "Review is required." });
    }
  
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }
  
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
  
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }
  
        const username = decoded.username;
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[username] = review;
  
        res.json({ message: "Review added/updated successfully.", book: books[isbn] });
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }

        // Assuming the decoded token includes the username
        const username = decoded.username;

        // Check if the book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Check if the user has a review for this book
        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "Review not found." });
        }

        // Delete the user's review
        delete books[isbn].reviews[username];

        res.json({ message: "Review deleted successfully." });
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
