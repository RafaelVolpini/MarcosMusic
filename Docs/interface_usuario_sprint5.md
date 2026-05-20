# Interface do Usuário — Marcos Music

## Sistema de Gestão de Aulas de Música

---

## 1. Visão Geral

A interface da plataforma **Marcos Music** é construída com **React 18 + TypeScript + Vite + Tailwind CSS v4**, com suporte a tema claro/escuro e internacionalização PT/EN. A autenticação é feita via JWT em cookie HttpOnly.

**Perfis:** Professor (ADMIN) e Aluno (USER). Cada perfil vê menus e ações distintos.

---

## 2. Design System

### Paleta Semântica

| Cor          | Uso                                               |
|:-------------|:--------------------------------------------------|
| Indigo/Roxo  | Ações primárias, seleção ativa, identidade da marca |
| Emerald      | Confirmado, pago, sucesso                         |
| Rose         | Cancelado, erro, urgente                          |
| Amber        | Pendente, reagendado                              |
| Blue         | Informativo, lembrete                             |

Variáveis CSS como `--accent-500`, `--surface`, `--muted`, `--border` controlam todas as cores. A troca de tema aplica um novo conjunto de valores sem recarregar a página.

---

## 3. Telas e Componentes

### 3.1. Landing Page (pública)

Página de apresentação do professor, visível sem login.

- Foto e bio do professor
- Depoimentos de alunos
- Seção de contato e redes sociais
- Botões de login/cadastro

---

### 3.2. Autenticação

**Cadastro:** nome, sobrenome, e-mail, telefone, senha.
**Login:** e-mail + senha ? token JWT em cookie HttpOnly (3h de validade).
**Logout:** remove o cookie e limpa a sessão local.

Após o primeiro login, o sistema exige aceite dos termos de uso antes de liberar o acesso completo.

---

### 3.3. Dashboard

Painel inicial do professor com visão rápida do dia.

| Componente           | Descrição                                                              |
|:---------------------|:-----------------------------------------------------------------------|
| Banner próxima aula  | Contador regressivo, nome e instrumento do aluno, botão de cópia do link Meet |
| Cards de estatísticas | Alunos ativos, aulas do mês, aulas de hoje, aulas concluídas          |
| Próximas aulas       | Lista dos próximos 5 compromissos                                      |
| Alertas rápidos      | Últimas notificações não lidas                                         |

---

### 3.4. Agenda

Calendário semanal/diário do professor.

```
+-------------------------------------------------------+
¦ Hora     ¦ Seg (20/05)  ¦ Ter (21/05)  ¦ Qua (22/05)  ¦
+----------+--------------+--------------+--------------¦
¦ 08:00    ¦              ¦              ¦ [Aula Pedro] ¦
¦ 10:00    ¦ [Aula Lucas] ¦              ¦              ¦
+-------------------------------------------------------+
```

**Ações disponíveis:**

| Ação               | Quem pode | Descrição                                        |
|:-------------------|:----------|:-------------------------------------------------|
| Criar aula         | Professor | Modal com aluno, instrumento, data, horário, tipo |
| Editar aula        | Professor | Altera qualquer campo da aula                    |
| Cancelar aula      | Ambos     | Marca como cancelada; gera crédito de reposição  |
| Confirmar presença | Ambos     | Registra presença na aula                        |
| Ver link Meet      | Ambos     | Exibe link Google Meet (aulas online)            |
| Arrastar bloco     | Professor | Move aula para outro horário (drag-and-drop)     |
| Sincronizar Google | Professor | Exporta aulas visíveis para o Google Calendar    |

**Modal de aula:** aluno, instrumento, data, horário, status (realizada / cancelada / pendente), presença confirmada e link Meet quando online.

---

### 3.5. Disponibilidade

O professor define blocos de horário semanal fixo em que está disponível para novas aulas e reposições.

**Campos:** dia da semana, horário início, horário fim.
**Regra:** horário fim > horário início; blocos são salvos por dia.

---

### 3.6. Reagendamentos / Reposições

Módulo para gerenciar créditos de reposição gerados por cancelamentos.

1. Lista aulas canceladas com crédito pendente.
2. Exibe horários disponíveis do professor para reposição.
3. Aluno ou professor confirma o novo horário.
4. Sistema verifica conflito (UC-15) e aplica regra de contrato (UC-14).
5. Notificação enviada às duas partes.

---

### 3.7. Videoaulas

Biblioteca de conteúdo multimídia para alunos.

**Campos por vídeo:** título, descrição, instrumento, duração, link, thumbnail, categoria (Iniciante / Intermediário / Avançado), status (Publicada / Oculta).

**Ações:** buscar por título, assistir no player embutido, cadastrar/editar (Professor).

---

### 3.8. Gestão de Alunos *(Professor)*

CRUD completo de alunos da escola.

**Campos do aluno:** nome, apelido, e-mail, telefone, status (ativo/inativo), créditos de reposição, horários fixos de aula.

| Ação      | Descrição                                                  |
|:----------|:-----------------------------------------------------------|
| Cadastrar | Cria conta de usuário + perfil de aluno com senha padrão   |
| Editar    | Atualiza dados, status e horários                          |
| Excluir   | Remove aluno e sua conta (cascade nas aulas)               |

> O professor não aparece na listagem de alunos (filtro por papel ADMIN no backend).

---

### 3.9. Alertas e Notificações

Central de notificações do usuário autenticado.

| Tipo       | Cor      | Gatilho                                     |
|:-----------|:---------|:--------------------------------------------|
| LEMBRETE   | Azul     | Aula se aproximando                         |
| URGENTE    | Vermelho | Cancelamento no mesmo dia / conflito        |
| ALTERAÇÃO  | Amarelo  | Reagendamento pendente                      |
| CONFIRMADO | Verde    | Presença validada                           |

**Ações:** marcar como lido, deletar alerta, abrir detalhe com ações contextuais (confirmar presença, reagendar).

---

### 3.10. Configurações

Tela de preferências do usuário autenticado.

| Seção           | O que faz                                                        |
|:----------------|:-----------------------------------------------------------------|
| Perfil          | Editar nome e telefone; e-mail somente leitura                   |
| Tema            | Alternar claro / escuro (persiste em localStorage)               |
| Idioma          | Português / Inglês (persiste em localStorage)                    |
| Fuso horário    | Selecionar timezone (padrão: America/Sao_Paulo)                  |
| Google Calendar | Conectar conta Google via OAuth2, sincronizar aulas, desconectar |

**Fluxo de integração Google Calendar:**
1. Clique em "Conectar Google" ? OAuth2 consent screen.
2. Após autorização, token armazenado no backend.
3. Botão "Sincronizar" envia as aulas do período visível para o Google Calendar.
4. Aulas online recebem link Google Meet gerado automaticamente.
5. Foto de perfil do Google exibida no TopBar se conectado.

---

## 4. Requisitos Não Funcionais

| Requisito      | Meta                                                             |
|:---------------|:-----------------------------------------------------------------|
| Responsividade | Layout fluido de 360 px (mobile) a Full HD                       |
| Performance    | Carregamento da agenda < 1,5 s                                   |
| Navegabilidade | Máximo 2 cliques do Dashboard para qualquer ação crítica         |
| Feedback       | Toast de sucesso/erro em toda ação assíncrona; skeleton em carga |
| Acessibilidade | Navegação por teclado nos modais; contraste WCAG AA              |

---

## 5. Tratamento de Erros

| Cenário                             | Comportamento                                                         |
|:------------------------------------|:----------------------------------------------------------------------|
| Horário em conflito                 | Campo de data/hora destacado em vermelho; mensagem explicativa        |
| Cancelamento fora do prazo          | Aviso de confirmação antes de prosseguir                              |
| Google não conectado ao sincronizar | Retorna flag `disconnected`; frontend exibe botão de reconexão        |
| Token expirado                      | Redirect automático para login                                        |
| Falha de API                        | Toast de erro; tela permanece interativa                              |
