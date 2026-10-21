# Chá do Benício · V9 — Site interativo com objetos 3D reais

## Como visualizar

- Abra `Convite-Benicio-3D-V9.html` no navegador. Ele reúne HTML, CSS e JavaScript em um arquivo, sem recortes de imagens da arte de referência.
- Ou publique o conteúdo desta pasta em Vercel, Netlify ou hospedagem estática. O arquivo inicial é `index.html`.
- Modelos tridimensionais são formados programaticamente por polígonos, materiais, iluminação e câmera com WebGL e fallback Canvas 2D, sem depender de texturas de uma montagem pronta. Os produtos são renderizados em tempo de execução a partir dos modelos 3D.
- As tipografias externas (Google Fonts) podem usar o fallback da plataforma se estiver sem internet.

## Entregue

- Urso 3D com laço, coração e coroa, cenário com balões, nuvens e berço.
- 25 produtos 3D com fotos/renderizações produzidas pelo navegador, em lista única.
- Presentes especiais apenas no final: berço, carrinho, bebê conforto, cômoda; PS5 Pro é o último item, com piada do papai.
- Seleção do presente, escolha da quantidade, pedido de nome e bloqueio quando atingir o limite.
- Seção de localização/horário, por enquanto `A confirmar`, sem endereço fictício.
- Confirmação com nome e observação opcional, sem selecionar número de pessoas.
- Rodapé com recadinho e link de contato.
- Responsividade para celular, tablet e desktop e suporte a `prefers-reduced-motion`.

## Publicação com reservas sincronizadas (obrigatório antes de compartilhar com convidados)

**Atenção:** sem conexão ao banco de dados, a demonstração registra reservas apenas no navegador atual. Não significa que alguém em outro aparelho verá a reserva. Não distribua o convite como definitivo sem configurar isto.

1. Crie um projeto próprio no Supabase.
2. No `SQL Editor`, execute o conteúdo de `supabase.sql` (cria inventário, reservas, confirmação, permissões e função de reserva atômica para evitar duplicidade).
3. Em `config.js`, preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`. A **anon key** é chave pública, mas nunca coloque uma `service_role` no frontend.
4. Atualize `WHATSAPP` com DDI, DDD e número de contato, sem caracteres de formatação.
5. Assim que souber, preencha `EVENT_TIME`, `EVENT_ADDRESS` e `MAPS_URL` com o link real do mapa.
6. Publique os arquivos por HTTPS e teste uma reserva em dois aparelhos. A consulta atualiza a disponibilidade a cada 30 segundos e imediatamente após a reserva; a função SQL evita que duas pessoas reservem o último item ao mesmo tempo.

**Privacidade:** o link público não mostra nomes de quem reservou presentes. O banco armazena nomes e observações para consulta privada pelos organizadores. Avalie controles antispam e política de retenção antes de lançar publicamente.

## Editar

- `styles.css`: cores, cartões, layout e tipografia.
- `engine3d.js`: geometria e cores dos modelos 3D e luzes.
- `app.js`: 25 itens, estoque, modal, confirmação de presença.
- `config.js`: dados do evento e integrações.
- `index.html`: estrutura e textos.

## Nota sobre fidelidade

Esta é uma **reconstrução tridimensional estilizada** do universo visual aprovado, não um modelo fotorrealista idêntico à arte gerada por IA. Os objetos são geometria real, mas não contêm malhas 3D comerciais ultra detalhadas de pelúcia ou produtos licenciados. O site não usa a imagem inteira, nem seus recortes, como interface.
