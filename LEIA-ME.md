# Chá do Benício — V12.0

Esta versão continua o projeto **V10.11.1** e preserva as imagens, textos, cores, piadas e as correções de Safari/Android. As únicas adições visíveis no convite são o campo de WhatsApp e a autorização opcional de lembrete na confirmação de presença.

## Recursos novos

- Reservas e presenças gravadas no Supabase via rotas privadas do Vercel;
- Aviso por e-mail ao organizador para cada reserva de presente e confirmação de presença;
- Painel administrativo com login em `/admin.html`, totais, pesquisas e exportação CSV;
- Lembrete por WhatsApp um dia antes do evento, mediante consentimento e configuração da API oficial da Meta;
- Atualização de confirmação pelo mesmo WhatsApp para evitar contar a mesma pessoa duas vezes.

## Antes de publicar

**LEIA `ATIVACAO-NOTIFICACOES.md`.** O ZIP contém o código, mas as notificações **não funcionam até configurar** Supabase, Vercel, Resend e WhatsApp Business. Sem backend configurado, a lista fica indisponível para reservas reais; o projeto não simula confirmações que outros convidados não enxergam.

Nunca ponha as chaves `sb_secret_`, tokens Meta, chaves Resend ou `CRON_SECRET` em `config.js`/`index.html`. Elas pertencem somente às variáveis privadas do Vercel.

As mensagens agendadas de WhatsApp exigem um modelo previamente aprovado pela Meta. Um link de WhatsApp ou um número pessoal não permite envios automáticos em massa. O endereço de administração deve ficar restrito ao usuário cadastrado no Supabase.

## Testes

Faça uma reserva e uma confirmação reais após a configuração, consulte o painel com o login de administrador, confirme o recebimento do e-mail e verifique o Cron Job do Vercel. Teste também em Android e Safari iPhone para checar a disposição do novo campo, pois não foi possível executar testes em aparelhos físicos neste ambiente.


## Versão V12.1 — lista definitiva recebida em 22/10/2026

Catálogo com 38 tipos e 225 unidades. A lista de presentes e o SQL estão sincronizados e os itens novos têm imagens ilustrativas. Continua exigindo Supabase e variáveis privadas na Vercel para reservas reais. Leia também `ATUALIZACAO-CATALOGO-V12.1.md`.
