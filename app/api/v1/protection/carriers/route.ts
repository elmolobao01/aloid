import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServerClient } from '@/lib/supabase/server';

function tokenFrom(req: NextRequest) {
  const value = req.headers.get('authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : null;
}

async function client(req: NextRequest) {
  const token = tokenFrom(req);
  if (!token) return null;
  const supabase = createAuthenticatedServerClient(token);
  const { data, error } = await supabase.auth.getUser(token);
  return error || !data.user ? null : supabase;
}

export async function POST(req: NextRequest) {
  const supabase = await client(req);
  if (!supabase) return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const carrier = typeof body.carrier === 'string' ? body.carrier.trim() : '';

  const { data, error } = await supabase.rpc('add_my_blocked_carrier', {
    p_carrier: carrier,
  });

  if (error) {
    const premium = error.message?.includes('premium_required');
    return NextResponse.json(
      { error: premium ? 'Este recurso requer ALÔ ID Premium.' : 'Não foi possível salvar a operadora.' },
      { status: premium ? 403 : 500 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await client(req);
  if (!supabase) return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const carrier = typeof body.carrier === 'string' ? body.carrier.trim() : '';

  const { data, error } = await supabase.rpc('remove_my_blocked_carrier', {
    p_carrier: carrier,
  });

  if (error) return NextResponse.json({ error: 'Não foi possível remover a operadora.' }, { status: 500 });
  return NextResponse.json(data);
}
