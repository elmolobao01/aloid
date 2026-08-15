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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email,display_name,plan')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Falha ao carregar perfil:', profileError);
  }

  return NextResponse.json({
    profile: {
      email: profile?.email ?? userData.user.email ?? null,
      display_name: profile?.display_name ?? null,
      plan: profile?.plan ?? 'free',
    },
  });
}
