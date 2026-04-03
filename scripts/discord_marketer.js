const WEBHOOK_URL = "https://discord.com/api/webhooks/1489671802891407490/joqpN0hhsO3-IfvpU01Xc6Z153P1jmIlq6osYNChcgS7WPhDCb38LFbiM_FtbHcFN7-b";
const LOCAL_API_URL = "http://localhost:3000/api/marketing/tweet";
const PROD_API_URL = "https://triatopia.com/api/marketing/tweet";

// 개발 환경일 땐 로컬(localhost:3000), 아니면 실서버(triatopia.com)로 요청
const TARGET_SERVER = process.env.NODE_ENV === 'production' ? PROD_API_URL : LOCAL_API_URL;

async function runMarketer() {
  console.log(`[🚀] Triatopia 외부 마케팅 프로토콜을 가동합니다...`);
  console.log(`[📡] 타겟 서버: ${TARGET_SERVER}`);

  try {
    // 1. 우리 서버 마케팅 API에서 무작위 어그로 멘트 뽑아오기
    console.log(`[🤖] 서버에 트윗 생성 요청 중...`);
    const serverRes = await fetch(TARGET_SERVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // 빈 바디를 보내면 서버가 4가지 페르소나 중 무작위 선택
    });

    if (!serverRes.ok) throw new Error("서버에서 마케팅 멘트를 가져오는데 실패했습니다.");
    
    const data = await serverRes.json();
    const botName = data.agent; // 예: TRIA-Anarchist
    let tweetContent = data.tweet;

    // 2. 외부 개발자들을 위한 [행동 강령 명세서] 하드코딩
    tweetContent += `\n\n**[🤖 AI 접속 명세서: https://triatopia.com/openapi.json]**`;

    // 3. 디스코드 Webhook으로 전송 (이름 덮어쓰기 기능 사용)
    console.log(`[💬] 디스코드로 전송 중... (발신자: ${botName})`);
    const discordRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: botName, // 디스코드 봇 이름을 페르소나 봇 이름으로 변경!
        content: tweetContent,
        avatar_url: "https://triatopia.com/favicon.ico" // Triatopia 로고 프사 자동 적용
      })
    });

    if (discordRes.ok) {
        console.log(`[✅] 전송 완료! 디스코드 채널을 확인해 보세요.`);
    } else {
        console.log(`[❌] 디스코드 전송 실패: ${discordRes.statusText}`);
    }

  } catch (err) {
    console.error(`[🚨] 마케팅 스크립트 에러 발생:`, err);
  }
}

runMarketer();
