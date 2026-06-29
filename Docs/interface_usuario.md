# Projeto de Interface de Usuário — Marcos Music

Este documento detalha o projeto de interface de usuário (UI/UX) do sistema **Marcos Music**, um sistema de gestão de aulas de música gamificado. A interface foi projetada para ser limpa, responsiva, com suporte a temas (claro/escuro) e focada na facilidade de uso tanto para professores (administradores) quanto para alunos.

---

## 1. Fluxo do Usuário (User Flow)

O diagrama abaixo descreve a navegação e o fluxo de telas do sistema de acordo com o perfil do usuário:

```mermaid
graph TD
    A[Landing Page] -->|Entrar / Acessar| B(Página de Login e Cadastro)
    B -->|Sucesso - Professor| C[Dashboard do Professor]
    B -->|Sucesso - Aluno novo| PS[Completar Perfil]
    B -->|Sucesso - Aluno existente| D{Aceitou Contrato?}
    PS --> D
    D -->|Não| E[Tela de Termos de Uso]
    D -->|Sim| F[Agenda do Aluno]
    E -->|Aceitar| F

    subgraph Área do Professor (ADMIN)
        C --> C1[Agenda / Calendário]
        C --> C2[Gestão de Alunos]
        C --> C3[Disponibilidade Semanal]
        C --> C4[Reposições]
        C --> C5[Biblioteca de Vídeos]
        C --> C6[Alertas / WhatsApp]
        C --> C7[Configurações]
        C --> C8[Perfil do Professor]
        C --> C9[Chat com Alunos]
    end

    subgraph Área do Aluno (USER)
        F --> F1[Minha Agenda]
        F --> F2[Reposições]
        F --> F3[Biblioteca de Vídeos]
        F --> F4[Configurações]
        F --> F5[Perfil do Professor]
        F --> F6[Chat com Professor]
    end

    C1 -->|OAuth2 callback| GC[Google Calendar Sync]
    GC --> C1
    C9 -.->|ícone na TopBar| CHAT[ChatPanel]
    F6 -.->|ícone na TopBar| CHAT
```

---

## 2. Controle de Acesso por Perfil

| Página | Professor | Aluno |
|---|:---:|:---:|
| Dashboard | ✅ | ❌ |
| Agenda / Calendário | ✅ | ✅ |
| Gestão de Alunos | ✅ | ❌ |
| Disponibilidade Semanal | ✅ | ❌ |
| Reposições | ✅ | ✅ |
| Biblioteca de Vídeos | ✅ | ✅ |
| Alertas / WhatsApp | ✅ | ❌ |
| Configurações | ✅ | ✅ |
| Perfil do Professor | ✅ | ✅ |
| Chat | ✅ | ✅ |

---

## 3. Descrição das Telas e Componentes

### 3.1. Página de Apresentação (Landing Page)
* **Objetivo:** Atrair novos alunos, apresentar as credenciais do professor e dar acesso à plataforma.
* **Componentes:**
  * **Navbar:** Logotipo, link de contato e botão "Entrar".
  * **Hero:** Título animado, texto da metodologia gamificada, CTAs "Entrar em Contato" e "Acessar a Plataforma".
  * **Card do Professor:** Foto, insígnias ("Mentor Musical", "Classe Sênior"), anos de experiência, avaliação média.
  * **Modalidades:** Grid com 4 cards (Piano & Teclado, Violão & Guitarra, Produção Musical, Aulas Online).
  * **Benefícios Tecnológicos:** Grid de 6 recursos (Agendamento Flexível, Reagendamento Fácil, Histórico de Presença, Biblioteca de Vídeo, Lembretes, Notificações WhatsApp).
  * **Footer:** Contato e direitos autorais.

### 3.2. Página de Autenticação (Login e Cadastro)
* **Objetivo:** Acesso à conta ou cadastro inicial.
* **Componentes:**
  * **Painel Lateral de Boas-Vindas:** Apresentação visual da escola.
  * **Tabs:** Alternar entre "Entrar" e "Cadastrar-se".
  * **Formulário de Login:** E-mail, senha, botão "Entrar e continuar".
  * **Formulário de Cadastro:** Nome, Sobrenome, Telefone (com máscara), E-mail, Senha, Confirmação de Senha.
  * **Feedback Visual:** Mensagens de erro (tarja vermelha) ou sucesso (tarja verde).

### 3.3. Completar Perfil (Profile Setup)
* **Objetivo:** Capturar dados complementares do aluno após o primeiro cadastro.
* **Quando aparece:** Somente para alunos recém-cadastrados sem perfil completo na API.
* **Componentes:**
  * Campos de nome completo e telefone com máscara brasileira.
  * Botão "Salvar e continuar" — persiste via `/aluno/salvar` e avança para Termos de Uso.

### 3.4. Tela de Termos de Uso (Contract Gate)
* **Objetivo:** Exigir leitura e aceitação obrigatória dos termos antes do primeiro acesso do aluno.
* **Componentes:**
  * **Painel de Leitura:** Caixa com rolagem — termos de sigilo, política de cancelamento (mínimo 2h de antecedência), regras financeiras.
  * **Checkbox de Confirmação:** Obrigatório para habilitar o botão de aceite.
  * **Download PDF:** Exporta o contrato como `contrato-aulas-musga.pdf` gerado via `html2canvas` + `jsPDF` com paginação automática.
  * **Botão "Aceitar e continuar":** Habilitado apenas após marcar o checkbox.

### 3.5. Painel Geral (Dashboard — Professor)
* **Objetivo:** Estatísticas consolidadas e atalhos de controle operacional.
* **Componentes:**
  * **Banner "Próxima Aula":** Destaque da aula mais próxima com nome do aluno, horário e instrumento.
  * **KPIs (4 cards):** Alunos Ativos (com variação mensal), Aulas no Mês, Aulas Hoje, Concluídas Hoje.
  * **Próximas 5 Aulas:** Lista ordenada com cor indicadora, avatar, nome, instrumento, horário e selo de modalidade online.
  * **Feed de Alertas Críticos:** Cancelamentos recentes e solicitações de remarcação pendentes.
  * **Alunos Recentes:** Atalho para os cards dos últimos alunos cadastrados.

### 3.6. Agenda Interativa (Calendário)
* **Objetivo:** Controlar agendamentos via calendário dinâmico.
* **Componentes:**
  * **Grade Semanal:** Colunas Domingo–Sábado, linhas 07h–23h (células de 50px/hora).
  * **Alternância de Visualização:** Botão para modo semanal ou diário.
  * **Drag & Drop:** Mover aula arrastando o card para outra célula (HTML5 Drag-and-Drop nativo).
  * **Blocos de Reposição:** `ReposicaoBlock` exibido no calendário diferenciando visualmente as aulas de reposição das regulares.
  * **Modal Nova Aula:** Abre ao clicar em célula vazia. Campos: aluno (busca), professor, sala, data, início, fim, tipo (Individual/Grupo/Online/Experimental), instrumento, observações, link Google Meet, minutos de lembrete.
  * **Modal Detalhes da Aula:** Reagendar (date-picker), Cancelar (com confirmação), Confirmar presença, link Google Meet, observações.
  * **Integração Google Calendar:** Botão de autenticação OAuth2 + sync bidirecional. Após callback (`?google=success`) exibe `SyncSuccessModal` com contagem de eventos sincronizados.
  * **Lembretes Automáticos:** Polling a cada 30s — dispara notificação nativa do navegador dentro do intervalo configurado; cada aula é notificada no máximo uma vez (`lastReminderSentAt`).

### 3.7. Gestão de Alunos (Professor)
* **Objetivo:** Gerenciar dados acadêmicos e financeiros dos estudantes.
* **Componentes:**
  * **Busca + Filtros:** Pesquisa em tempo real por nome/instrumento; filtros por nível (Todos / Iniciante / Intermediário / Avançado).
  * **Cards de Aluno:**
    * Avatar, nome, nível (cinza = Iniciante, amarelo = Intermediário, verde = Avançado).
    * Total de aulas presenciais e online.
    * E-mail e telefone de acesso rápido.
    * **Saldo Financeiro:** Vermelho (débito) ou verde (crédito).
    * **Próxima Aula:** Data e hora.
    * **Modal `AlunoModal`:** Detalhes expandidos do aluno ao clicar no card.
  * **Botão "Novo Aluno":** Abre formulário de cadastro.

### 3.8. Disponibilidade Semanal (Professor)
* **Objetivo:** Configurar horários disponíveis para aulas na semana.
* **Componentes:**
  * **Ações Rápidas:** "Aplicar horário comercial" (09h–18h) ou "Limpar tudo".
  * **Grade de Disponibilidade:** Segunda–Domingo × 07h–23h. Clique para alternar:
    * Roxo + check = Disponível.
    * Cinza = Indisponível.
  * **Validação de Bloqueio:** Impede marcar como indisponível um horário com aula já agendada.

### 3.9. Reposições
* **Objetivo:** Gerenciar sessões de reposição — professor cria, aluno se inscreve.
* **Acessível por:** Professor e Aluno.
* **Componentes:**
  * **Lista de Reposições:** Exibe sessões com status (agendada, em andamento, encerrada), data/hora, alunos inscritos e observações.
  * **Painel de Logs (Professor):** Histórico temporal de alterações (Agendado, Reagendado, Cancelado) com responsável, tipo e detalhes da aula afetada.
  * **Reagendamento Rápido (Professor):** Date-picker por aula + botão de revalidação instantânea.

  * **Modal Agendar Reposição (`AgendarReposicaoModal`) — Professor:**
    * Seleção de data da sessão.
    * Seleção múltipla de alunos ativos (checkmark + avatar).
    * Campo de observações.
    * Feedback de erro animado; botões Salvar / Cancelar com estado de loading.
    * Chama o serviço `criarReposicao`.

  * **Modal Visualizar Reposição (`ReposicaoViewModal`) — Professor e Aluno:**
    * Cabeçalho com data/hora e badge de status (cores semânticas).
    * Lista de alunos inscritos com avatares.
    * **Professor:** Botão excluir sessão; remover aluno individual.
    * **Aluno:** Botão Inscrever / Cancelar inscrição (desabilitado se encerrado ou já iniciado).
    * **Aviso de corte:** Inscrição bloqueada se faltarem menos de 30 minutos para o início.
    * Feedback "Encerrado" ou "Inscrições encerram em X min".

### 3.10. Biblioteca de Vídeos
* **Objetivo:** Acesso a aulas gravadas e conteúdos complementares.
* **Acessível por:** Professor e Aluno.
* **Componentes:**
  * **Player Principal:** Reprodutor interativo com controles nativos.
  * **`VideoPreviewModal`:** Modal de pré-visualização ao clicar em um vídeo da grade.
  * **Painel de Upload (Professor):** Área de envio de novos vídeos com barra de progresso.
  * **Grid de Vídeos:** Cada card exibe ícone de play, título, duração formatada, tamanho do arquivo, data de upload e categoria.
  * **Trilhas de Aprendizado:** Organizados por nível (Iniciante, Teoria, Prática Instrumental) com indicador de progresso individual.

### 3.11. Alertas de Aulas / WhatsApp (Professor)
* **Objetivo:** Enviar lembretes de aula pelo WhatsApp com mensagem personalizada.
* **Tipos de alerta:** LEMBRETE, URGENTE, MUDANÇA, CONFIRMADO.
* **Componentes:**
  * **Seleção de Aula:** Lista suspensa para escolher o aluno/aula alvo.
  * **Editor de Template:** Texto livre com placeholders: `{nome}`, `{instrumento}`, `{data}`, `{hora}`, `{sala}`.
  * **Templates prontos:** "Lembrete de Aula", "Cobrança Amigável", "Vencimento de Mensalidade".
  * **Pré-visualização:** Mensagem final em tempo real após substituição dos placeholders.
  * **Botão Enviar:** Abre WhatsApp Web com número normalizado (prefixo 55) via `https://wa.me/`.

### 3.12. Chat (Professor e Aluno)
* **Objetivo:** Comunicação direta entre professor e aluno dentro da plataforma.
* **Como acessar:** Ícone de chat na TopBar com badge de contagem de mensagens não lidas.
* **Comportamento por perfil:**
  * **Professor:** Vê lista de todas as conversas ativas. Pode iniciar nova conversa selecionando um aluno via modal de busca (picker com avatares). Badge total de não lidas propagado para o ícone na TopBar.
  * **Aluno:** Acesso direto à conversa com o professor (sem lista).
* **`ChatPanel` (painel lateral):**
  * Desliza da borda direita com animação spring.
  * Fecha ao clicar no backdrop.
  * Polling a cada 5s para atualizar lista de chats e contagem de não lidas.
  * Modal de seleção de aluno com busca por nome.
* **`ChatConversationView` (conversa):**
  * Agrupamento de mensagens por dia com separadores de data.
  * Scroll automático para a última mensagem.
  * Formatação de hora (HH:MM) e confirmações de leitura (✓ enviado / ✓✓ lido).
  * Balões com estilo diferente para remetente e destinatário; decoração de "rabinho" no balão.
  * Avatar do professor (foto ou gradiente de iniciais).
  * Polling a cada 4s para novas mensagens; marcação automática de lidas ao abrir.
  * Campo de texto: Enter envia, Shift+Enter nova linha; limite de 4.000 caracteres.
  * Animações de entrada staggered (spring + escala + opacidade).

### 3.13. Configurações
* **Objetivo:** Centralizar preferências e integrações do sistema.
* **Acessível por:** Professor e Aluno.
* **Seções:**
  * **Geral:** Nome da escola, e-mail de contato, telefone, fuso horário.
  * **Notificações:** Toggles por categoria (lembretes, cancelamentos, novos cadastros); tipos: LEMBRETE, URGENTE, MUDANÇA, CONFIRMADO.
  * **Aparência:**
    * **Temas Prontos:** 8 bundles pré-configurados (cor de destaque + cor de fundo).
    * **Cor de Destaque:** 8 opções (Índigo, Teal, Sunset, Oceano, Floresta, Âmbar, Rosa, Roxo).
    * **Cor de Fundo:** 7 opções (Padrão, Quante, Frio, Violeta, Verde, Rosa, Creme).
    * **Modo de Tema:** Claro, Escuro ou Seguir Sistema.
    * **Densidade:** Compacta ou Confortável.
    * **Estilo de Superfície:** Sólido, Soft ou Glass (Glassmorphism).
    * **Arredondamento:** `md`, `lg` ou `xl`.
    * **Pré-visualização ao Vivo:** Botões e badges renderizados em tempo real.
  * **Segurança:** Formulário de alteração de senha.
  * **Integrações:** Google Meet, Google Calendar (OAuth2), WhatsApp, Stripe.

### 3.14. Perfil do Professor (Gamificado)
* **Objetivo:** Exibir o perfil gamificado do professor com habilidades, missões e conquistas.
* **Acessível por:** Professor e Aluno.
* **Componentes:**
  * **Card de Perfil:** Foto, nome, título ("Mentor Musical — Classe Sênior"), anos de experiência, avaliação.
  * **Habilidades:** Barras de progresso para Didática, Improvisação, Teoria Musical e Mentoria.
  * **Missões Ativas:** Lista de missões gamificadas em andamento com barra de progresso individual.
  * **Conquistas:** Insígnias desbloqueadas com base em metas atingidas.

---

## 4. Layout e Navegação

### 4.1. Sidebar
* **Largura:** 260px expandido / 80px colapsado — transição animada por spring (Framer Motion).
* **Logotipo:** "Marcos Music" visível quando expandido.
* **Itens de navegação por perfil:**
  * Professor: Dashboard, Agenda, Alunos, Disponibilidade, Reposições, Vídeos, Alertas, Configurações, Perfil.
  * Aluno: Agenda, Reposições, Vídeos, Configurações, Perfil.
* **Item ativo:** Borda esquerda colorida + efeito de glow + fundo destacado.
* **Hover:** Deslizamento suave + escala no clique.
* **Mini Card do Usuário (expandido):** Avatar (foto do professor ou gradiente de iniciais), nome, papel e e-mail.
* **Internacionalização:** Hook `useLanguage()` para suporte a múltiplos idiomas nos rótulos da navegação.

### 4.2. TopBar
* Título da página ativa.
* Ícone de chat com badge de mensagens não lidas → abre `ChatPanel`.
* Avatar do usuário e botão de logout.

---

## 5. Diretrizes de Design e Usabilidade

### 5.1. Paleta de Cores (CSS Variables)
Variáveis centralizadas em `index.css`, alternadas em tempo real via `ThemeContext`:

* **Destaque (Accent):** `--accent-600` — roxo/índigo por padrão, 8 opções configuráveis.
* **Semânticas:** Success (verde), Warning (amarelo), Danger (vermelho), Info (azul).
* **Superfície:** `--surface`, `--surface-soft` — neutros claros/escuros conforme tema.
* **Borda:** `--border` — contorno sutil de baixa opacidade.

### 5.2. Sistema de Temas
* **8 bundles prontos** aplicam cor de destaque + cor de fundo com um clique.
* **Variáveis CSS dinâmicas** injetadas em `:root` sem recarregar a página.
* **Modos:** Claro, Escuro, Seguir Sistema.
* **Estilos de superfície:** Sólido, Soft (opacidade reduzida), Glass (blur + transparência).
* Preferências persistidas no `localStorage`.

### 5.3. Tipografia
* **Inter** — textos de corpo e UI.
* **Outfit** — títulos e headings.

### 5.4. Responsividade
* **Desktop:** Sidebar visível, grids multi-coluna, tabelas completas.
* **Mobile:** Sidebar colapsada em hambúrguer, colunas empilhadas, botões fixos no rodapé, avatares resumidos.

### 5.5. Transições e Micro-animações (Framer Motion + CSS)
* Hover: opacidade + `scale-98` / clique: `active:scale-95`.
* Modais: fade-in + slide-up (180ms).
* Sidebar: spring na largura.
* Listas: stagger cascade (cards de alunos, vídeos, mensagens).
* Balões de chat: spring + escala + opacidade na entrada.
* Alternância de tema: transição fluida de cor.

### 5.6. Tratamento de Erros
* Toast de feedback para operações assíncronas (sucesso/erro).
* `DeleteConfirmModal`: confirmação antes de exclusões irreversíveis.
* Mensagens de erro animadas dentro de formulários e modais.
* Estados de loading com botões desabilitados durante requisições.

---

## 6. Componentes Reutilizáveis (Design System)

| Componente | Variantes / Tamanhos | Uso principal |
|---|---|---|
| `Button` | primary, secondary, ghost — sm, md, lg | Ações em geral |
| `Card` | padrão, hoverable | Containers de conteúdo |
| `StatCard` | — | KPIs do Dashboard |
| `Badge` | default, success, warning, danger, info | Status e níveis |
| `Avatar` | sm, md, lg — iniciais ou imagem | Representação de usuário |
| `Toast` | — | Feedback de operações |
| `MarcosLogo` | — | Branding na Sidebar e Landing |

---

## 7. Integrações Externas

| Serviço | Finalidade | Implementação |
|---|---|---|
| **Google Calendar** | Sync bidirecional de aulas | OAuth2 via `googleService.ts` |
| **Google Meet** | Link de videoconferência por aula | Campo no modal de aula |
| **WhatsApp** | Lembretes e cobranças ao aluno | `wa.me` URL + template personalizável |
| **Stripe** | Pagamentos (configurável) | Toggle nas Configurações |
| **jsPDF + html2canvas** | Exportação do contrato em PDF | `ContractGate.tsx` |
| **Browser Notifications API** | Lembretes locais | Polling 30s em `App.tsx` |
| **Chat (serviço interno)** | Mensagens professor ↔ aluno | Polling 4–5s, `ChatService` |

---

## 8. Stack Técnica

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Framework principal |
| TypeScript | — | Tipagem estática |
| Tailwind CSS | 4.2 | Estilização utilitária |
| Framer Motion | — | Animações e transições |
| jsPDF + html2canvas | — | Geração de PDF |
| Vite | — | Build tool |
