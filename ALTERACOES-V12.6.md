# Chá do Benício — V12.6

Base: V12.5 (com prévia do WhatsApp). Esta versão preserva as informações do evento, catálogo, quantidades do banco, reservas anteriores, credenciais e painel administrativo.

Alterações: “Sugestões de presentes” substitui o antigo título em botão, seção e documentação; a arte do cabeçalho preserva o presente 3D e a mensagem ilustrada original; itens esgotados deixam de exibir o seletor 1; os cartões têm enquadramento mais consistente e são ligeiramente mais compactos no celular; adicionados atalhos discretos para categorias e explicação sobre kits; confirmação de presença bloqueia reenvio enquanto aguarda e distingue atualização de nova confirmação.

**Proteção de estoque:** a função SQL original já usa `SELECT ... FOR UPDATE` e mantém as reservas atômicas; não alteramos o Supabase SQL, nem quantidades. A checagem de duplicidade de RSVP por WhatsApp também já existia, permanecendo no backend.

**Publicação:** faça o deploy do conteúdo da pasta `cha-do-benicio` no mesmo projeto Vercel, sem recriar o projeto nem resetar o banco. Preserve variáveis de ambiente e o Supabase existente. Não rode um SQL de reinicialização. Atualização de HTML/CSS/JS/arquivos de imagem não requer migração de banco de dados. A imagem de prévia do WhatsApp foi mantida.

**Validação em produção:** testar uma reserva de demonstração de valor permitido, atualização do estoque em dois aparelhos, e uma confirmação de presença pelo mesmo número. Esses testes dependem de Vercel e Supabase configurados; não foram realizados nesta edição local.
