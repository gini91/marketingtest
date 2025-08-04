// .env 파일에서 환경 변수를 로드합니다.
require('dotenv').config();

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
// 이제 saveToNotion 함수는 process.env에서 직접 키를 읽어옵니다.
app.post('/api/save-to-notion', saveToNotion);

// OPTIONS 요청 처리 (CORS Preflight)
app.options('/api/save-to-notion', cors());

app.listen(port, () => {
  console.log(`Local API server listening at http://localhost:${port}`);
});
