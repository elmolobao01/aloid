'use client';

import { FormEvent, useMemo, useState } from 'react';

type LookupResponse = {
  phone?: {
    valid?: boolean;
    e164?: string;
    national?: string;
    ddd?: string;
    state?: string;
    region?: string;
    lineType?: string;
  };
  telecom?: {
    carrierCurrent?: string | null;
    carrierOriginal?: string | null;
    ported?: boolean | null;
    source?: string | null;
    checkedAt?: string | null;
  } | null;
  reputation?: {
    score?: number | null;
    risk?: string | null;
    reports?: number | null;
  };
  tier?: string;
  error?: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}

function formatBrazilPhone(value: string) {
  const digits = onlyDigits(value);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function riskLabel(risk?: string | null) {
  if (!risk || risk === 'unknown') return 'Sem classificação';
  if (risk === 'low') return 'Baixo risco';
  if (risk === 'medium') return 'Risco moderado';
  if (risk === 'high') return 'Alto risco';
  return risk;
}

function lineTypeLabel(lineType?: string) {
  if (lineType === 'mobile') return 'Celular';
  if (lineType === 'landline') return 'Fixo';
  return lineType || 'Não identificado';
}

export default function PhoneLookup() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const digits = useMemo(() => onlyDigits(phone), [phone]);
  const canSubmit = digits.length === 10 || digits.length === 11;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/v1/phone/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });

      const data = (await response.json()) as LookupResponse;
      setResult(data);
    } catch {
      setResult({ error: 'Não foi possível concluir a consulta agora.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: 26 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr auto',
            gap: 12,
            alignItems: 'stretch',
          }}
        >
          <button
            type="button"
            aria-label="País selecionado: Brasil"
            title="Consultas inicialmente disponíveis para números brasileiros"
            style={{
              border: '1px solid rgba(72, 138, 210, .45)',
              borderRadius: 16,
              background: 'rgba(8, 24, 43, .95)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              padding: '0 16px',
              minHeight: 58,
              cursor: 'default',
            }}
          >
            🇧🇷 +55
          </button>

          <input
            value={phone}
            onChange={(event) => setPhone(formatBrazilPhone(event.target.value))}
            inputMode="tel"
            autoComplete="tel"
            placeholder="(DDD) 9XXXX-XXXX"
            aria-label="Número de telefone brasileiro"
            style={{
              minHeight: 58,
              border: '1px solid rgba(72, 138, 210, .45)',
              borderRadius: 16,
              background: 'rgba(8, 24, 43, .95)',
              color: '#fff',
              padding: '0 18px',
              fontSize: 18,
              fontWeight: 700,
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              minHeight: 58,
              border: 0,
              borderRadius: 16,
              padding: '0 24px',
              fontWeight: 900,
              letterSpacing: '.02em',
              color: '#fff',
              background: canSubmit
                ? 'linear-gradient(135deg, #20c7f5, #5a50ff)'
                : 'rgba(105, 127, 155, .35)',
              cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 10px 30px rgba(62, 102, 255, .18)' : 'none',
            }}
          >
            {loading ? 'CONSULTANDO...' : 'IDENTIFICAR'}
          </button>
        </div>

        <p
          style={{
            margin: '10px 4px 0',
            color: '#8ea9c7',
            fontSize: 13,
          }}
        >
          Consultas inicialmente disponíveis para números brasileiros.
        </p>
      </form>

      {result?.error && (
        <div
          style={{
            border: '1px solid rgba(239, 90, 90, .35)',
            background: 'rgba(80, 20, 28, .35)',
            borderRadius: 18,
            padding: 18,
            color: '#ffd5d5',
          }}
        >
          {result.error}
        </div>
      )}

      {result && !result.error && result.phone && (
        <div
          style={{
            border: '1px solid rgba(72, 138, 210, .35)',
            background:
              'linear-gradient(180deg, rgba(7, 25, 45, .98), rgba(5, 17, 31, .98))',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 24px 60px rgba(0, 0, 0, .18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              paddingBottom: 20,
              borderBottom: '1px solid rgba(105, 153, 205, .18)',
            }}
          >
            <div>
              <div style={{ color: '#7dcfff', fontSize: 13, fontWeight: 800 }}>
                RESULTADO DA CONSULTA
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: '#fff',
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: '-.02em',
                }}
              >
                {result.phone.national || formatBrazilPhone(digits)}
              </div>
              <div style={{ marginTop: 6, color: '#91a9c2', fontSize: 14 }}>
                {result.phone.e164 || `+55${digits}`}
              </div>
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: '9px 14px',
                background: result.phone.valid
                  ? 'rgba(48, 210, 149, .12)'
                  : 'rgba(239, 90, 90, .12)',
                border: result.phone.valid
                  ? '1px solid rgba(48, 210, 149, .35)'
                  : '1px solid rgba(239, 90, 90, .35)',
                color: result.phone.valid ? '#69e8b3' : '#ff9c9c',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {result.phone.valid ? '✓ Número válido' : 'Número inválido'}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 14,
              marginTop: 20,
            }}
          >
            <InfoCard
              label="TIPO DE LINHA"
              value={lineTypeLabel(result.phone.lineType)}
              detail={`DDD ${result.phone.ddd || '—'}`}
            />
            <InfoCard
              label="LOCALIZAÇÃO"
              value={result.phone.region || 'Não identificada'}
              detail={result.phone.state ? `UF ${result.phone.state}` : 'Brasil'}
            />
            <InfoCard
              label="OPERADORA ATUAL"
              value={result.telecom?.carrierCurrent || 'Aguardando integração'}
              detail={
                result.telecom?.carrierCurrent
                  ? 'Consulta telecom'
                  : 'Provider telecom ainda não conectado'
              }
            />
            <InfoCard
              label="PORTABILIDADE"
              value={
                result.telecom?.ported === true
                  ? 'Sim'
                  : result.telecom?.ported === false
                    ? 'Não'
                    : 'Não verificada'
              }
              detail={
                result.telecom?.carrierOriginal
                  ? `Origem: ${result.telecom.carrierOriginal}`
                  : 'Sem histórico disponível'
              }
            />
            <InfoCard
              label="REPUTAÇÃO ALÔ ID"
              value={riskLabel(result.reputation?.risk)}
              detail={`${result.reputation?.reports ?? 0} avaliações`}
            />
          </div>

          <div
            style={{
              marginTop: 18,
              borderRadius: 16,
              padding: '14px 16px',
              background: 'rgba(20, 54, 86, .32)',
              color: '#93acc5',
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            A operadora atual, portabilidade e reputação serão enriquecidas à medida
            que os respectivos providers forem ativados. O ALÔ ID não apresenta
            informações não verificadas como se fossem dados confirmados.
          </div>
        </div>
      )}
    </section>
  );
}

function InfoCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(72, 138, 210, .26)',
        borderRadius: 18,
        padding: 18,
        background: 'rgba(10, 29, 50, .68)',
        minHeight: 118,
      }}
    >
      <div
        style={{
          color: '#6fcfff',
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '.08em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          color: '#fff',
          fontSize: 20,
          fontWeight: 850,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          color: '#829bb5',
          fontSize: 13,
          lineHeight: 1.35,
        }}
      >
        {detail}
      </div>
    </div>
  );
}
