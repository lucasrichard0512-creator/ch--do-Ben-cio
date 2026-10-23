# Chá do Benício — Catálogo V12.1

- 38 tipos de presentes e 225 unidades no catálogo inicial.
- Itens por categoria: fraldas (5 tipos / 76 unidades), higiene (6 / 60), roupinhas (9 / 28), banho e enxoval (8 / 50), acessórios (2 / 3), especiais (8 / 8).
- Os kits contam como **uma opção presenteável por unidade**, não como itens avulsos. Os produtos e suas composições são sugestões; **preços de R$ 30 a R$ 50 não foram verificados nem são garantidos**.
- O convidado pode reservar mais de um item e várias unidades em reservas separadas com o mesmo nome; o estoque compartilhado só funciona com Supabase + Vercel configurados.
- Os 8 presentes especiais ficam em 1 unidade cada.
- O arquivo `supabase.sql` atualiza os 38 produtos; IDs antigos de roupas genéricas são arquivados, **não excluídos**, preservando histórico de reservas.
- Sem Supabase configurado o site exibe a lista, mas não aceita reservas reais; mantenha o sistema fechado para divulgação até ativar e testar o banco.
- 16 imagens novas foram extraídas de ilustrações dos produtos para esta versão. São imagens ilustrativas para orientar a escolha do presente, não fotos oficiais de kits comerciais. Os demais assets visuais são da V12 aprovada.
- Não alterar diretamente `reserved_qty` para simular presentes reservados: use a API de reserva.

## Checklist após atualizar o banco

1. Execute `supabase.sql` inteiro no SQL Editor em um projeto próprio do convite.
2. Configure as variáveis de ambiente privadas descritas em `ATIVACAO-NOTIFICACOES.md`.
3. Abra `/api/gifts` e confirme 38 itens.
4. Confira 225 unidades totais com `select count(*) as tipos, sum(total_qty) as total from public.gifts where active=true;`.
5. Faça reservas de teste de dois itens diferentes para a mesma pessoa e confira o decremento.
6. Teste um presente especial até zerar a disponibilidade e confirme que a segunda reserva é recusada.
