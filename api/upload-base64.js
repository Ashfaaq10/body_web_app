const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const base64Image = req.body.image;
  const matches = base64Image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    return res.status(400).send('Invalid image data');
  }

  const extension = matches[1];
  const imageData = matches[2];
  const buffer = Buffer.from(imageData, 'base64');
  const filename = `/tmp/uploads/${Date.now()}.jpg`;

  fs.writeFile(filename, buffer, (err) => {
    if (err) {
      console.error(`Error saving image: ${err}`);
      return res.status(500).send('Server error');
    }

    exec(`python predict.py ${filename}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send('Server error');
      }

      const measurements = JSON.parse(stdout);
      res.json({ measurements });
    });
  });
};
