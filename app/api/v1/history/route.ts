import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const authorization = req.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Autenticação obrigatória.' },
      { status: 401 }
    );
  }

  const token = authorization.slice('Bearer '.length).trim();
  const supabase = createAuthenticatedServerClient(token);

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json(
      { error: 'Sessão inválida ou expirada.' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase.rpc('get_my_lookup_history', {
    p_limit: 20,
  });

  if (error) {
    console.error('Falha ao carregar histórico:', error);

    return NextResponse.json(
      {
        error: 'Não foi possível carregar o histórico.',
        code: error.code ?? null,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    total: Array.isArray(data) ? data.length : 0,
    history: Array.isArray(data) ? data : [],
  });
}
