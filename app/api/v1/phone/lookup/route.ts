import { NextRequest, NextResponse } from 'next/server';
import { normalizeBrazilPhone } from '@/lib/phone/normalize';
import { DevelopmentTelecomProvider } from '@/lib/providers/telecom/provider';
import { AbstractTelecomProvider } from '@/lib/providers/telecom/abstract';
import { createAuthenticatedServerClient, createPublicServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (typeof body.phone !== 'string') {
    return NextResponse.json({ error: 'Telefone obrigatório' }, { status: 400 });
  }

  const phone = normalizeBrazilPhone(body.phone);

  if (!phone.valid || !('e164' in phone) || !phone.e164) {
    return NextResponse.json({
      phone,
      telecom: null,
      technicalRisk: null,
      communityReputation: {
        score: null,
        totalReports: 0,
        positive: 0,
        negative: 0,
        dominantCategory: null,
      },
      tier: 'free',
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

  const technicalRisk =
    telecom && 'risk' in telecom
      ? {
          level: telecom.risk?.level ?? null,
          disposable: telecom.risk?.disposable ?? null,
          abuseDetected: telecom.risk?.abuseDetected ?? null,
          lineStatus: 'lineStatus' in telecom ? telecom.lineStatus ?? null : null,
          isVoip: 'isVoip' in telecom ? telecom.isVoip ?? null : null,
        }
      : {
          level: null,
          disposable: null,
          abuseDetected: null,
          lineStatus: null,
          isVoip: null,
        };

  let communityReputation = {
    score: null as number | null,
    totalReports: 0,
    positive: 0,
    negative: 0,
    dominantCategory: null as string | null,
  };

  try {
    const supabase = createPublicServerClient();

    const { data: phoneRow } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('e164', phone.e164)
      .maybeSingle();

    if (phoneRow?.id) {
      const { data: rep } = await supabase
        .from('phone_reputation')
        .select('community_score,total_reports,total_positive,total_negative,dominant_category')
        .eq('phone_id', phoneRow.id)
        .maybeSingle();

      if (rep) {
        communityReputation = {
          score: rep.community_score,
          totalReports: rep.total_reports ?? 0,
          positive: rep.total_positive ?? 0,
          negative: rep.total_negative ?? 0,
          dominantCategory: rep.dominant_category ?? null,
        };
      }
    }
  } catch (error) {
    console.error('Falha ao consultar reputação comunitária:', error);
  }

  // Se houver sessão autenticada, registra esta consulta no histórico do usuário.
  // Consultas anônimas continuam funcionando normalmente e não geram histórico pessoal.
  const authorization = req.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    try {
      const authSupabase = createAuthenticatedServerClient(token);
      const { data: userData } = await authSupabase.auth.getUser(token);
      if (userData.user) {
        const { error: historyError } = await authSupabase.rpc('record_authenticated_lookup', {
          p_e164: phone.e164,
          p_ddd: phone.ddd ?? null,
          p_state: phone.state ?? null,
          p_line_type: phone.lineType ?? null,
          p_carrier_current: telecom?.carrierCurrent ?? null,
          p_status: 'success',
        });
        if (historyError) console.error('Falha ao registrar histórico:', historyError);
      }
    } catch (historyError) {
      console.error('Falha ao registrar histórico:', historyError);
    }
  }

  return NextResponse.json({
    phone,
    telecom,
    technicalRisk,
    communityReputation,
    tier: 'free',
  });
}
