import { NextRequest, NextResponse } from 'next/server';
import { normalizeBrazilPhone } from '@/lib/phone/normalize';

const ALLOWED = new Set([
  'spam','telemarketing','golpe','cobranca','robocall',
  'pesquisa','entrega','empresa','pessoal','confiavel','outros'
]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

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

  return NextResponse.json(
    {
      accepted: false,
      reason: 'login_required',
      message: 'A avaliação comunitária será liberada após autenticação.',
      phone: phone.e164,
      category: body.category,
    },
    { status: 401 }
  );
}
