import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServerClient } from '@/lib/supabase/server';

function bearerToken(req: NextRequest) {
  const authorization = req.headers.get('authorization') || '';
  return authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : null;
}

async function authClient(req: NextRequest) {
  const token = bearerToken(req);
  if (!token) return null;

  const supabase = createAuthenticatedServerClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;
  return supabase;
}

export async function GET(req: NextRequest) {
  const supabase = await authClient(req);

  if (!supabase) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_my_protection');

  if (error) {
    console.error('Falha ao carregar proteção:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar as preferências de proteção.', code: error.code ?? null },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = await authClient(req);

  if (!supabase) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const { data, error } = await supabase.rpc('update_my_protection', {
    p_settings: body?.settings ?? {},
  });

  if (error) {
    console.error('Falha ao atualizar proteção:', error);
    return NextResponse.json(
      { error: 'Não foi possível salvar as preferências.', code: error.code ?? null },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
