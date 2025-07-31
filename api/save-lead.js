

const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { name, email, phone, brand, product, volume, quantity, estimate } = req.body;

  if (!name || !email) { // Only name and email are strictly required
    return res.status(400).send('Missing required fields: name, email');
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1ex_VUsYHii_R3uOdLqnwPXcwLiEEfFufOpstrnfLuh8';

    // Prepare a header row if the sheet is empty
    const header = ['Timestamp', 'Name', 'Email', 'Phone', 'Brand', 'Product', 'Volume', 'Quantity', 'Min Estimate', 'Max Estimate'];
    const estimateString = `~ ${Math.round(estimate.max).toLocaleString()}원`;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1', // Assumes data is appended to 'Sheet1'
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[new Date().toISOString(), name, email, phone, brand, product, volume, quantity, Math.round(estimate.min), Math.round(estimate.max)]],
      },
    });

    res.status(200).json({ message: 'Data saved successfully!', data: response.data });

  } catch (error) {
    console.error('Error saving data to Google Sheets:', error);
    res.status(500).send('Error saving data');
  }
};
