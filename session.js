
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./database'); // Import database(MySQL) connection
const { generateRandomString } = require('./randomy');

const SECRET_KEY = "a^6S*3!n$P@L7#k8!JhT$%E@k2&+R*pB5@3#Nt^s9!pQ@L7!L3x#2dF@6GhD*8N5^hV@9P6";

// Configure MySQL session store
const sessionStore = new MySQLStore({
  expiration: 86400000, // Session expiration time (1 day) in milliseconds
  createDatabaseTable: true, // Automatically create the session table
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, db);

// Session middleware setup
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || SECRET_KEY,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 86400000 // Cookie expiration time (1 day) in milliseconds
  }
});


// Middleware to check if user is authenticated
function requireAuth(req, res, next)
{
  if(!req.session || !req.session.loginId)
  {
    return res.redirect('/pw/auth');
  }
  next();
}

// Middleware to check if user is already logged in
function checkAlreadyLoggedIn(req, res, next) {
  if (req.session && req.session.loginId) {
    return res.redirect('/pw/dashboard');
  }
  next();
}

module.exports = {
  sessionMiddleware,
  requireAuth,
  checkAlreadyLoggedIn
};