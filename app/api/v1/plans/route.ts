import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  const { data, error } = await supabase.rpc('get_active_plan_catalog');
  if (error) {
    return NextResponse.json({ error: 'Não foi possível carregar os planos.', code: error.code ?? null }, { status: 500 });
  }

  return NextResponse.json({ plans: data ?? [] });
}
