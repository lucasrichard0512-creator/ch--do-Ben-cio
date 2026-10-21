# Chá do Benício — Versão 6

## Novidades

- Primeira seção com altura mínima de uma tela no celular, mostrando só o convite.
- Navegação por seções: abertura, lista de presentes, nosso encontro, confirmação de presença e rodapé.
- Scroll suave com encaixe leve no celular (`scroll-snap-type: proximity`), sem obrigar o visitante a parar em cada bloco.
- Cena do encontro recomposta com mapa, plaquinha, nuvens contínuas e balões.
- Cena da confirmação unificada com ursinho, nuvens, balões e formulário.
- Melhorias de espaçamento em celulares e tablets.
- 24 presentes, incluindo o PS5 Pro como piada e o berço limitado a uma unidade.

## Testes realizados

Simulação no navegador em 320×700, 390×844, 430×932 e 900×800.
Checagens: sem rolagem horizontal, 24 cartões, sem erros de JavaScript,
reserva do berço até esgotar a unidade e confirmação de presença em modo demonstração.
Não houve teste em iPhone físico.

## Informações do evento

- Data: sábado, 28 de novembro de 2026
- Hora: 19h00
- Local: Igreja Missão Renovada, Rua 6, Setor Eliziário, São Miguel do Araguaia - GO
- Maps: https://maps.app.goo.gl/pSpLkEZZSyKzMFrK9?g_st=ic

## Atenção antes de publicar para convidados

**Reservas compartilhadas:** sem configurar Supabase, o convite funciona apenas em modo demonstração local. Para ativar reservas entre vários aparelhos, crie um projeto Supabase, execute `supabase.sql` no SQL Editor e preencha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` em `config.js`. Não coloque service_role/secret no navegador.

**WhatsApp:** informe seu número de contato em `WHATSAPP_NUMBER` no arquivo `config.js` se quiser que o botão verde do rodapé abra o WhatsApp.

**Publicação:** os arquivos precisam ser enviados ao projeto hospedado no Vercel. A edição do ZIP não altera o site que já está no ar.

## Estrutura

- `index.html` — marcação de seções e componentes
- `styles.css` — estilos gerais
- `mobile.css` — estilos para tablets e celulares
- `app.js` — interações, lista de presentes e confirmação de presença
- `config.js` — evento e integrações
- `supabase.sql` — banco de dados para reservas reais
- `assets/` — imagens e ícones
