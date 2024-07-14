const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  exec(`python predict.py ${imagePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Server error');
    }

    const measurements = JSON.parse(stdout);
    res.json({ measurements });
  });
});

module.exports = router;
