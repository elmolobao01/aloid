import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServerClient } from '@/lib/supabase/server';

function bearerToken(req: NextRequest) {
  const authorization = req.headers.get('authorization') || '';
  return authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : null;
}

export async function GET(req: NextRequest) {
  const token = bearerToken(req);

  if (!token) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  const supabase = createAuthenticatedServerClient(token);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_my_account_summary');

  if (error) {
    console.error('Falha ao carregar resumo da conta:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar sua conta.', code: error.code ?? null },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const token = bearerToken(req);

  if (!token) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const displayName = typeof body.display_name === 'string'
    ? body.display_name.trim().slice(0, 80)
    : '';

  if (displayName.length < 2) {
    return NextResponse.json(
      { error: 'Informe um nome com pelo menos 2 caracteres.' },
      { status: 400 }
    );
  }

  const supabase = createAuthenticatedServerClient(token);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('update_my_profile', {
    p_display_name: displayName,
  });

  if (error) {
    console.error('Falha ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Não foi possível atualizar seu perfil.', code: error.code ?? null },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
