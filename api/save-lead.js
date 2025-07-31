const { google } = require('googleapis');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://marketingtest-three.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS Preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Destructure the actual data coming from the frontend
  const { name, email, brand, product, volume, quantity, estimate } = req.body;

  // Basic validation
  if (!name || !email || !brand || !product || !volume || !quantity || !estimate) {
    return res.status(400).send('Missing required fields.');
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

    // Get current timestamp in Korean time
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    // Prepare the row to be inserted
    const values = [[ 
      timestamp,
      name,
      email,
      brand,
      product,
      volume,
      quantity,
      Math.round(estimate.min),
      Math.round(estimate.max)
    ]];

    // Append data to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1', // Appends to the first empty row in Sheet1
      valueInputOption: 'USER_ENTERED',
      resource: {
        values,
      },
    });

    res.status(200).json({ message: 'Data saved successfully!' });

  } catch (error) {
    console.error('Error saving data to Google Sheets:', error);
    res.status(500).json({ error: 'Error saving data to Google Sheets', details: error.message });
  }
};