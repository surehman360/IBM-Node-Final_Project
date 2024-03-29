const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configure session middleware for customer routes
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// JWT Authentication Middleware for certain customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // No token present, return Unauthorized
  }

  // Hardcoded secret for demonstration
  const jwtSecret = 'fingerprint_customer';

  // Verify the token
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Token invalid or expired, return Forbidden
    }
    req.user = user; // Token valid, attach user to request object
    next(); // Proceed to the next middleware or route handler
  });
});

const PORT = 5000;

// Use the defined routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
