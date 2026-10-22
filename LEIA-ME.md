# Chá do Benício — V10.9

Esta versão mantém o visual e as 24 opções de presentes da V10.4.

## Ajustes realizados
- Confirmação de presença agora aceita de 1 a 15 pessoas (incluindo o convidado).
- Falha ao atualizar a lista após gravar reserva não gera mensagem enganosa de falha na reserva.
- Atualizações simultâneas do catálogo não podem sobrescrever uma atualização mais recente.
- Aviso visível de modo demonstração e de indisponibilidade de conexão.
- Regras de compatibilidade do Safari e melhorias leves no formulário sem mudar a arte.
- Arquivos CSS/JS usam versão 10.5 na URL para evitar cache antigo.

## OBRIGATÓRIO para ativar reservas reais
1. Crie o projeto no Supabase.
2. Execute `supabase.sql` no SQL Editor.
3. Coloque **somente** a URL pública e a chave publishable/anon em `config.js`. NUNCA coloque `service_role` ou chaves secret no navegador.
4. Publique os arquivos da pasta `cha-do-benicio`.
5. Teste a reserva com dois navegadores diferentes e confirme a atualização do estoque.

Enquanto `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` estiverem vazios, o site informa que está em demonstração. Seus dados não são compartilhados.

## Limitações conhecidas
- O Safari do iPhone físico ainda precisa ser testado: a causa original do quadrado preto não foi reproduzida neste ambiente.
- Não foi adicionada autenticação de convidados. Portanto, pessoas podem enviar reservas e presenças repetidas. É recomendado implementar um mecanismo de confirmação/autorização antes de publicar amplamente.
- Falhas de rede podem ocorrer depois de uma gravação bem-sucedida. Não reenvie uma reserva sem consultar o catálogo.


## V10.6 - Safari e desempenho
- Removido o scroll-snap no celular: a rolagem agora é livre e alcança o rodapé.
- Redimensionadas/comprimidas as imagens WebP com menor custo de download e decodificação, preservando os nomes.
- Imagens fora da primeira tela passam a carregar sob demanda; título recebe prioridade.
- Removido o movimento de rolagem forçado em links internos.
- Na abertura no Safari iOS, fundo em camada única e elementos decorativos sem animação acelerada para reduzir risco de artefatos pretos.
- Não foi possível reproduzir o defeito em um iPhone físico neste ambiente. Testar após publicar e recarregar sem cache.


## Versão 10.8 - Imagens

* 17 imagens dos presentes foram recriadas em padrão visual de alta nitidez (9 produtos e 8 itens de fralda/higiene).
* 5 imagens de móveis/acessórios foram recuperadas dos arquivos originais de 1200px e reexportadas, sem afirmar que são nativamente tão definidas quanto as imagens recriadas.
* Mamadeira e berço preservam o patrimônio visual original de maior qualidade.
* Cards continuam com HTML, JavaScript e ações reais: as imagens recriadas foram recortadas sem incluir botões ou texto.
* Imagens são representações ilustrativas e embalagens geradas não garantem correspondência exata com produtos comerciais.
* Refaça o deploy completo para atualizar os arquivos estáticos.


## Versão 10.8 - Imagens

* 17 imagens dos presentes foram recriadas em padrão visual de alta nitidez (9 produtos e 8 itens de fralda/higiene).
* 5 imagens de móveis/acessórios foram recuperadas dos arquivos originais de 1200px e reexportadas, sem afirmar que são nativamente tão definidas quanto as imagens recriadas.
* Mamadeira e berço preservam o patrimônio visual original de maior qualidade.
* Cards continuam com HTML, JavaScript e ações reais: as imagens recriadas foram recortadas sem incluir botões ou texto.
* Imagens são representações ilustrativas e embalagens geradas não garantem correspondência exata com produtos comerciais.
* Refaça o deploy completo para atualizar os arquivos estáticos.


## V10.9 — imagens e humor
- Trocador, cômoda, carrinho, bebê conforto e PS5 Pro substituídos por renderizações novas em vez de ampliar originais embaçados.
- Aviso global de demonstração retirado a pedido. Quando o Supabase não estiver configurado, o aviso aparece somente ao fazer a reserva e na confirmação de presença; nenhum dado é compartilhado entre aparelhos.
- Removida a frase antiga sobre limitação por unidade; mantida apenas piada do PS5 Pro.
- Humor discreto adicionado nos presentes, encontro, RSVP e rodapé.
- IMPORTANTE: para registrar reservas reais compartilhadas, configure o Supabase em config.js.


V10.10: frases de humor com fonte maior e compactação dos espaços entre seções para melhorar a leitura, sem alterar o conteúdo do convite.


V10.11: berço da capa levemente menor e mais baixo no mobile; frases menores com maior destaque e remoção da parte “A mamãe pediu o plano de aula” da frase do PS5.
