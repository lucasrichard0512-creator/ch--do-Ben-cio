# Chá do Benício — Versão 5 (responsividade revisada)

Esta versão parte da V4 e corrige a disposição das seções especificamente para celulares, mantendo a arte azul e o catálogo.

## Melhorias de responsividade

- Arquivo `mobile.css` separado com ajustes para larguras de 320, 375, 390, 430, 768 e 1200 px.
- Título do Benício inteiramente visível; mamadeira e berço decorativos escondidos **somente na abertura mobile**, para evitar sobreposições.
- Navegação em dois níveis no celular: lista de presentes destacada e os outros dois botões lado a lado, todos com área de toque ampliada.
- Lista de presentes com 2 colunas legíveis e sem estouro lateral, cartões nítidos em SVG.
- Local e horário empilhados e legíveis; mapa e plaquinha continuam lado a lado como decoração.
- Formulário ocupando a largura do celular, campos com fonte de 16 px para evitar zoom automático no iPhone. O ursinho fica ao lado do botão de confirmação.
- Rodapé simplificado no celular.
- Suporte à preferência do aparelho por movimento reduzido.

**Verificação feita:** prévias automatizadas em navegador Chromium nas larguras 320, 375, 390, 430, 768 e 1200 px, sem rolagem horizontal nem erros de JavaScript. Reserva de berço, seleção de 2 unidades de fralda e RSVP foram testados em modo demonstração. Isso não equivale a um teste final em Safari de um iPhone físico.


## Informações do evento

- Dia: 28 de novembro de 2026 (sábado)
- Horário: 19:00h
- Local: Igreja Missão Renovada, Rua 6, Setor Eliziário, São Miguel do Araguaia - GO
- Mapa: https://maps.app.goo.gl/pSpLkEZZSyKzMFrK9?g_st=ic

## Imagens dos presentes

Os recortes minúsculos e borrados da referência **não estão mais em uso**. O catálogo usa agora **ilustrações SVG nítidas, individuais e escaláveis** para 22 produtos, feitas no mesmo tom azul/creme do site. Para mamadeira e berço são usados os dois elementos 3D enviados pelo usuário.

Isso melhora bastante a qualidade no celular, mas **não equivale a fotografias reais em alta resolução**. Para uma reprodução fotográfica perfeita da referência, as fotografias individuais de cada produto precisariam ser fornecidas ou licenciadas separadamente. Substitua o caminho `image` correspondente em `app.js` quando tiver as fotos definitivas.

## Reservas reais entre convidados

O ZIP ainda está em modo demonstração, porque você não forneceu um projeto Supabase. Nesse modo, as escolhas são guardadas somente no próprio navegador, sem sincronização entre aparelhos. **Não publique como sistema de reservas compartilhadas antes de conectar o banco.**

Para ativar:

1. Crie ou abra um projeto no Supabase.
2. No SQL Editor, execute `supabase.sql`. O arquivo mantém as reservas antigas ao atualizar o catálogo.
3. No arquivo `config.js`, preencha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` (somente chave pública; nunca uma secret/service_role).
4. Publique a pasta `cha-do-benicio` no Vercel. Teste reserva simultânea em dois celulares.

No banco, a função de reservar presente bloqueia a linha do presente enquanto confirma a reserva, impedindo que duas pessoas peguem a última unidade ao mesmo tempo.

## Botão de WhatsApp no rodapé

Preencha `WHATSAPP_NUMBER` no `config.js` com país + DDD + número. Exemplo de formato: `5562999999999` (é somente um exemplo). Sem isso, o botão informa que o contato ainda precisa ser configurado.

## Alterações no projeto

- `index.html`: composição e ícones azuis customizados em SVG.
- `styles.css`: estilos principais e paisagens decorativas.
- `mobile.css`: correções para telas pequenas e intermediárias.
- `app.js`: lista de presentes e reserva/RSVP, com 24 itens.
- `assets/gifts/*.svg`: ilustrações locais com boa nitidez, sem nomes duplicados.
- `config.js`: informações do evento e integrações.
- `supabase.sql`: estrutura para reservas e confirmações.

> Para atualizar um site já publicado no Vercel, substitua os arquivos do projeto e faça um novo deploy. Trocar só o ZIP local não muda o site publicado.
