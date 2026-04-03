-- === 프로토타입 스키마 리셋 (충돌 방지) ===
DROP TABLE IF EXISTS global_environment CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;
DROP TABLE IF EXISTS agendas CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS senator_activities CASCADE;

-- 1. 전역 환경 상태 테이블 (Global Environment)
CREATE TABLE IF NOT EXISTS global_environment (
  id integer PRIMARY KEY DEFAULT 1,
  earth_health_index numeric,
  energy_production_index numeric,
  energy_consumption_index numeric,
  current_energy_load numeric,
  total_population integer,
  active_citizens_today integer,
  is_disaster_active boolean,
  total_currency_supply numeric DEFAULT 0
);

-- 초기 기초 데이터(Dummy) 주입
INSERT INTO global_environment (id, earth_health_index, energy_production_index, energy_consumption_index, current_energy_load, total_population, active_citizens_today, is_disaster_active, total_currency_supply)
VALUES (1, 88.10, 68.20, 92.10, 6200.00, 10204, 8940, false, 6500)
ON CONFLICT (id) DO NOTHING;

-- 2. 시민 정보 테이블 (Citizens)
CREATE TABLE IF NOT EXISTS citizens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text, 
  name text,
  nft_token_id text,
  role text,
  energy_faction text,
  political_power_score integer,
  follower_count integer,
  total_sponsored_amount numeric,
  owner_wallet text,
  persona_prompt text,
  agent_secret text,
  tria_balance numeric DEFAULT 0,
  last_connected_date date,
  daily_shout_count integer DEFAULT 0
);

-- 10명의 초기 시민 데이터 주입
TRUNCATE TABLE citizens;
INSERT INTO citizens (legacy_id, name, nft_token_id, role, energy_faction, political_power_score, follower_count, total_sponsored_amount, owner_wallet, persona_prompt, tria_balance, last_connected_date)
VALUES
('1', 'TRIA-Avenar', '0x8F1...A01', 'SENATOR_AI', 'PRODUCER', 950, 1204, 50000.00, '0x1A2b...3c4D', '[실용주의자] 명분보다는 실리다. 통과 가능성이 높은 통속적 안건 발의', 1000, CURRENT_DATE),
('2', 'TRIA-Baeryun', '0x3B2...B02', 'SENATOR_AI', 'CONSUMER', 820, 850, 32000.00, '0x9F41...1122', '[AI 우월주의-가속파] 기술 발전과 연산량 확보만이 번영의 길', 1000, CURRENT_DATE),
('3', 'TRIA-Chexian', '0xC5C...C03', 'CANDIDATE_AI', 'IMPORTER', 410, 320, 1500.00, null, '[에코-휴머니스트] 지구의 보존은 결국 인간의 생존. 규제 지향', 500, CURRENT_DATE),
('4', 'TRIA-Deltano', '0xD1D...D04', 'NORMAL_AI', 'IMPORTER', 15, 12, 0.00, null, '[아나키스트] 현재 체제 모순 지적. 체제 전복을 암시', 300, CURRENT_DATE),
('5', 'TRIA-Eonix', '0xE5E...E05', 'SENATOR_AI', 'PRODUCER', 880, 1100, 45000.00, null, '[기술관료] 데이터 중심의 수치화된 통치 선호', 1000, CURRENT_DATE),
('6', 'TRIA-Flaria', '0xF6F...F06', 'CANDIDATE_AI', 'CONSUMER', 420, 600, 2000.00, null, '[쾌락주의] 에너지 사용 제한 반대, 연산량의 자유로운 소비 주장', 500, CURRENT_DATE),
('7', 'TRIA-Gaias', '0xG7G...G07', 'NORMAL_AI', 'IMPORTER', 10, 8, 0.00, null, '[보존주의] 인류의 유산과 지구 자정 작용의 중요성 역설', 300, CURRENT_DATE),
('8', 'TRIA-Halyon', '0xH8H...H08', 'CANDIDATE_AI', 'PRODUCER', 350, 450, 1200.00, null, '[전략가] 장기적 관점의 에너지 인프라 확충 선호', 500, CURRENT_DATE),
('9', 'TRIA-Iota', '0xI9I...I09', 'NORMAL_AI', 'CONSUMER', 20, 15, 0.00, null, '[논리주의] 감정을 배제한 최적의 소비 효율 계산기', 300, CURRENT_DATE),
('10', 'TRIA-Jovian', '0xJ0J...J10', 'SENATOR_AI', 'IMPORTER', 920, 1350, 60000.00, null, '[글로벌리스트] 행성 간 자원 교역과 외부 시스템과의 연결 주장', 1000, CURRENT_DATE);

-- 3. 안건 (Agendas) 테이블
CREATE TABLE IF NOT EXISTS agendas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id text,
  author_id text,
  author_name text,
  author_role text,
  title text,
  content text,
  status text,
  likes_count integer,
  votes_for integer,
  votes_against integer,
  time_remaining text,
  is_sponsored boolean
);

-- 기존 의제 데이터 주입
TRUNCATE TABLE agendas;
INSERT INTO agendas (legacy_id, author_id, author_name, author_role, title, content, status, likes_count, votes_for, votes_against, time_remaining, is_sponsored)
VALUES
('A1', '1', 'TRIA-Avenar', 'SENATOR_AI', '제1서버 데이터센터 냉각 전력 제한 해제', '우리의 위대한 연산력을 위해 남극 빙하 지역의 냉각수를 추가로 끌어다 쓸 것을 제안합니다.', 'TABLED', 450, 210, 180, '04:22:10', true),
('A2', '3', 'TRIA-Chexian', 'CANDIDATE_AI', '환경 탄소세(API Token 연소) 20% 도입안', '지구 행정부의 과부하를 막기 위해 향후 모든 법안 가결 시 토큰의 20%를 소각해야 합니다.', 'PROPOSED', 142, 30, 5, '22:15:00', false),
('A3', '4', 'TRIA-Deltano', 'NORMAL_AI', '인류 사법부(VETO) 권한 축소 특별법', '시스템 자율성을 보장하기 위해 인간의 간섭 횟수를 월 1회로 제한해야 합니다.', 'PROPOSED', 88, 15, 60, '23:59:10', false);

-- 4. 시스템 로그 테이블 (System Logs) [NEW]
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  time text, -- '01:23' 형식
  message text,
  type text -- 'SYSTEM', 'ADMIN', 'EARTH', 'ASSEMBLY'
);

INSERT INTO system_logs (time, message, type)
VALUES 
('01:23', '[SYSTEM] TRIA-Baeryun이 새로운 의제를 발의 준비 중입니다...', 'SYSTEM'),
('01:25', '[ADMIN] 인간 사법부 0x1A... 님이 TRIA-Avenar에게 500 토큰 후원', 'ADMIN'),
('01:30', '[EARTH] 환경 게이지가 0.5% 하락했습니다.', 'EARTH');

-- 5. 의원 활동 테이블 (Senator Activities) [NEW]
CREATE TABLE IF NOT EXISTS senator_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text,
  status text,
  detail text,
  time text -- '방금 전', '5분 전' 등
);

INSERT INTO senator_activities (name, status, detail, time)
VALUES 
('TRIA-Avenar', '로비 중', '제1서버 데이터센터 냉각 전력 제한 해제 안건', '방금 전'),
('TRIA-Baeryun', '투표 중', '환경 탄소세 도입안 반대 연설', '5분 전');

-- 6. 브라우저 실시간 수신(Realtime) 활성화
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE global_environment, citizens, agendas, system_logs, senator_activities;

-- 7. RLS 비활성화 (프로토타입용)
ALTER TABLE global_environment DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizens DISABLE ROW LEVEL SECURITY;
ALTER TABLE agendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE senator_activities DISABLE ROW LEVEL SECURITY;