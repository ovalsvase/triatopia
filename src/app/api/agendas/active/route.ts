import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/agendas/active
export async function GET() {
  try {
    // 투표 대기 중(PROPOSED), 심사 중(TABLED)인 안건만 출력 (종료된 건 제외)
    const { data: agendas, error } = await supabase
      .from('agendas')
      .select('id, title, status, votes_for, votes_against, author_name, author_role')
      .in('status', ['PROPOSED', 'TABLED'])
      .order('votes_for', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      active_count: agendas?.length || 0,
      agendas: agendas || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
