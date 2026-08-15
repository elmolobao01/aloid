import { NextRequest, NextResponse } from 'next/server';
import { normalizeBrazilPhone } from '@/lib/phone/normalize';
import { createAuthenticatedServerClient } from '@/lib/supabase/server';

const ALLOWED = new Set([
  'spam','telemarketing','golpe','cobranca','robocall',
  'pesquisa','entrega','empresa','pessoal','confiavel','outros'
]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const authorization = req.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  if (typeof body.phone !== 'string' || typeof body.category !== 'string') {
    return NextResponse.json(
      { error: 'Telefone e categoria são obrigatórios.' },
      { status: 400 }
    );
  }

  if (!ALLOWED.has(body.category)) {
    return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 });
  }

  const phone = normalizeBrazilPhone(body.phone);

  if (!phone.valid || !('e164' in phone) || !phone.e164) {
    return NextResponse.json({ error: 'Telefone inválido.' }, { status: 400 });
  }

  const token = authorization.slice('Bearer '.length).trim();
  const supabase = createAuthenticatedServerClient(token);

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
  }

  const description =
    typeof body.description === 'string'
      ? body.description.trim().slice(0, 500) || null
      : null;

  const { data, error } = await supabase.rpc('submit_phone_report', {
    p_e164: phone.e164,
    p_category: body.category,
    p_description: description,
  });

  if (error) {
    console.error('Falha ao registrar avaliação:', error);
    return NextResponse.json(
      { error: 'Não foi possível registrar a avaliação.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    accepted: true,
    phone: phone.e164,
    category: body.category,
    reputation: data,
  });
}
