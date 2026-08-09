import { NextRequest, NextResponse } from 'next/server';
import { normalizeBrazilPhone } from '@/lib/phone/normalize';
import { DevelopmentTelecomProvider } from '@/lib/providers/telecom/provider';
import { AbstractTelecomProvider } from '@/lib/providers/telecom/abstract';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (typeof body.phone !== 'string') {
    return NextResponse.json(
      { error: 'Telefone obrigatório' },
      { status: 400 }
    );
  }

  const phone = normalizeBrazilPhone(body.phone);

  if (!phone.valid || !('e164' in phone) || !phone.e164) {
    return NextResponse.json({
      phone,
      telecom: null,
      reputation: {
        score: null,
        risk: 'unknown',
        reports: 0,
      },
    });
  }

  let telecom;

  try {
    telecom = process.env.ABSTRACT_PHONE_API_KEY
      ? await new AbstractTelecomProvider().lookup(phone.e164)
      : await new DevelopmentTelecomProvider().lookup(phone.e164);
  } catch (error) {
    console.error('Falha ao consultar telecom provider:', error);

    telecom = {
      carrierCurrent: null,
      carrierOriginal: null,
      ported: null,
      source: 'unavailable',
      checkedAt: new Date().toISOString(),
      lineType: null,
      providerLocation: null,
      lineStatus: null,
      isVoip: null,
      registration: null,
      risk: null,
      breaches: null,
    };
  }

  // Nem todo TelecomProvider possui a camada de risco.
  // Fazemos o narrowing explicitamente para manter compatibilidade
  // com o provider de desenvolvimento e providers futuros.
  const providerRisk =
    telecom && 'risk' in telecom ? telecom.risk : null;

  return NextResponse.json({
    phone,
    telecom,
    reputation: {
      score: providerRisk?.level ?? null,
      risk: providerRisk?.level ?? 'unknown',
      reports: 0,
    },
    tier: 'free',
  });
}
