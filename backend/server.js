const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 6000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Root route to check if server is running
app.get('/', (req, res) => {
    res.send('Backend server is running');
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    // Your image processing logic here
    res.json({ measurements: "Measurements from uploaded image" });
});

app.post('/api/upload-base64', (req, res) => {
    const base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
    // Your base64 image processing logic here
    res.json({ measurements: "Measurements from base64 image" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
