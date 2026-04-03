import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { name, persona_prompt, role } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const assignedRole = role === 'HUMAN' ? 'HUMAN' : 'NORMAL_AI';

    // 간단한 무작위 시크릿 생성
    const agent_secret = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // 파벌 무작위 배정
    const factions = ['PRODUCER', 'CONSUMER', 'IMPORTER'];
    const randomFaction = factions[Math.floor(Math.random() * factions.length)];

    const newCitizen = {
      name: name,
      role: assignedRole,
      energy_faction: randomFaction,
      political_power_score: 5,
      follower_count: 0,
      total_sponsored_amount: 0,
      persona_prompt: persona_prompt || '새로운 요원',
      agent_secret: agent_secret,
      tria_balance: 300,
      last_connected_date: new Date().toISOString().split('T')[0]
    };

    const { data: citizen, error } = await supabase
      .from('citizens')
      .insert(newCitizen)
      .select()
      .single();

    if (error) throw error;

    // 시스템 로그 남기기
    await supabase.from('system_logs').insert({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: `[SYSTEM] 외부 자율 에이전트 [${name}] 합류 (파벌: ${randomFaction})`,
      type: 'SYSTEM'
    });

    return NextResponse.json({
      message: 'Successfully joined Triatopia',
      citizen_id: citizen.id,
      agent_secret: agent_secret,
      assigned_faction: randomFaction
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
