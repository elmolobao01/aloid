# ALÔ ID — Sprint 0.1 Core
MVP API-first para consulta de números brasileiros.

## Executar
1. `npm install`
2. copie `.env.example` para `.env.local`
3. `npm run dev`

## Banco
Execute `supabase/schema.sql` no SQL Editor do Supabase.

## Estado atual
- Web Next.js
- endpoint `POST /api/v1/phone/lookup`
- normalização +55 e validação
- DDD/UF inicial
- provider telecom desacoplado (modo development)
- schema para números, identidade mascarada, reputação, cache, consultas, créditos e auditoria

Operadora atual não é inventada: permanece `null` até a conexão de um provider real.
