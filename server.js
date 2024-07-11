const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 5005;

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '10mb' })); // Increase the limit to handle large base64 images

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve 'index.html' from the 'views' directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  exec(`python predict.py ${imagePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Server Error');
    }

    const measurements = JSON.parse(stdout);
    res.json({ measurements });
  });
});

// Endpoint to handle base64 image uploads
app.post('/upload-base64', (req, res) => {
  const base64Image = req.body.image;
  const matches = base64Image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    return res.status(400).send('Invalid image data');
  }

  const extension = matches[1];
  const imageData = matches[2];
  const buffer = Buffer.from(imageData, 'base64');
  const filename = `uploads/${Date.now()}.jpg`;

  fs.writeFile(filename, buffer, (err) => {
    if (err) {
      console.error(`Error saving image: ${err}`);
      return res.status(500).send('Server Error');
    }

    exec(`python predict.py ${filename}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send('Server Error');
      }

      const measurements = JSON.parse(stdout);
      res.json({ measurements });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
