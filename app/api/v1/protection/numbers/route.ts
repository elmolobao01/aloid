import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServerClient } from '@/lib/supabase/server';
import { normalizeBrazilPhone } from '@/lib/phone/normalize';

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
  if (!supabase) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = normalizeBrazilPhone(String(body.phone || ''));

  if (!phone.valid || !('e164' in phone) || !phone.e164) {
    return NextResponse.json({ error: 'Número brasileiro inválido.' }, { status: 400 });
  }

  const listType = body.list_type === 'allow' ? 'allow' : body.list_type === 'block' ? 'block' : null;
  if (!listType) {
    return NextResponse.json({ error: 'Lista inválida.' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('upsert_my_protection_number', {
    p_e164: phone.e164,
    p_list_type: listType,
    p_label: typeof body.label === 'string' ? body.label : null,
  });

  if (error) {
    const status = error.message?.includes('list_limit_reached') ? 409 : 500;
    return NextResponse.json(
      {
        error: status === 409
          ? 'Você atingiu o limite desta lista no plano atual.'
          : 'Não foi possível salvar o número.',
        code: error.code ?? null,
      },
      { status }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await client(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = normalizeBrazilPhone(String(body.phone || ''));

  if (!phone.valid || !('e164' in phone) || !phone.e164) {
    return NextResponse.json({ error: 'Número inválido.' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('remove_my_protection_number', {
    p_e164: phone.e164,
  });

  if (error) {
    return NextResponse.json({ error: 'Não foi possível remover o número.' }, { status: 500 });
  }

  return NextResponse.json(data);
}
