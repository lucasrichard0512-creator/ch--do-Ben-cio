# Chá do Benício 🍼💙

Quarta versão (V4) do convite interativo para **sábado, 28 de novembro de 2026**. Convidam **papai e mamãe**. Horário e local ficaram intencionalmente vazios até serem confirmados.

## O que já está pronto

- **Convite aberto imediatamente**: o visitante não precisa passar por tela de abertura nem clicar em "Abrir".
- Visual mais azul, com fotografia realista de pelúcia, tipografia elegante, animações discretas e layout responsivo para celular.
- Data, contagem regressiva e espaço reservado para hora e endereço.
- 25 tipos de presentes **numa única lista**, sem categorias ou filtros, com controle de quantidades e reserva por nome.
- PS5 Pro como piada entre os presentes especiais.
- Formulário para confirmar presença (ou informar ausência).
- Rodapé com o texto solicitado: "Um recadinho do papai...", "Gostou desse convite?" e a brincadeira sobre o preço das fraldas.
- Três botões rápidos, nesta ordem: **Ver lista de presentes → Ver localização → Confirmar presença**.

## Teste imediato, sem precisar configurar nada

Abra `index.html` no navegador ou hospede esta pasta em qualquer servidor estático. Para ver sem precisar de pasta, use também o arquivo **Convite-Cha-do-Benicio-V4-Demonstracao.html** entregue separadamente. O site entra automaticamente em **modo demonstração**. Nessa condição, presentes e confirmações são salvos **somente no navegador onde foram feitos**. Um aviso discreto informa isso claramente. Enquanto a conexão não estiver configurada, o formulário de presença também avisa que a confirmação é de demonstração. O modo demonstração **NÃO sincroniza convidados de celulares diferentes**.

Para testes mais próximos da versão publicada, no diretório do projeto rode:

```bash
python -m http.server 8000
```

E acesse `http://localhost:8000`.

## Como ligar o banco de dados compartilhado (Supabase)

1. Crie gratuitamente um projeto em [supabase.com](https://supabase.com/).
2. Abra o **SQL Editor** do projeto, cole todo o conteúdo de `supabase.sql` e execute. Ele cria as tabelas, cadastra os 25 presentes e protege as reservas com uma operação atômica. Reexecutar o arquivo mantém as reservas, não as apaga.
3. No painel do projeto, copie a **Project URL** e a chave **Publishable** (começa com `sb_publishable_`). Nunca use a chave `secret` ou `service_role` em arquivos públicos.
4. Abra `config.js` e preencha:

```js
SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_SUA_CHAVE'
```

5. Hospede os arquivos. Ao abrir, o aviso de demonstração desaparece, os visitantes verão o **mesmo estoque**, e as reservas serão gravadas no Supabase. O script SQL usa uma transação com `FOR UPDATE` para impedir que duas pessoas reservem a última unidade simultaneamente.
6. Faça um teste real com dois celulares diferentes. Confira as reservas no banco.

> **Observação de segurança:** sem login de convidados, qualquer pessoa com o link pode fazer reservas e enviar confirmações. RLS impede que convidados leiam nomes, mensagens ou modifiquem o banco diretamente, mas o projeto inicial **não tem CAPTCHA nem limitação de frequência**. Se o link for divulgado amplamente, acrescente proteção antispam (por exemplo, Cloudflare Turnstile e funções de servidor). A versão inicial não implementa um painel administrativo; os dados ficam visíveis apenas para você no painel do Supabase.

## Como atualizar depois

Edite só `config.js`:

```js
EVENT_TIME: '15:00',
EVENT_ADDRESS: 'Rua Exemplo, 123, Centro, Cidade - GO',
MAPS_URL: 'https://maps.google.com/...',
WHATSAPP_NUMBER: '5562999999999',
```

- **Horário, endereço e mapas**: campos vazios agora; aparecem automaticamente quando preenchidos.
- **WhatsApp**: coloque o número que deve receber pedidos de outros convites. Sem o número, o texto comercial continua discreto, mas avisa que o contato ainda será informado.
- **Quantidade dos presentes**: ajuste `qty` em `app.js` **e** `total_qty` na linha correspondente de `supabase.sql` (depois execute o SQL atualizado no Supabase). Nunca reduza o total para abaixo do que já foi reservado.
- **Presentes**: para adicionar/remover itens, altere o array `SEED_GIFTS` em `app.js` e mantenha o catálogo SQL correspondente. A lista no app precisa ter todos os itens do banco.

## Como ver quem reservou o quê

No Supabase, abra **SQL Editor** e execute esta consulta **no painel privado**:

```sql
select r.created_at, r.guest_name, g.name as presente, r.quantity
from public.gift_reservations r
join public.gifts g on g.id = r.gift_id
order by r.created_at desc;
```

E para as confirmações:

```sql
select created_at, guest_name, attending, guests_count, message
from public.rsvps
order by created_at desc;
```

## Publicação

O site é estático. Você pode hospedar no GitHub Pages, Netlify, Cloudflare Pages ou Vercel. Suba **todos** os arquivos da pasta (`index.html`, `styles.css`, `app.js`, `config.js` e `assets/`). O arquivo `supabase.sql` não precisa ser hospedado.

**Importante:** o arquivo ZIP entregue aqui é o código do site. Ele não coloca o convite automaticamente no ar e não cria um banco de dados sem suas credenciais.

## Arquivos

- `index.html`: estrutura da página.
- `styles.css`: visual, animações e responsividade.
- `app.js`: interatividade, reservas e confirmações.
- `config.js`: ajustes rápidos sem alterar o código principal.
- `assets/*.webp`: imagens criadas para esta versão do convite.
- `supabase.sql`: banco de dados e sincronização real entre visitantes.

## O que mudou nesta versão

O fundo e os detalhes ganharam mais azul. O site abre direto no convite; os três links ficam na ordem: **Ver lista de presentes**, **Ver localização**, **Confirmar presença**. A lista mostra todos os 25 presentes sem categorias. A pessoa só informa nome e quantidade (quando houver mais de uma unidade). O endereço e o horário seguem em branco até confirmação. O recadinho do papai ficou no final com humor leve.
