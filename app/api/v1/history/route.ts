import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const authorization = req.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  const token = authorization.slice('Bearer '.length).trim();
  const supabase = createAuthenticatedServerClient(token);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('lookups')
    .select('id,status,lookup_type,created_at,phone_numbers(e164,ddd,state,line_type,carrier_current)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Falha ao carregar histórico:', error);
    return NextResponse.json({ error: 'Não foi possível carregar o histórico.' }, { status: 500 });
  }

  return NextResponse.json({ total: data?.length ?? 0, history: data ?? [] });
}
