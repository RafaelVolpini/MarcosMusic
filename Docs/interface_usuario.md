# Projeto de Interface de Usuário — Marcos Music

Este documento detalha o projeto de interface de usuário (UI/UX) do sistema **Marcos Music**, um sistema de gestão de aulas de música gamificado. A interface foi projetada para ser limpa, responsiva, com suporte a temas (claro/escuro) e focada na facilidade de uso tanto para professores (administradores) quanto para alunos.

---

## 1. Fluxo do Usuário (User Flow)

O diagrama abaixo descreve a navegação e o fluxo de telas do sistema de acordo com o perfil do usuário:

```mermaid
graph TD
    A[Landing Page] -->|Entrar / Acessar| B(Página de Login e Cadastro)
    B -->|Sucesso Autenticação - Professor| C[Dashboard do Professor]
    B -->|Sucesso Autenticação - Aluno (novo)| PS[Completar Perfil]
    B -->|Sucesso Autenticação - Aluno (existente)| D{Aceitou Contrato?}
    PS --> D
    D -->|Não| E[Tela de Termos de Uso / Contract Gate]
    D -->|Sim| F[Agenda do Aluno]
    E -->|Aceitar| F
    
    subgraph Área do Professor (ADMIN)
        C --> C1[Agenda Geral / Calendário]
        C --> C2[Gestão de Alunos]
        C --> C3[Configuração de Salas e Disponibilidade]
        C --> C4[Histórico de Reagendamentos]
        C --> C5[Biblioteca de Vídeos / Conteúdo]
        C --> C6[Alertas de Aulas / WhatsApp]
        C --> C7[Configurações Gerais]
        C --> C8[Sobre Mim (Perfil do Professor)]
    end
    
    subgraph Área do Aluno (USER)
        F --> F1[Visualizar Minha Agenda]
        F --> F2[Confirmar Presença em Aula]
        F --> F3[Reagendar Minha Aula]
        F --> F4[Biblioteca de Vídeos / Conteúdo]
        F --> F5[Sobre Mim (Perfil do Professor)]
    end

    C1 -->|OAuth2 callback| GC[Google Calendar Sync]
    GC --> C1
```

---

## 2. Descrição das Telas e Componentes

### 2.1. Página de Apresentação (Landing Page)
* **Objetivo:** Atrair novos alunos, apresentar as credenciais do professor Marcos Mello e dar acesso à plataforma.
* **Componentes da Tela:**
  * **Barra de Navegação Superior (Navbar):** Logotipo da escola, link de contato direto e botão em destaque "Entrar" (redireciona para login).
  * **Seção Principal (Hero):** Título de impacto animado, parágrafo explicativo da metodologia gamificada e botões de chamada para ação (CTA): "Entrar em Contato" e "Acessar a Plataforma".
  * **Card do Professor (Sobre o Marcos):** Foto de perfil do professor, insígnia de "Mentor Musical" e "Classe Sênior", anos de experiência, avaliação média e botões de ação rápida.
  * **Seção de Modalidades:** Grid com 4 cards exibindo os instrumentos/cursos oferecidos (Piano & Teclado, Violão & Guitarra, Produção Musical, Aulas Online).
  * **Seção de Tecnologia (Benefícios):** Grid de 6 recursos tecnológicos disponíveis para o aluno (Agendamento Flexível, Reagendamento Fácil, Histórico de Presença, Biblioteca de Vídeo, Lembretes, Notificações WhatsApp).
  * **Rodapé (Footer):** Informações de contato e direitos autorais.

### 2.2. Página de Autenticação (Login e Cadastro)
* **Objetivo:** Permitir que usuários acessem sua conta ou realizem o cadastro inicial.
* **Componentes da Tela:**
  * **Painel Lateral de Boas-Vindas:** Apresentação visual da escola e informações contextuais do sistema.
  * **Alternador de Modo (Tabs):** Abas interativas para alternar entre "Entrar" e "Cadastrar-se".
  * **Formulário de Login:**
    * Campo de entrada para e-mail com ícone contextual.
    * Campo de entrada para senha ocultada.
    * Botão de envio "Entrar e continuar".
  * **Formulário de Cadastro:**
    * Campos para Nome e Sobrenome.
    * Campo para Telefone com máscara de formatação.
    * Campos para E-mail, Senha e Confirmação de Senha.
    * Botão de envio "Cadastrar e continuar".
  * **Feedback Visual:** Exibição dinâmica de mensagens de erro (tarja vermelha) ou sucesso (tarja verde).

### 2.3. Completar Perfil (Profile Setup)
* **Objetivo:** Capturar dados complementares do aluno imediatamente após o primeiro cadastro, antes de avançar ao fluxo de contrato.
* **Quando aparece:** Somente para alunos recém-cadastrados que ainda não possuem perfil completo na API (`/aluno/salvar`).
* **Componentes da Tela:**
  * **Formulário de Perfil:** Campos para nome completo e telefone com máscara de formatação brasileira.
  * **Botão de Confirmação:** "Salvar e continuar", que persiste os dados via API e avança para a tela de Termos de Uso.

### 2.4. Tela de Termos de Uso (Contract Gate)
* **Objetivo:** Forçar a leitura e aceitação obrigatória dos termos contratuais por parte dos alunos antes de liberar o primeiro acesso.
* **Componentes da Tela:**
  * **Painel de Leitura:** Caixa de rolagem contendo os termos de sigilo, política de cancelamento de aulas (mínimo de 2 horas de antecedência) e regras financeiras.
  * **Checkbox de Confirmação:** Caixa de seleção obrigatória de concordância com os termos.
  * **Botão de Download:** Exporta o contrato completo como arquivo PDF (`contrato-aulas-musga.pdf`) gerado via `html2canvas` + `jsPDF`, com paginação automática.
  * **Botão de Ação:** "Aceitar e continuar" — habilitado somente após marcar o checkbox.

### 2.5. Painel Geral (Dashboard — Perfil Professor)
* **Objetivo:** Exibir estatísticas consolidadas e atalhos rápidos de controle operacional para o professor.
* **Componentes da Tela:**
  * **Grid de Indicadores Rápidos (KPIs):**
    * **Alunos Ativos:** Quantidade de matriculados com indicador de crescimento mensal.
    * **Aulas no Mês:** Total de aulas registradas no mês corrente.
    * **Aulas Hoje:** Número de aulas programadas para o dia atual.
    * **Concluídas Hoje:** Percentual ou quantidade de aulas finalizadas e confirmadas.
  * **Próximas Aulas:** Lista ordenada das próximas 5 aulas agendadas contendo cor indicadora, avatar e nome do aluno, instrumento, horário e selo de modalidade (se online).
  * **Painel de Alertas:** Notificações dinâmicas destacando cancelamentos recentes de aulas ou solicitações de remarcação pendentes de confirmação.
  * **Alunos Recentes:** Atalho para acesso rápido aos cards de alunos adicionados ultimamente na plataforma.

### 2.6. Agenda Interativa (Calendário)
* **Objetivo:** Controlar agendamentos de aulas através de uma interface de calendário altamente dinâmica.
* **Componentes da Tela:**
  * **Visualização Semanal da Grade:** Colunas para cada dia da semana (Domingo a Sábado) e linhas divididas em intervalos de horários (07h às 23h, células de 50px por hora).
  * **Alternância de Visualização:** Botão para alternar entre visão semanal e visão diária.
  * **Operação por Arrasto (Drag & Drop):** Possibilidade de mudar o dia/horário de uma aula apenas arrastando o card para outra célula disponível via HTML5 Drag-and-Drop API nativa.
  * **Formulário de Nova Aula (Modal):** Abertura automática ao clicar em uma célula vazia, contendo campos para:
    * Seleção do aluno (busca rápida por nome).
    * Escolha do professor e da sala.
    * Definição de data, horário de início e fim.
    * Tipo de aula: Individual, Grupo, Online ou Experimental.
    * Instrumento, observações, link do Google Meet e minutos de lembrete antes da aula.
  * **Detalhes da Aula (Modal):** Exibe informações completas da aula selecionada com opções para:
    * Reagendar (muda data e hora via date-picker).
    * Cancelar aula (com confirmação).
    * Confirmar presença do aluno.
    * Inserir link do Google Meet e observações.
  * **Integração com Google Calendar:** Botão destacado para autenticação OAuth2 e sincronização automática bidirecional. Após o redirect de callback (`?google=success`), exibe o modal `SyncSuccessModal` com o número de eventos sincronizados.
  * **Lembretes Automáticos (Browser Notifications):** O sistema verifica a cada 30 segundos se alguma aula está dentro do intervalo de lembrete configurado e dispara notificações nativas do navegador. Cada aula é disparada no máximo uma vez (`lastReminderSentAt`).

### 2.7. Gestão de Alunos (Perfil Professor)
* **Objetivo:** Permitir ao professor gerenciar todos os dados acadêmicos e financeiros dos estudantes.
* **Componentes da Tela:**
  * **Filtros e Busca:** Barra de pesquisa em tempo real por nome/instrumento e botões de filtro rápido por nível (Todos, Iniciante, Intermediário, Avançado).
  * **Listagem em Cards:**
    * Avatar e nome do aluno.
    * Nível de proficiência exibido através de etiquetas coloridas (cinza = Iniciante, amarelo = Intermediário, verde = Avançado).
    * Total de aulas presenciais e online já realizadas.
    * Contatos de e-mail e telefone de forma rápida.
    * **Painel Financeiro (Saldo):** Exibição do saldo atualizado do aluno com cores (vermelho para débito e verde para saldo positivo).
    * **Próxima Aula:** Data e hora programada para a próxima aula deste aluno específico.
  * **Botão "Novo Aluno":** Atalho para abertura do formulário de cadastro de novos estudantes na plataforma.

### 2.8. Configuração de Salas e Disponibilidade Semanal
* **Objetivo:** Configurar os horários padrão que o professor possui livres para oferecer aulas na semana.
* **Componentes da Tela:**
  * **Ações Rápidas:** Botões para "Aplicar horário comercial" (grade padrão das 09h às 18h) ou "Limpar tudo".
  * **Grade de Disponibilidade:** Matriz com os dias da semana (Segunda a Domingo) e horários (07:00 às 23:00) contendo células clicáveis:
    * Célula roxa com botão de check: Horário configurado como "Disponível para aula".
    * Célula cinza: Horário marcado como "Indisponível".
  * **Validação de Bloqueio:** Impede que o professor torne indisponível um horário onde já existe uma aula agendada com o aluno para evitar inconsistências.

### 2.9. Histórico de Reagendamentos e Logs
* **Objetivo:** Manter a transparência auditiva de todas as alterações manuais ou automáticas feitas nas aulas.
* **Acessível por:** Professor e Aluno (o aluno visualiza apenas suas próprias aulas).
* **Componentes da Tela:**
  * **Painel de Logs:** Lista temporal exibindo quem realizou a alteração, o tipo de alteração (Agendado, Reagendado, Cancelado), data do registro e detalhes específicos da aula afetada.
  * **Painel de Reagendamento Rápido:** Lista de aulas elegíveis para mudança rápida de data via campos do tipo *date-picker* e botões de revalidação de agenda instantâneos.

### 2.10. Biblioteca de Conteúdo (Videoaulas)
* **Objetivo:** Permitir aos alunos assistirem aulas gravadas e conteúdos complementares disponibilizados.
* **Acessível por:** Professor e Aluno.
* **Componentes da Tela:**
  * **Player de Vídeo Principal:** Reprodutor interativo integrado com barras de controle nativas.
  * **Painel de Upload (Professor):** Área de upload de novos vídeos com barra de progresso de envio.
  * **Grid de Vídeos:** Cada card exibe ícone de play, título, duração formatada, tamanho do arquivo e data de upload.
  * **Trilhas de Aprendizado:** Vídeos organizados por nível/categoria (Iniciante, Teoria, Prática Instrumental), com indicador de progresso individual de visualização.

### 2.11. Alertas de Aulas / WhatsApp
* **Objetivo:** Permitir ao professor enviar notificações de lembrete de aula diretamente para o WhatsApp do aluno com mensagem personalizada.
* **Acessível por:** Professor.
* **Componentes da Tela:**
  * **Seleção de Aula:** Lista suspensa para selecionar o aluno/aula alvo da notificação.
  * **Editor de Template:** Campo de texto livre com suporte a placeholders dinâmicos:
    * `{nome}` — Nome do aluno.
    * `{instrumento}` — Instrumento da aula.
    * `{data}` — Data da aula.
    * `{hora}` — Horário da aula.
    * `{sala}` — Sala configurada.
  * **Pré-visualização:** Exibição em tempo real da mensagem final após substituição dos placeholders.
  * **Botão Enviar:** Abre o WhatsApp Web com o número normalizado para formato brasileiro (prefixo 55) e a mensagem pré-preenchida via `https://wa.me/`.

### 2.12. Configurações Gerais
* **Objetivo:** Centralizar todas as preferências e integrações do sistema.
* **Acessível por:** Professor.
* **Seções:**
  * **Geral:** Nome da escola, e-mail de contato, telefone, fuso horário.
  * **Notificações:** Toggles para ativar/desativar alertas de lembretes, cancelamentos e novos cadastros.
  * **Aparência:**
    * **Temas Prontos:** 8 bundles pré-configurados com combinações de cor de destaque e cor de fundo.
    * **Cor de Destaque:** 8 opções (Índigo, Teal, Sunset, Oceano, Floresta, Âmbar, Rosa, Roxo).
    * **Cor de Fundo:** 7 opções (Padrão, Quante, Frio, Violeta, Verde, Rosa, Creme).
    * **Modo de Tema:** Claro, Escuro ou Seguir Sistema.
    * **Densidade da Interface:** Compacta ou Confortável.
    * **Estilo de Superfície:** Sólido, Suave (Soft) ou Vidro (Glass/Glassmorphism).
    * **Arredondamento de Bordas:** Opções `md`, `lg` ou `xl`.
    * **Pré-visualização ao Vivo:** Cards com botões e badges renderizados em tempo real com as configurações selecionadas.
  * **Segurança:** Formulário de alteração de senha.
  * **Integrações:** Toggles e botões de autenticação para Google Meet, Google Calendar (OAuth2), WhatsApp e Stripe.

### 2.13. Sobre Mim (Perfil Gamificado do Professor)
* **Objetivo:** Exibir o perfil gamificado do professor com habilidades, missões e conquistas.
* **Acessível por:** Professor e Aluno.
* **Componentes da Tela:**
  * **Card de Perfil:** Foto, nome, título (ex: "Mentor Musical — Classe Sênior"), anos de experiência e avaliação.
  * **Painel de Habilidades:** Barras de progresso indicando nível em habilidades como Didática, Improvisação, Teoria Musical e Mentoria.
  * **Missões Ativas:** Lista de missões gamificadas em andamento com progresso individual.
  * **Conquistas:** Insígnias desbloqueadas pelo professor com base em metas alcançadas.

---

## 3. Diretrizes de Design e Usabilidade

### 3.1. Esquema de Cores (Paleta HSL/Hex)
A interface utiliza variáveis CSS centralizadas no arquivo `index.css`, permitindo alternância instantânea entre os modos claro e escuro:

* **Cor de Destaque (Accent):** Tons de roxo e índigo (`#7c3aed` a `#4f46e5`) por padrão, com 8 opções configuráveis pelo professor.
* **Fundos (Surface/Soft):** Tons neutros suaves (branco/cinza-claro para modo claro; preto e cinza-grafite escuro para modo escuro), com 7 variações temáticas.
* **Bordas (Border):** Contornos sutis de separação com baixa opacidade para manter a estética leve e sem excesso de ruído visual (Glassmorphism opcional).

### 3.2. Sistema de Temas
O sistema suporta personalização completa via `ThemeContext` (React Context API):
* **8 bundles prontos** combinam cor de destaque + cor de fundo para aplicação com um clique.
* **Variáveis CSS dinâmicas** são injetadas em `:root` em tempo real sem recarregamento de página.
* **Estilos de superfície:** Sólido (padrão), Soft (opacidade reduzida) e Glass (blur + transparência).
* As preferências são persistidas no `localStorage` do navegador.

### 3.3. Responsividade
Todas as telas foram projetadas seguindo o conceito de grid flexível e flexbox:
* **Telas Grandes (Desktops):** Visualização completa com menus laterais (Sidebar), grids de múltiplas colunas e tabelas estendidas.
* **Telas Pequenas (Smartphones):** Ocultamento automático da sidebar em menu hambúrguer, colapsamento de colunas em fluxo único vertical, botões de ação fixos na parte inferior e avatares resumidos para melhor legibilidade.

### 3.4. Sidebar e Navegação
* **Largura expansível:** 260px expandido / 80px colapsado, com transição animada.
* **Itens visíveis por papel:** Professor vê 9 páginas; aluno vê 4 páginas.
* **Card do usuário:** Exibido na parte inferior da sidebar com avatar, nome e papel.
* **Branding Musga:** Logotipo e nome exibidos no topo da sidebar.

### 3.5. Transições e Micro-animações
Para melhorar o engajamento e a sensação de fluidez, a interface implementa transições em CSS e Framer Motion:
* Hover suave com alteração de opacidade e escala leve (ex: `scale-98` ou `active:scale-95` em botões).
* Entrada e saída suave de modais (fade-in e slide-up de 180ms).
* Transição fluida de cores ao alternar o tema do sistema.
* Animações de stagger em listas (cards de alunos e vídeos aparecem em cascata).

### 3.6. Componentes Reutilizáveis (Design System)

| Componente | Variantes | Uso |
|---|---|---|
| `Button` | primary, secondary, ghost — tamanhos sm, md, lg | Ações em geral |
| `Card` | padrão, hover | Containers de conteúdo |
| `StatCard` | — | KPIs do Dashboard |
| `Badge` | default, success, warning, danger, info | Etiquetas de status e nível |
| `Avatar` | sm, md, lg — iniciais ou imagem | Representação de usuário |

---

## 4. Integrações Externas

| Serviço | Finalidade | Implementação |
|---|---|---|
| **Google Calendar** | Sincronização bidirecional de aulas | OAuth2 via `googleService.ts` |
| **Google Meet** | Link de videoconferência por aula | Campo configurável no modal de aula |
| **WhatsApp** | Envio de lembretes de aula | `wa.me` URL com template personalizável |
| **Stripe** | Pagamentos (configurável) | Toggle de ativação nas Configurações |
| **jsPDF + html2canvas** | Exportação do contrato em PDF | `ContractGate.tsx` |
| **Browser Notifications API** | Lembretes locais de aulas | Polling a cada 30 segundos em `App.tsx` |
