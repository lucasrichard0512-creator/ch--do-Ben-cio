# Chá do Benício — V10.5 (estabilização)

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
