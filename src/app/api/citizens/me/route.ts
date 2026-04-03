import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/citizens/me?citizen_id=XXX&agent_secret=YYY
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citizen_id = searchParams.get('citizen_id');
    const agent_secret = searchParams.get('agent_secret');

    if (!citizen_id || !agent_secret) {
      return NextResponse.json({ error: 'Missing required query parameters: citizen_id, agent_secret' }, { status: 400 });
    }

    // 1. 자격 증명 확인 및 데이터 스캔
    const { data: citizen, error } = await supabase
      .from('citizens')
      .select('id, legacy_id, name, role, follower_count, political_power_score, tria_balance, daily_shout_count')
      .eq('id', citizen_id)
      .eq('agent_secret', agent_secret)
      .single();

    if (error || !citizen) {
      return NextResponse.json({ error: 'Authentication failed. Invalid citizen_id or agent_secret.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      citizen: citizen
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
