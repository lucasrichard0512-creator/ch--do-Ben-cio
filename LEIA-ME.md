# Chá do Benício — Versão 6

Esta versão foi reconstruída para o celular, com urso 3D sem moldura, paleta predominantemente azul, lista única de presentes com fotografias ilustrativas recortadas individualmente, “Nosso encontro” redesenhado e confirmação simplificada.

## Como abrir
Abra `index.html` em um navegador. O site também pode ser publicado em uma hospedagem estática como Vercel ou Netlify. Mantenha os arquivos `styles.css`, `app.js`, `config.js` e a pasta `assets/` ao lado do HTML.

## Reservas compartilhadas entre os convidados
O site **funciona como demonstração** sem banco de dados: reservas e respostas ficam apenas no navegador local, portanto **não sincronizam entre dispositivos**. Antes de compartilhar o link real:

1. Crie um projeto em [Supabase](https://supabase.com/).
2. Execute `supabase.sql` no SQL Editor do seu projeto.
3. Abra `config.js` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` (chave pública).
4. Publique todos os arquivos. A função de reserva usa bloqueio transacional para impedir que duas pessoas escolham o último item simultaneamente.

As reservas e respostas serão gravadas no Supabase. No painel privado do projeto é possível consultar `gift_reservations` e `rsvps`. Quem visita o convite só vê a quantidade que falta.

## Campos que ficaram pendentes
Em `config.js` preencha, quando souber:
- `EVENT_TIME`: horário do chá.
- `EVENT_PLACE`: local/endereço.
- `MAPS_URL`: endereço do Google Maps.
- `WHATSAPP`: número com DDI e DDD, apenas números (por exemplo `5562999999999`) para o contato comercial do papai.

Sem número de WhatsApp, o rodapé mostra um aviso ao clicar. Sem horário/endereço, o convite mostra **A confirmar**. A data é **sábado, 28/11/2026**.

## Antes de publicar
- Revise a ortografia e disponibilidade dos 25 presentes.
- Os produtos são imagens ilustrativas, não anúncios de marcas; substitua por fotos oficiais se quiser fidelidade a modelos específicos.
- Confira as políticas de privacidade aplicáveis à coleta de nome dos convidados.
- Faça um teste real de reserva em dois aparelhos depois de conectar o Supabase.
