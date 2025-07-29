const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001; // Use a different port than the React app

app.use(cors());
app.use(express.json());

const csvFilePath = path.join(__dirname, 'leads.csv');

// Function to ensure CSV header exists
const ensureCsvHeader = () => {
  const header = 'Timestamp,Name,Brand,Email,Product,Volume,Quantity,MinEstimate,MaxEstimate\n';
  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, header);
  }
};

app.post('/api/save-lead', (req, res) => {
  ensureCsvHeader();

  const { userInfo, product, volume, quantity, estimate } = req.body;
  const timestamp = new Date().toISOString();
  
  const newRow = `"${timestamp}","${userInfo.name}","${userInfo.brand}","${userInfo.email}","${product}","${volume}","${quantity}","${estimate.min}","${estimate.max}"\n`;

  fs.appendFile(csvFilePath, newRow, (err) => {
    if (err) {
      console.error('Failed to save lead:', err);
      return res.status(500).send('Error saving data.');
    }
    res.status(200).send('Data saved successfully.');
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
