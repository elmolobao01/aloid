# ALÔ ID Mobile 0.3.0 — Development Build

Esta versão migra o projeto do Expo Go para um Development Build próprio.

## O que muda
- `expo-dev-client` passa a fazer parte do app.
- `development` e `preview` geram APK instalável.
- `production` fica preparado para Android App Bundle (`.aab`).
- O aplicativo continua usando as mesmas APIs, Supabase, histórico, Perfil e Proteção.

## Importante
O CallScreeningService ainda NÃO é ativado nesta versão.
A próxima etapa nativa adicionará o serviço Android e o pedido de ROLE_CALL_SCREENING.

A separação é intencional: primeiro homologamos o APK próprio; depois conectamos
a triagem real de chamadas sem misturar problemas de build com problemas de telefonia.

## Primeiro build Android
Na pasta `mobile`:

1. Atualize dependências:
   `npm install`

2. Instale a CLI do EAS, se necessário:
   `npm install -g eas-cli`

3. Entre na sua conta Expo:
   `eas login`

4. Configure o projeto EAS:
   `eas build:configure`

5. Gere APK de desenvolvimento:
   `eas build --platform android --profile development`

Ao concluir, o EAS fornece um endereço/QR Code para instalar o APK no aparelho.

## Depois de instalar o APK
Execute no computador:
`npx expo start --dev-client`

Abra o ALÔ ID instalado e conecte ao Metro.

## Próxima fase
- Android `CallScreeningService`
- solicitação do papel `ROLE_CALL_SCREENING`
- leitura do número recebido pelo Android Telecom
- motor local de decisão com limite de 5 segundos
- prioridade: confiáveis > lista negra > contatos > regras premium > desconhecidos
- reporte pós-chamada apenas para desconhecidos/suspeitos
