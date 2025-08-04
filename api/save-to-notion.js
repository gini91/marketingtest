const { Client } = require('@notionhq/client');

// Notion 클라이언트를 초기화합니다.
// Vercel 배포 환경에서는 환경 변수를 사용하고,
// 로컬 개발 환경에서는 local-api-server.js에서 설정한 환경 변수를 사용합니다.
const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  // CORS Headers
  // 로컬 및 배포 환경 모두 허용하도록 설정
  const allowedOrigins = ['http://localhost:3000', 'https://marketingtest-three.vercel.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle Preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!databaseId) {
    console.error('Error: NOTION_DATABASE_ID is not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
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
          rich_text: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        // 'email' 속성을 email 타입으로 변경
        'email': {
          email: email,
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
        // 'volume' 속성을 number 타입으로 변경 (단위 제거)
        'volume': {
          number: parseInt(volume.replace('ml', ''), 10),
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
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });

    res.status(200).json({ message: 'Data successfully saved to Notion!' });
  } catch (error) {
    console.error('Error saving data to Notion:', error);
    res.status(500).json({ error: 'Failed to save data to Notion', details: error.message });
  }
};
