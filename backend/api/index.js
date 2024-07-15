const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Routes
const uploadRoute = require('./upload');
const uploadBase64Route = require('./upload-base64');

app.use('/api/upload', uploadRoute);
app.use('/api/upload-base64', uploadBase64Route);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
