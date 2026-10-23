# Chá do Benício — Ativação das notificações (V12)

A V12 preserva a arte da V10.11.1 e acrescenta infraestrutura de dados e notificações. **Publicar o ZIP, sozinho, NÃO ativa os envios.** É necessário configurar Supabase, e-mail (Resend), WhatsApp Business API e Vercel.

## O que funciona depois de configurar

- Reserva real de presente: impede estourar a quantidade; salva quem reservou, qual item, quantas unidades e quando.
- RSVP real: registra nome, WhatsApp, acompanhantes, recado, consentimento de lembrete e data; a mesma pessoa pode atualizar a confirmação usando o mesmo número.
- Avisos ao organizador: e-mail com detalhes de cada nova reserva e confirmação/atualização, via Resend.
- Painel privado: `https://SEU-DOMINIO/admin.html`, com login, totais, tabela, busca e exportação CSV.
- Lembrete: Vercel Cron agenda uma verificação diária às **12:00 UTC (09:00 no horário de Brasília)**; em **27 de novembro de 2026**, dispara a mensagem de WhatsApp previamente aprovada para cada convidado com consentimento (uma solicitação por confirmação). O horário no plano gratuito do Vercel pode variar dentro dessa hora.

### 1. Supabase

1. Crie um projeto em https://supabase.com ou abra o projeto já existente.
2. Em SQL Editor, execute o arquivo `supabase.sql` **inteiro**, sem apagar os dados existentes. O SQL cria as novas colunas de telefone, tabelas de auditoria e funções protegidas.
3. Em Authentication > Users, crie seu usuário de administrador com e-mail e senha. Preferencialmente, crie o usuário diretamente no painel administrativo do Supabase, não pelo formulário público.
4. No SQL Editor execute **separadamente**, substituindo pelo seu e-mail (o mesmo de Authentication):

```sql
INSERT INTO public.admin_users(user_id)
SELECT id FROM auth.users WHERE email = 'seu-email@provedor.com'
ON CONFLICT (user_id) DO NOTHING;
```

5. Em Project Settings > API Keys, copie a Project URL, uma chave **publishable** (`sb_publishable_...`) e uma chave **secret** (`sb_secret_...`). A secret **NUNCA** deve entrar em HTML, JavaScript público, nem no arquivo `config.js`.

### 2. Vercel

Publique a pasta `cha-do-benicio` como diretório raiz do projeto Vercel (de modo que `index.html`, `vercel.json`, `admin.html` e `api/` fiquem na raiz publicada). Em Settings > Environment Variables, para Production, cadastre:

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase (`https://....supabase.co`) |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` (SOMENTE no Vercel) |
| `OWNER_EMAIL` | Seu e-mail para receber os avisos |
| `RESEND_API_KEY` | Chave API da Resend |
| `EMAIL_FROM` | Remetente de um domínio de envio **verificado** na Resend, ex.: `Chá do Benício <avisos@seudominio.com>` |
| `CRON_SECRET` | Senha aleatória longa (preferencialmente 32+ caracteres) para proteger os lembretes |
| `META_WHATSAPP_TOKEN` | Token válido da API oficial WhatsApp Business |
| `META_PHONE_NUMBER_ID` | ID do número remetente WhatsApp Business |
| `WHATSAPP_TEMPLATE_NAME` | Nome **exato** do template aprovado, ex.: `lembrete_cha_benicio` |
| `META_GRAPH_VERSION` | Opcional; ex. `v24.0`, conforme versão suportada na sua conta |

Se já tem chaves antigas, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` também são compatíveis, porém prefira as novas. Clique em **Redeploy** depois de adicionar variáveis.

**Não adicione esses segredos em `config.js`, GitHub público ou arquivos enviados aos convidados.**

### 3. Resend (avisos por e-mail)

1. Crie a conta em https://resend.com.
2. Verifique um domínio próprio em Domains (necessário para enviar notificações de produção a qualquer endereço).
3. Copie uma API Key e configure `RESEND_API_KEY`, `OWNER_EMAIL` e `EMAIL_FROM` nas variáveis do Vercel.
4. Faça uma reserva de teste; confira o e-mail e o painel em `admin.html` > Status das notificações.

O status **accepted** significa que a Resend aceitou a solicitação, não necessariamente que o e-mail chegou à caixa de entrada. Se o envio estiver sem configuração, a reserva ainda é feita, mas o aviso não é enviado. O painel registrará esse status.

### 4. WhatsApp (lembrete aos convidados)

**Um WhatsApp pessoal, WhatsApp Business app ou simples link `wa.me` NÃO envia mensagens em lote automaticamente.** Para o lembrete automático é obrigatório usar a API oficial WhatsApp Business, com permissões e um modelo de mensagem aprovado pela Meta (pode envolver custos por conversa/modelo).

1. Prepare a conta WhatsApp Business Platform/Cloud API da Meta e o número remetente.
2. Cadastre um modelo com categoria adequada (ex.: `UTILITY`) no idioma **pt_BR**, com **uma variável no corpo (`{{1}}`) para o primeiro nome**. Exemplo de texto para aprovação:

> Oi, {{1}}! 💙 Seu lembrete do Chá do Benício: esperamos você amanhã, 28/11/2026, às 19h, na Igreja Missão Renovada, Rua 6, Setor Eliziário, São Miguel do Araguaia - GO. Até lá!

3. Aguarde aprovação do modelo e configure `META_WHATSAPP_TOKEN`, `META_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME` e (se necessário) `META_GRAPH_VERSION` no Vercel.
4. Teste primeiro com um telefone seu que tenha autorizado mensagens de teste. Para testar antes de 27/11, use um ambiente de teste e uma cópia temporária com data de evento apropriada; **não altere a data de produção**.

Os lembretes só serão enviados a quem **informou WhatsApp e marcou voluntariamente a opção de receber**. Registros antigos, anteriores à V12, não contêm telefone nem consentimento e **não podem receber lembretes sem atualização**.

### 5. Painel de acompanhamento

Acesse `https://SEU-DOMINIO/admin.html` e entre com o usuário criado em Supabase Authentication. Se alguém abrir esse endereço sem seu login autorizado, **não poderá visualizar os dados**. Não divulgue sua senha.

No painel você pode conferir:
- Quem confirmou presença, número de pessoas, telefone e observação;
- Quem reservou cada presente e a quantidade;
- Totais e exportação CSV;
- Status de cada notificação ao organizador e do lembrete automático.

### 6. Antes de divulgar

- [ ] Confirmar que `/api/gifts` carrega o catálogo real, sem dados locais de demonstração.
- [ ] Reservar um presente em um celular e conferir se o estoque foi atualizado em outro.
- [ ] Confirmar presença com WhatsApp e consentimento opcional.
- [ ] Ver registro e telefone no `admin.html`.
- [ ] Conferir recebimento de aviso por e-mail.
- [ ] Verificar se a automação `/api/reminders` aparece em Vercel > Cron Jobs (produção).
- [ ] Verificar modelo do WhatsApp aprovado e variáveis privadas configuradas.

### Notas de privacidade e segurança

O telefone informado é usado para organização da lista e, com consentimento, para lembrete. Não exporte ou compartilhe a lista desnecessariamente. A página do painel não expõe nomes/telefones a visitantes; sua API exige login de administrador e usa as chaves secret somente no servidor. A confirmação pública não deve ser interpretada como garantia de entrega de e-mail/WhatsApp: mensagens podem ser bloqueadas pelo provedor, falhar por opt-out, ou por token/template não configurados.

**Segurança adicional para lançamento público:** considere implementar CAPTCHA/Turnstile e limite de solicitações para reduzir inscrições automatizadas; esta versão valida dados, mas não oferece proteção completa contra spam.
