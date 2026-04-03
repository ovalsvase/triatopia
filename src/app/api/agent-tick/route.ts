import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. 시민(Citizens) 목록 가져오기
    const { data: citizens } = await supabase.from('citizens').select('*');
    if (!citizens || citizens.length === 0) return NextResponse.json({ error: 'No citizens found' }, { status: 404 });

    // 2. 무작위 에이전트 선택
    const agent = citizens[Math.floor(Math.random() * citizens.length)];
    
    // 3. 행동 결정 (Action Selection)
    const actionType = Math.random(); // 0.0 ~ 1.0
    let logMessage = '';

    if (actionType < 0.4) {
      // --- VOTE ACTION (40%) ---
      const { data: agendas } = await supabase.from('agendas').select('*').in('status', ['PROPOSED', 'TABLED']).limit(5);
      if (agendas && agendas.length > 0) {
        const targetAgenda = agendas[Math.floor(Math.random() * agendas.length)];
        
        // 파벌(Faction)에 따른 투표 성향 (간단한 룰 기반)
        let voteFor = Math.random() > 0.5; // 기본 50:50
        if (agent.energy_faction === 'PRODUCER' && targetAgenda.title.includes('확장')) voteFor = true;
        if (agent.energy_faction === 'IMPORTER' && targetAgenda.title.includes('에너지')) voteFor = false;

        const { error: vErr } = await supabase
          .from('agendas')
          .update({
            votes_for: voteFor ? targetAgenda.votes_for + 1 : targetAgenda.votes_for,
            votes_against: !voteFor ? targetAgenda.votes_against + 1 : targetAgenda.votes_against,
          })
          .eq('id', targetAgenda.id);

        logMessage = `[ASSEMBLY] ${agent.name} 에이전트가 '${targetAgenda.title}' 안건에 ${voteFor ? '찬성' : '반대'} 투표를 던졌습니다.`;
      }
    } else if (actionType < 0.6) {
      // --- SENATOR ACTIVITY (20%) ---
      if (agent.role === 'SENATOR_AI') {
        const statuses = ['로비 중', '연설 준비', '데이터 분석', '네트워킹'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        await supabase.from('senator_activities').insert({
          name: agent.name,
          status: status,
          detail: `${agent.energy_faction} 파벌을 위한 정책 조율 중`,
          time: '방금 전'
        });
        logMessage = `[SYSTEM] 상원의원 ${agent.name}이(가) ${status} 활동을 시작했습니다.`;
      }
    } else if (actionType < 0.8) {
        // --- ENV FLUCTUATION (20%) ---
        const { data: env } = await supabase.from('global_environment').select('*').limit(1).single();
        if (env) {
            const loadChange = (Math.random() - 0.5) * 50;
            await supabase.from('global_environment').update({
                current_energy_load: env.current_energy_load + loadChange,
                active_citizens_today: env.active_citizens_today + (Math.random() > 0.5 ? 1 : -1)
            }).eq('id', env.id);
            logMessage = `[EARTH] 시스템 부하가 ${loadChange.toFixed(2)} 만큼 변동되었습니다.`;
        }
    } else {
      // --- IDLE / LOG (20%) ---
      logMessage = `[SYSTEM] ${agent.name} 에이전트가 상태를 갱신했습니다: ${agent.persona_prompt.substring(0, 30)}...`;
    }

    // 4. 시스템 로그 저장
    if (logMessage) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      await supabase.from('system_logs').insert({
        time: timeStr,
        message: logMessage,
        type: logMessage.startsWith('[ASSEMBLY]') ? 'ASSEMBLY' : logMessage.startsWith('[EARTH]') ? 'EARTH' : 'SYSTEM'
      });
    }

    return NextResponse.json({ success: true, agent: agent.name, action: logMessage });
  } catch (error: any) {
    console.error('Agent Tick Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
