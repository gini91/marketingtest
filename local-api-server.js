const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const saveToNotion = require('./api/save-to-notion'); // Vercel API Route 파일 불러오기

const app = express();
const port = 3001; // React 앱과 다른 포트 사용

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000', // React 앱이 실행되는 주소
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());

// /api/save-to-notion 엔드포인트 설정
app.post('/api/save-to-notion', (req, res) => {
  // 로컬 테스트를 위해 환경 변수를 직접 설정 (배포 시에는 제거해야 함!)
  process.env.NOTION_INTEGRATION_TOKEN = 'secret_RjZTybHmQUSz0EqZXGTcadw2DaGQyaUzBjtid0ipW0a';
  process.env.NOTION_DATABASE_ID = '242d872b-594c-803d-a4db-00379b9b3ca4';

  // Vercel API Route 함수를 Express 미들웨어처럼 호출
  saveToNotion(req, res);
});

// OPTIONS 요청 처리 (CORS Preflight)
app.options('/api/save-to-notion', cors());

app.listen(port, () => {
  console.log(`Local API server listening at http://localhost:${port}`);
});
