const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { userInfo, product, volume, quantity, estimate } = req.body;

  // Google Sheets API credentials from Vercel Environment Variables
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!privateKey || !clientEmail || !spreadsheetId) {
    return res.status(500).send('Server configuration error: Missing Google credentials.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({
    version: 'v4',
    auth,
  });

  const timestamp = new Date().toISOString();
  const rowData = [
    timestamp,
    userInfo.name,
    userInfo.brand,
    userInfo.email,
    product,
    volume,
    quantity,
    estimate.min,
    estimate.max,
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:I', // Adjust sheet name and range as needed
      valueInputOption: 'RAW',
      resource: {
        values: [rowData],
      },
    });
    res.status(200).send('Data saved to Google Sheet successfully.');
  } catch (error) {
    console.error('Error writing to Google Sheet:', error.message);
    res.status(500).send('Error saving data to Google Sheet.');
  }
};
