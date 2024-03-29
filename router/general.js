const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


    public_users.post("/register", (req, res) => {
        console.log("Received registration request:", req.body); // Debug log
        const { username, password } = req.body;
    
       
    
        // Use the isValid function to check the username
        if (!isValid(username)) {
            console.log(`Username "${username}" is considered invalid.`); // Debug log
            return res.status(400).json({ message: "Invalid username." });
        }
    
        // Check if the username already exists
        const userExists = users.some(user => user.username === username);
        if (userExists) {
            return res.status(409).json({ message: "Username already exists." });
        }
    
        // Add the new user to the users array (with plain text password)
        users.push({ username, password }); // Storing password as plain text
        console.log(`New user registered: ${username}`); // Debug log
        res.status(201).json({ message: "User registered successfully." });
    });
    

    public_users.get('/', function (req, res) {
        // Simulate an async operation with Promise
        new Promise((resolve) => {
          resolve(books);
        })
        .then((books) => {
          res.json(books);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ message: "An error occurred while fetching the books." });
        });
      });
      
      public_users.get('/isbn/:isbn', function (req, res) {
        const { isbn } = req.params;
      
        new Promise((resolve, reject) => {
          const book = books[isbn];
          if (book) {
            resolve(book);
          } else {
            reject("Book not found");
          }
        })
        .then((book) => {
          res.json(book);
        })
        .catch((errorMessage) => {
          res.status(404).json({ message: errorMessage });
        });
      });
      
      public_users.get('/author/:author', function(req, res) {
        const author = decodeURIComponent(req.params.author);
      
        new Promise((resolve, reject) => {
          const booksByAuthor = Object.values(books).filter(book => book.author === author);
          if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
          } else {
            reject("No books found by the specified author");
          }
        })
        .then((books) => {
          res.json(books);
        })
        .catch((errorMessage) => {
          res.status(404).json({ message: errorMessage });
        });
      });
      
  

      public_users.get('/title/:title', function(req, res) {
        const title = decodeURIComponent(req.params.title);
      
        new Promise((resolve, reject) => {
          const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
          if (booksByTitle.length > 0) {
            resolve(booksByTitle);
          } else {
            reject("No books found with the specified title");
          }
        })
        .then((books) => {
          res.json(books);
        })
        .catch((errorMessage) => {
          res.status(404).json({ message: errorMessage });
        });
      });
      
  
  public_users.get('/review/:isbn', function(req, res) {
    // The "isbn" parameter will be used as the book's ID in this case
    const bookId = req.params.isbn;
  
    // Check if the book exists in the "books" object using the bookId
    const book = books[bookId];
  
    if (!book) {
      // If the book doesn't exist, return a 404 Not Found response
      return res.status(404).json({ message: "Book not found" });
    }
  
    // If the book is found but has no reviews
    if (Object.keys(book.reviews).length === 0) {
      return res.status(200).json({ message: "No reviews found for this book" });
    }
  
    // Return the reviews of the book
    res.status(200).json(book.reviews);
  });
  

module.exports.general = public_users;
