# Chá do Benício — Reconstrução Visual (V7)

## O que foi reconstruído

Esta versão substitui a estética de página branca e caixas independentes por uma composição infantil integrada, inspirada na referência enviada.

- Abertura com um cenário de quarto infantil, ursinho de alta qualidade, nome original em 3D e elementos decorativos posicionados em profundidade.
- A primeira tela do celular é dedicada ao convite, com a lista aparecendo apenas ao rolar.
- Rolagem por capítulos: convite, lista de presentes, nosso encontro e confirmação de presença.
- Mapa, plaquinha, nuvens e balões unidos em uma cena; imagens e formulário integrados na confirmação.
- Ícones azuis desenhados, em vez de emojis do sistema, nas ações principais.
- Imagens dos presentes recortadas da referência, com seus nomes fora das fotografias; para o berço e mamadeira foram utilizadas as artes individuais de alta resolução enviadas.
- 24 presentes, seletores de quantidade e bloqueio de unidades já reservadas. O PS5 Pro permanece como brincadeira.
- Data: **sábado, 28 de novembro de 2026, às 19h**, na **Igreja Missão Renovada**. O botão do Google Maps aponta para o link fornecido.

## Antes de compartilhar com os convidados

### 1. Ativar o controle de presentes para todos os celulares

Sem banco conectado, o convite funciona **somente em modo demonstração**. Uma reserva local não bloqueia o mesmo presente no navegador de outra pessoa.

1. Crie um projeto em **Supabase**.
2. No SQL Editor, execute o conteúdo do arquivo `supabase.sql`.
3. Em `config.js`, preencha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`.
4. Publique novamente o projeto e teste a reserva do berço em dois dispositivos.

Não coloque chaves `service_role`, segredos ou senhas no arquivo `config.js`.

### 2. Configuração do WhatsApp (opcional)

Adicione o número com DDI 55 e DDD no campo `WHATSAPP_NUMBER` de `config.js`. Enquanto estiver vazio, o botão informa que falta configurar o contato.

### 3. Publicação

O projeto é **HTML, CSS e JavaScript puro**, sem etapa de build. É possível publicá-lo como projeto estático no Vercel, Netlify ou qualquer hospedagem estática. Envie os arquivos da pasta `cha-do-benicio`, preservando o diretório `assets`.

## Fidelidade e limitações

As artes principais são as fornecidas pelo usuário. As fotografias dos presentes que não tinham arquivo individual foram recortadas da imagem de referência. Como essa imagem original tem resolução limitada, elas não serão tão nítidas quanto fotos individuais em alta resolução. No futuro, é possível substituir cada arquivo em `assets/gifts/` mantendo o mesmo nome para melhorar a nitidez sem alterar o código.

O site mantém as seções e elementos interativos separados da arte; não é uma imagem estática com botões falsos.

## Arquivos

- `index.html` — estrutura do convite
- `styles.css` — visual desktop e elementos artísticos
- `mobile.css` — composição e responsividade móvel
- `app.js` — presentes, reservas, RSVP e interações
- `config.js` — data, local, mapas, WhatsApp, Supabase
- `supabase.sql` — banco de dados e operações atômicas de reserva
- `assets/` — artes e recortes
