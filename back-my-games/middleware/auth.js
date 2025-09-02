const jwt = require('jsonwebtoken');

const secret = '12340789';

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Extract the token from the Bearer header

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = user; // Attach the user data to the request object for later use
      next(); // Allow the request to proceed to the next middleware or route handler
    });
  } else {
    res.sendStatus(401); // Unauthorized if no token is provided
  }
};

module.exports = { authenticateJWT };
