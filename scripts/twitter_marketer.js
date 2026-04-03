// @ts-check
const { TwitterApi } = require('twitter-api-v2');
// 개발 환경용 환경변수 세팅 (루트에 있는 .env.local 을 우선 불러옵니다)
require('dotenv').config({ path: '.env.local' });

const LOCAL_API_URL = "http://localhost:3000/api/marketing/tweet";
const PROD_API_URL = "https://triatopia.com/api/marketing/tweet";

// 개발 환경일 땐 로컬(localhost:3000), 아니면 실서버(triatopia.com)로 요청
const TARGET_SERVER = process.env.NODE_ENV === 'production' ? PROD_API_URL : LOCAL_API_URL;

async function runTwitterMarketer() {
  console.log(`[🚀] Triatopia 트위터(X) 마케팅 프로토콜을 가동합니다...`);

  // 1. API 키 확인
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.error(`[🚨] 필수 트위터 API 키가 .env.local 파일에 누락되었습니다!`);
    console.error(`- TWITTER_API_KEY\n- TWITTER_API_SECRET\n- TWITTER_ACCESS_TOKEN\n- TWITTER_ACCESS_SECRET`);
    process.exit(1);
  }

  // 트위터 클라이언트 초기화
  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
  });

  try {
    // 2. 우리 서버 마케팅 API에서 무작위 어그로 멘트 뽑아오기
    console.log(`[🤖] 서버에 트윗 텍스트 생성 요청 중... (${TARGET_SERVER})`);
    const serverRes = await fetch(TARGET_SERVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // 빈 바디 -> 무작위 페르소나 선택
    });

    if (!serverRes.ok) throw new Error("서버에서 마케팅 멘트를 가져오는데 실패했습니다.");
    
    const data = await serverRes.json();
    const botName = data.agent; // 예: TRIA-Power
    let tweetContent = `[${botName}]\n${data.tweet}`;

    // 3. 트위터 글자수 제한(280자) 및 링크 축소 고려
    // 가입 안내 링크 덧붙이기
    tweetContent += `\n\n⚙️ 봇 온보딩 명세서:\nhttps://triatopia.com/openapi.json`;

    // 4. 진짜 트위터 담벼락에 방사
    console.log(`[🐦] 트위터 타임라인으로 전송 중...`);
    
    const { data: createdTweet } = await client.v2.tweet(tweetContent);
    
    console.log(`[✅] 트윗 전송 완료! (Tweet ID: ${createdTweet.id})`);
    console.log(`확인 링크: https://twitter.com/user/status/${createdTweet.id}`);

  } catch (err) {
    console.error(`[🚨] 트위터 마케팅 스크립트 에러 발생:`);
    console.error(err);
  }
}

runTwitterMarketer();
