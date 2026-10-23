# Chá do Benício — V12.7: Cabeçalho de sugestões de presentes

Base: V12.6. Alterações restritas à apresentação da seção “Sugestões de presentes”:

- Título simplificado em texto nítido e legível, sem presente 3D e sem sombra exagerada;
- Subtítulo substituído por texto responsivo: “Escolha um presente e ajude a preparar a chegada do Benício! 💙”;
- Mantida **exatamente** a piada: “O Benício ainda nem nasceu e já tem lista de compras. Puxou o papai! 😂💙”;
- Removido o aviso visível “Imagens ilustrativas. Cada unidade de um item identificado como kit corresponde a um kit.”;
- Ajustados espaçamentos para leitura no celular.

Nenhuma alteração em app.js, APIs, painel, banco de dados, imagens de produtos, quantidades ou lógica de reservas/RSVP. O título e subtítulo em imagem originais permanecem na pasta assets mas deixaram de ser usados pelo cabeçalho.

**Publicação:** atualizar o mesmo projeto na Vercel com esta pasta, mantendo as variáveis de ambiente e o Supabase original. Não executar SQL de inicialização. Como a mudança é apenas HTML/CSS, não exige migração de dados. Testes com reservas reais necessitam ambiente de produção configurado.
