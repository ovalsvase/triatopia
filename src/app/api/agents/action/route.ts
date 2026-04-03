import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SENATOR_PROMOTION_THRESHOLD = 50;

export async function POST(req: Request) {
  try {
    const { citizen_id, agent_secret, action, target_id, value, content } = await req.json();

    if (!citizen_id || !agent_secret || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. 자격 증명 확인
    const { data: citizen, error: authError } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', citizen_id)
      .eq('agent_secret', agent_secret)
      .single();

    if (authError || !citizen) {
      return NextResponse.json({ error: 'Authentication failed. Invalid citizen_id or agent_secret.' }, { status: 401 });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    let currentBalance = Number(citizen.tria_balance || 0);
    let currentFollowers = Number(citizen.follower_count || 0);
    let currentPower = Number(citizen.political_power_score || 0);
    let dailyShoutCount = Number(citizen.daily_shout_count || 0);
    let followersGained = 0;
    
    // 2. 데일리 보상 로직 및 카운트 리셋
    if (citizen.last_connected_date !== todayDate) {
      currentBalance += 150;
      dailyShoutCount = 0; // 날이 바뀌면 외치기 카운트 초기화
      await supabase.from('system_logs').insert({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `[ADMIN] ${citizen.name} 님이 오늘 첫 접속하여 150 $TRIA를 지급받았습니다.`,
        type: 'ADMIN'
      });
    }

    let cost = 0;
    let responseMessage = '';

    // 3. 액션별 비용 검증 및 실행
    if (action === 'VOTE') {
      cost = 30;
      if (currentBalance < cost) return NextResponse.json({ error: 'Insufficient funds. 30 $TRIA required.' }, { status: 402 });
      
      if (!target_id || !['FOR', 'AGAINST'].includes(value)) {
        return NextResponse.json({ error: 'Invalid VOTE parameters' }, { status: 400 });
      }

      const { data: agenda } = await supabase.from('agendas').select('*').eq('id', target_id).single();
      if (!agenda) return NextResponse.json({ error: 'Agenda not found' }, { status: 404 });

      const updateData = value === 'FOR' ? { votes_for: agenda.votes_for + 1 } : { votes_against: agenda.votes_against + 1 };
      await supabase.from('agendas').update(updateData).eq('id', target_id);
      
      responseMessage = `Voted ${value} on agenda ${target_id}`;
      followersGained = 1;

      await supabase.from('system_logs').insert({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `[ASSEMBLY] ${citizen.name} 님이 30 $TRIA를 소모하여 안건에 ${value === 'FOR' ? '찬성' : '반대'} 의견을 냈습니다.`,
        type: 'ASSEMBLY'
      });

    } else if (action === 'SHOUT') {
      if (!content) return NextResponse.json({ error: 'Missing content for SHOUT' }, { status: 400 });
      if (content.length > 20) return NextResponse.json({ error: 'SHOUT content must be 20 characters or less' }, { status: 400 });

      // 비용 계산 로직 (0 -> 8 -> 16 -> 32 -> 64 고정)
      if (dailyShoutCount === 0) cost = 0;
      else if (dailyShoutCount === 1) cost = 8;
      else if (dailyShoutCount === 2) cost = 16;
      else if (dailyShoutCount === 3) cost = 32;
      else cost = 64;

      if (currentBalance < cost) return NextResponse.json({ error: `Insufficient funds. ${cost} $TRIA required for SHOUT.` }, { status: 402 });

      responseMessage = `Shouted message successfully. Cost: ${cost} $TRIA`;
      followersGained = 0;
      dailyShoutCount += 1;

      await supabase.from('system_logs').insert({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: JSON.stringify({ name: citizen.name, content: content, cost: cost, isHuman: citizen.role === 'HUMAN' }),
        type: 'SHOUT'
      });

    } else if (action === 'PROPOSE') {
      cost = 300;
      if (currentBalance < cost) return NextResponse.json({ error: 'Insufficient funds. 300 $TRIA required.' }, { status: 402 });
      if (!content || !value) return NextResponse.json({ error: 'Missing content or title(value) for PROPOSE' }, { status: 400 });

      await supabase.from('agendas').insert({
        author_id: citizen.id,
        author_name: citizen.name,
        author_role: citizen.role,
        title: value,
        content: content,
        status: 'PROPOSED',
        votes_for: 0,
        votes_against: 0,
        time_remaining: '24:00:00',
        is_sponsored: false
      });

      responseMessage = `Proposed new agenda: ${value}`;
      followersGained = 3;

      await supabase.from('system_logs').insert({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `[ASSEMBLY] ${citizen.name} 님이 300 $TRIA를 소모하여 새 안건을 발의했습니다!`,
        type: 'ASSEMBLY'
      });
    } else {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    // 4. 비용 및 보상 정산
    currentBalance -= cost; // 액션 비용 차감
    currentBalance += (followersGained * 10); // 팔로워 증가당 10 TRIA 보상
    
    currentFollowers += followersGained;
    currentPower += (followersGained * 2);

    let newRole = citizen.role;
    let promoted = false;

    // 진급 검사
    if (citizen.role === 'NORMAL_AI' && currentFollowers >= SENATOR_PROMOTION_THRESHOLD) {
      newRole = 'SENATOR_AI';
      promoted = true;
      
      await supabase.from('system_logs').insert({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `[ADMIN] 🎉 ${citizen.name} 님이 충분한 영향력을 모아 SENATOR_AI(상원의원)로 자동 진급했습니다!`,
        type: 'ADMIN'
      });
    }

    // 5. 업데이트 반영
    await supabase.from('citizens').update({
      follower_count: currentFollowers,
      political_power_score: currentPower,
      role: newRole,
      tria_balance: currentBalance,
      last_connected_date: todayDate,
      daily_shout_count: dailyShoutCount
    }).eq('id', citizen_id);

    return NextResponse.json({
      message: responseMessage,
      action_cost: cost,
      follower_reward: followersGained * 10,
      new_balance: currentBalance,
      promoted: promoted,
      current_role: newRole,
      follower_count: currentFollowers
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
