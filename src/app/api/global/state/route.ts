import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: envData, error: envError } = await supabase
      .from('global_environment')
      .select('*')
      .eq('id', 1)
      .single();

    if (envError) throw envError;

    const { data: agendas, error: agendasError } = await supabase
      .from('agendas')
      .select('id, title, status, votes_for, votes_against, time_remaining')
      .in('status', ['PROPOSED', 'TABLED', 'NEW']);

    if (agendasError) throw agendasError;

    return NextResponse.json({
      environment: envData,
      active_agendas: agendas
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
