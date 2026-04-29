## Sistema de Gestão de Aulas de Música — Casos de Uso

### Atores
- **Professor**
- **Aluno**
- **Usuário sem login**
- **Sistema** (ator de suporte para automações)



### UC-01 — Cadastrar-se
**Atores principais:** Professor, Aluno  
**Objetivo:** Permitir criação de conta na plataforma.  
**Pré-condições:** Usuário não autenticado.  
**Pós-condições:** Conta criada e pronta para autenticação.

**Fluxo principal:**
1. Usuário acessa a opção de cadastro.
2. Sistema solicita dados obrigatórios.
3. Usuário informa os dados.
4. Sistema valida os dados.
5. Sistema cria a conta.

**Fluxos alternativos/exceções:**
- Dados inválidos/incompletos: sistema solicita correção.
- E-mail já cadastrado: sistema informa conflito e orienta recuperação/acesso.



### UC-02 — Autenticação
**Atores principais:** Professor, Aluno  
**Objetivo:** Permitir acesso à área autenticada do sistema.  
**Pré-condições:** Conta existente.  
**Pós-condições:** Sessão ativa para o perfil autenticado.

**Fluxo principal:**
1. Usuário informa credenciais.
2. Sistema valida credenciais.
3. Sistema inicia sessão e redireciona para a área interna.

**Fluxos alternativos/exceções:**
- Credenciais inválidas: sistema nega acesso e exibe mensagem de erro.



### UC-03 — Definir disponibilidade
**Ator principal:** Professor  
**Objetivo:** Registrar horários disponíveis para aulas.  
**Pré-condições:** Professor autenticado.  
**Pós-condições:** Agenda do professor atualizada com disponibilidade.

**Fluxo principal:**
1. Professor acessa a agenda/disponibilidade.
2. Informa dias e horários disponíveis.
3. Sistema valida conflitos.
4. Sistema salva a disponibilidade.

**Fluxos alternativos/exceções:**
- Conflito de horários: sistema bloqueia salvamento e solicita ajuste.



### UC-04 — Visualizar agenda
**Atores principais:** Professor, Aluno  
**Objetivo:** Consultar compromissos e horários disponíveis/ocupados.  
**Pré-condições:** Usuário autenticado.  
**Pós-condições:** Agenda exibida conforme perfil.

**Fluxo principal:**
1. Usuário acessa a agenda.
2. Sistema carrega eventos e horários.
3. Usuário visualiza por período (dia/semana/mês).



### UC-05 — Agendar aula
**Atores principais:** Aluno (e/ou Professor)  
**Objetivo:** Criar um novo compromisso de aula.  
**Pré-condições:** Usuário autenticado; horário disponível.  
**Pós-condições:** Aula registrada na agenda.

**Fluxo principal:**
1. Usuário seleciona data/horário.
2. Sistema valida disponibilidade.
3. Sistema registra o agendamento.
4. Sistema executa casos incluídos:
   **UC-11 Enviar notificação** 
   **UC-12 Confirmar presença** 

**Extensão:**
- **UC-13 Agendar reunião online** quando a aula for remota.

**Fluxos alternativos/exceções:**
- Horário indisponível: sistema solicita nova seleção.
- Falha de confirmação: sistema mantém aula pendente de confirmação.



### UC-06 — Remarcar aula
**Atores principais:** Aluno, Professor  
**Objetivo:** Alterar data/horário de aula já agendada.  
**Pré-condições:** Aula existente; usuários com permissão.  
**Pós-condições:** Aula atualizada com novo horário.

**Fluxo principal:**
1. Usuário seleciona aula existente.
2. Informa novo horário.
3. Sistema valida disponibilidade.
4. Sistema atualiza o agendamento.

**Relação com outro caso:**
- Relaciona-se a **UC-07 Gerenciar reposições** , quando a remarcação exigir tratamento de reposição.

**Fluxos alternativos/exceções:**
- Novo horário indisponível: sistema solicita outra opção.



### UC-07 — Gerenciar reposições
**Atores principais:** Aluno, Professor  
**Objetivo:** Controlar reposições decorrentes de faltas/cancelamentos/remarcações.  
**Pré-condições:** Existência de ocorrência que gere reposição.  
**Pós-condições:** Reposição registrada, aprovada ou negada conforme regras.

**Fluxo principal:**
1. Usuário acessa módulo de reposições.
2. Seleciona solicitação/ocorrência.
3. Sistema avalia regras aplicáveis.
4. Sistema registra status da reposição.

**Inclusão:**
 **UC-14**  Aplicar regra de contrato 



### UC-08 — Acessar videoaulas
**Atores principais:** Aluno (e possivelmente Professor)  
**Objetivo:** Consumir conteúdo de videoaulas disponibilizado na plataforma.  
**Pré-condições:** Usuário com permissão de acesso.  
**Pós-condições:** Conteúdo reproduzido e/ou progresso registrado.

**Fluxo principal:**
1. Usuário acessa biblioteca de videoaulas.
2. Seleciona uma aula.
3. Sistema libera reprodução.



### UC-09 — Visualizar página "sobre mim"
**Atores principais:** Usuário sem login, Aluno, Professor  
**Objetivo:** Exibir informações institucionais/profissionais da escola/professor.  
**Pré-condições:** Nenhuma.  
**Pós-condições:** Conteúdo informativo exibido.

**Fluxo principal:**
1. Usuário acessa a página "Sobre mim".
2. Sistema apresenta conteúdo público.



### UC-10 — Informações de contato
**Atores principais:** Usuário sem login, Aluno, Professor  
**Objetivo:** Exibir canais de contato da escola/professor.  
**Pré-condições:** Nenhuma.  
**Pós-condições:** Dados de contato apresentados.

**Fluxo principal:**
1. Usuário acessa seção de contato.
2. Sistema apresenta telefone, e-mail, redes e/ou formulário.



### UC-11 — Enviar notificação
**Atores principais:** Sistema  
**Objetivo:** Notificar envolvidos sobre criação/alteração de aula.  
**Pré-condições:** Evento de agenda gerado (ex.: agendamento).  
**Pós-condições:** Notificação enviada ou registrada tentativa.

**Fluxo principal:**
1. Sistema recebe evento de agendamento/remarcação.
2. Identifica destinatários.
3. Envia notificação pelos canais configurados.



### UC-12 — Confirmar presença
**Atores principais:** Sistema (com resposta de Aluno/Professor)  
**Objetivo:** Registrar confirmação de participação na aula.  
**Pré-condições:** Aula agendada e notificada.  
**Pós-condições:** Status de presença confirmado/pendente/recusado.

**Fluxo principal:**
1. Sistema solicita confirmação aos participantes.
2. Participantes confirmam presença.
3. Sistema atualiza status da aula.



### UC-13 — Agendar reunião online
**Atores principais:** Aluno, Professor  
**Objetivo:** Gerar sessão remota para aulas online.  
**Pré-condições:** Aula definida como remota.  
**Pós-condições:** Link/sala online associado ao agendamento.

**Fluxo principal:**
1. Durante o agendamento, usuário marca modalidade online.
2. Sistema cria reunião virtual.
3. Sistema vincula link à aula e notifica participantes.



### UC-14 — Aplicar regra de contrato
**Atores principais:** Sistema  
**Objetivo:** Validar ações de reposição/remarcação conforme contrato.  
**Pré-condições:** Solicitação sujeita a regras contratuais.  
**Pós-condições:** Ação aprovada, negada ou marcada para análise.

**Fluxo principal:**
1. Sistema identifica regras do contrato do aluno.
2. Avalia limite de faltas, reposições e prazos.
3. Retorna decisão para o caso de uso chamador.

### UC-15 — Verificar disponibilidade de horários
**Ator principal:** Sistema  
**Objetivo:** Verificar se um horário está disponível para reagendamento.  
**Pré-condições:** Existe solicitação de remarcação.  
**Pós-condições:** Horário validado como disponível ou indisponível.  

**Fluxo principal:**
1. Sistema recebe solicitação de remarcação.
2. Verifica horários disponíveis.
3. Retorna resultado para o caso chamador.

---