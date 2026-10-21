# Chá do Benício — V7

## Abrir sem instalar nada
Abra `Convite-Benicio-V7-Abrir.html` no navegador. Ele contém o design e as imagens no próprio arquivo.

## Estrutura editável
- `index.html`: estrutura e formulários.
- `styles.css`: comportamento visual e adaptação para celulares.
- `app.js`: catálogo, limites de presentes, formulários e reservas.
- `assets/referencia-exata.png`: arte aprovada, usada na visualização ampla para máxima fidelidade.
- `assets/`: título, urso e fotos dos 25 presentes para o layout responsivo.
- `config.js`: dados ainda pendentes, banco de dados e WhatsApp.
- `supabase.sql`: tabelas, permissões e função de reserva.

## Fidelidade da referência
Na tela ampla (largura 700px ou maior), a imagem aprovada permanece inteira como composição e recebe botões/controles HTML clicáveis sobre ela. O presente extra 'Kit de babadores' foi incluído no espaço livre da quarta linha, preservando os demais itens. Em telas pequenas o layout é reconstruído com os mesmos elementos e cores, mas os cards são organizados em duas colunas para não deixar os nomes ilegíveis. Portanto a versão mobile é **responsiva**, não uma miniatura pixel a pixel da arte.

## Quantidades, confirmação e dados pessoais
- A lista inclui 25 presentes. Berço, carrinho, bebê conforto e cômoda aparecem antes do PS5, que fica por último.
- A seleção de presente pergunta o nome do convidado e a quantidade a reservar.
- Confirmação de presença pede apenas **nome** e **observação opcional**, sem quantidade de convidados.
- A observação pode ser usada para informar circunstâncias, por exemplo a intenção de levar acompanhante. Isso **não significa que convidados extras foram aprovados**.
- Em demonstração, dados são guardados apenas no navegador, e não sincronizam entre aparelhos.
- Para reservas de verdade, crie um projeto Supabase, execute `supabase.sql` no SQL Editor e configure a URL e a chave **pública** anon no `config.js`. Nunca insira chave `service_role` no site.
- O sistema usa a função SQL `reserve_gift`, que bloqueia o registro do presente durante a reserva e impede ultrapassar a quantidade.
- Até conectar o Supabase, não compartilhe como se fosse uma lista de presentes ativa.

## Informações a preencher
Em `config.js`, configure `EVENT_TIME`, `EVENT_PLACE`, `MAPS_URL` e `WHATSAPP` quando forem definidos. Neste momento, horário/endereço e número do WhatsApp estão vazios. O botão de WhatsApp mostra uma mensagem enquanto o número não está cadastrado.

## Publicação
Faça upload do projeto para Vercel, Netlify ou outro servidor estático. Essa entrega cria **arquivos**, não altera automaticamente qualquer site que você já tenha publicado.
