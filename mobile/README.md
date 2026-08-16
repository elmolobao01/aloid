# ALÔ ID Mobile 0.1.0

Aplicativo móvel inicial do ALÔ ID, compartilhando Supabase Auth, APIs, histórico e conta com a versão web.

## Requisitos
- Node.js
- Expo Go compatível com SDK 54 para o primeiro teste, ou development build.
- Projeto Supabase do ALÔ ID já existente.

## Configuração
1. Copie `.env.example` para `.env`.
2. Preencha:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `EXPO_PUBLIC_API_URL=https://aloid.vercel.app`
3. No Supabase Auth > URL Configuration, mantenha o endereço web e adicione:
   - `aloid://**`
4. Instale:
   - `npm install`
5. Execute:
   - `npx expo start`

## Primeira versão móvel
- Consulta de números brasileiros
- Resultado telecom e risco técnico
- Login/cadastro com Supabase
- Histórico sincronizado com web
- Perfil e métricas da conta
- Aba Proteção preparada para a integração nativa futura

## Próxima fase nativa
Identificação e bloqueio durante chamadas exigirão development builds e APIs nativas específicas de Android/iOS; não serão implementadas apenas com Expo Go.
