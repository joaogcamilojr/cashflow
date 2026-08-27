# Permissões

| Ação                  | OWNER         | TRANSACTION_MANAGER | VIEWER |
| --------------------- | ------------- | ------------------- | ------ |
| consultar conta/saldo | sim           | sim                 | sim    |
| criar lançamento      | sim           | sim                 | não    |
| editar metadados      | sim           | não                 | não    |
| arquivar/restaurar    | sim           | não                 | não    |
| excluir               | sim, se vazia | não                 | não    |
| compartilhar/membros  | sim           | não                 | não    |

Acesso efetivo = usuário autenticado + vínculo + conta `ACTIVE` + role. O backend não confia em botões ocultos. Owner é membro obrigatório e não pode ser removido. Convite para e-mail existente cria/atualiza vínculo; e-mail inexistente fica `PENDING`, sem envio real.

Limitação: aceitação por token e troca de convite ainda precisam de endpoint dedicado antes de produção.
