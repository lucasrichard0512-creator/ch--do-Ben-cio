# Chá do Benício — versão revisada

Esta versão foi reorganizada para ficar mais próxima da arte de referência enviada.

## O que foi ajustado

- visual recriado em estilo azul/branco com os elementos 3D enviados;
- topo com chamadas principais: lista de presentes, localização e confirmação de presença;
- lista de presentes com quantidade limitada por item;
- se um item acabar (ex.: berço), ele fica indisponível para os próximos convidados;
- item de humor `PS5 Pro` mantido na lista;
- local e horário preenchidos:
  - **19:00h**
  - **Igreja Missão Renovada**
- seção de confirmação de presença simplificada;
- animações suaves de entrada e flutuação.

## Importante sobre a lista de presentes

Sem Supabase configurado, o site entra em **modo demonstração**:
- reservas e confirmações ficam salvas apenas no navegador atual.

Para que todos os convidados vejam a disponibilidade real em tempo real, faça os 3 passos abaixo:

1. crie um projeto no Supabase;
2. execute o arquivo `supabase.sql` no SQL Editor;
3. preencha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` no arquivo `config.js`.

## WhatsApp do rodapé

Se quiser ativar o botão “Peça o seu aqui”, adicione o número no campo:

```js
WHATSAPP_NUMBER: '5562SEUNUMEROAQUI'
```

## Arquivos principais

- `index.html` → estrutura da página
- `styles.css` → layout e animações
- `app.js` → lógica dos presentes, modal e RSVP
- `config.js` → horário, local, links e chaves públicas
- `supabase.sql` → banco e funções RPC


## Refinamento visual v3

- Composição de abertura com os elementos 3D originais do Chá do Benício.
- Botões com proporção corrigida nas telas maiores; botões HTML legíveis no celular.
- Grade de 24 presentes com fotografias recortadas da arte de referência (algumas têm definição limitada por serem recortes da imagem geral).
- Reservas de itens exclusivos como **berço** (1 unidade) bloqueiam a escolha após esgotamento.
- Ursinho decorativo restaurado na confirmação em telas pequenas.
- Arquivos WebP otimizados para reduzir o peso de carregamento das ilustrações.
- Banco SQL compatível com a primeira versão. O item extra `babadores` fica arquivado, sem apagar reservas anteriores.

**Antes de enviar aos convidados:** configure o Supabase em `config.js` e execute o `supabase.sql`. Enquanto não houver uma conexão válida, a tela mostra claramente "Modo demonstração", e convidados em aparelhos diferentes não compartilham disponibilidade. O botão verde de contato no rodapé precisa de um número de WhatsApp em `config.js`.

**Testes realizados:** validação sintática do JavaScript, verificação dos 24 presentes, teste da reserva do berço até esgotamento no modo de demonstração, confirmação de presença e conferência do link do Google Maps. A conexão real ao Supabase não foi testada por depender das credenciais do projeto.
