const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: 'secret_RjZTybHmQUSz0EqZXGTcadw2DaGQyaUzBjtid0ipW0a',
});

const databaseId = '242d872b-594c-803d-a4db-00379b9b3ca4';

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', 'https://marketingtest-three.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle Preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, email, brand, product, volume, quantity, estimate } = req.body;

    // Basic validation
    if (!name || !email || !brand || !product || !volume || !quantity || !estimate) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'name': {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        'email': {
          rich_text: [
            {
              text: {
                content: email,
              },
            },
          ],
        },
        'brand': {
          rich_text: [
            {
              text: {
                content: brand,
              },
            },
          ],
        },
        'product': {
          rich_text: [
            {
              text: {
                content: product,
              },
            },
          ],
        },
        'volume': {
          rich_text: [
            {
              text: {
                content: volume,
              },
            },
          ],
        },
        'quantity': {
          number: quantity,
        },
        'estimate.min': {
          number: Math.round(estimate.min),
        },
        'estimate.max': {
          number: Math.round(estimate.max),
        },
        'timestamp': {
          rich_text: [
            {
              text: {
                content: timestamp,
              },
            },
          ],
        },
      },
    });

    res.status(200).json({ message: 'Data successfully saved to Notion!' });
  } catch (error) {
    console.error('Error saving data to Notion:', error);
    res.status(500).json({ error: 'Failed to save data to Notion', details: error.message });
  }
};
