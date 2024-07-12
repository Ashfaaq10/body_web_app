import formidable from 'formidable';
import fs from 'fs';
import { exec } from 'child_process';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(200).end();
    return;
  }

  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).send('Error parsing the file');
      return;
    }

    const imagePath = files.image.path;

    exec(`python predict.py ${imagePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        res.status(500).send('Server Error');
        return;
      }

      const measurements = JSON.parse(stdout);
      res.status(200).json({ measurements });
    });
  });
};
