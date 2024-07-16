const express = require('express');
const routes = require('./routes');
const path = require('path');
const cors = require('cors');
const { sessionMiddleware } = require('./session');
const {generateRandomString} = require('./randomy');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Apply session middleware before routes
app.use(sessionMiddleware);

app.use('/', routes);



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
