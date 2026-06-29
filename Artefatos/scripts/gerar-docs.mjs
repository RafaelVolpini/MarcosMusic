import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, TableRow, TableCell, Table,
  WidthType, BorderStyle, ShadingType, Header, Footer,
  PageNumber, NumberFormat, UnderlineType, LineRuleType,
} from "docx";
import { writeFileSync } from "fs";

// ──────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────
const bold = (t, size = 24) => new TextRun({ text: t, bold: true, size });
const normal = (t, size = 22) => new TextRun({ text: t, size });
const italic = (t, size = 22) => new TextRun({ text: t, italics: true, size });
const br = () => new Paragraph({ children: [new TextRun("")] });
const heading1 = (text) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    style: "Heading1",
  });
const heading2 = (text) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
  });
const body = (text, align = AlignmentType.JUSTIFIED) =>
  new Paragraph({
    children: [normal(text)],
    alignment: align,
    spacing: { line: 360, lineRule: LineRuleType.AUTO, before: 0, after: 160 },
  });
const bullet = (text) =>
  new Paragraph({
    children: [normal(`• ${text}`)],
    indent: { left: 720 },
    spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 80 },
    alignment: AlignmentType.JUSTIFIED,
  });

// ──────────────────────────────────────────────
//  E-BOOK SPRINT 1
// ──────────────────────────────────────────────
const ebook = new Document({
  creator: "Marcos Music Team",
  title: "E-Book Sprint 1 — Marcos Music",
  styles: {
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        run: { bold: true, size: 28, color: "4A2580" },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
    ],
  },
  sections: [
    {
      children: [
        // ── CAPA ──────────────────────────────────────
        br(), br(), br(),
        new Paragraph({
          children: [bold("PONTIFÍCIA UNIVERSIDADE CATÓLICA DE MINAS GERAIS", 26)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [bold("Curso de Engenharia de Software — Trabalho Interdisciplinar III", 22)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        br(), br(),
        new Paragraph({
          children: [bold("MARCOS MUSIC", 52)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [italic("Sistema de Gestão de Aulas de Música", 32)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [bold("E-Book — Sprint 1", 28)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),
        br(), br(), br(), br(),
        new Paragraph({
          children: [bold("Equipe:", 22)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({ children: [normal("Artur Costa Cavalcante Coelho", 22)], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [normal("Bernardo Parreiras Prado", 22)], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [normal("João Paulo Aguiar Prado", 22)], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [normal("Paulo Victor Fernandes de Araujo Silva", 22)], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [normal("Rafael Nagem Volpini", 22)], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        br(),
        new Paragraph({ children: [bold("Professores Orientadores:", 22)], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [normal("Michelle Hanne Soares de Andrade", 22)], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [normal("Nelson Ribeiro de Carvalho Junior", 22)], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [normal("Luiz Carlos da Silva", 22)], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        br(),
        new Paragraph({ children: [normal("Belo Horizonte — Junho de 2025", 22)], alignment: AlignmentType.CENTER }),

        // ── PAGE BREAK ─────────────────────────────────
        new Paragraph({ children: [new PageBreak()] }),

        // ── INTRODUÇÃO ─────────────────────────────────
        heading1("1. Introdução"),
        body(
          "O presente documento descreve o trabalho desenvolvido durante a Sprint 1 do projeto " +
          "Marcos Music — um sistema web de gestão de aulas de música concebido para atender às " +
          "necessidades do professor particular Marcos Mello Lima. O projeto é desenvolvido como " +
          "parte da disciplina Trabalho Interdisciplinar III do curso de Engenharia de Software " +
          "da PUC Minas, unindo as competências das áreas de Engenharia de Requisitos, " +
          "Desenvolvimento Web e Práticas de Engenharia de Software."
        ),
        body(
          "Ao longo desta sprint, a equipe concentrou esforços no levantamento e na documentação " +
          "dos requisitos do sistema, na definição da arquitetura inicial e no desenvolvimento dos " +
          "primeiros protótipos de interface, estabelecendo as bases sólidas para as sprints " +
          "subsequentes."
        ),

        // ── IDENTIFICAÇÃO DO PROJETO ────────────────────
        heading1("2. Identificação do Projeto"),
        heading2("2.1. Nome do Sistema"),
        body("Marcos Music — Sistema de Gestão de Aulas de Música"),
        heading2("2.2. Stakeholder"),
        body(
          "Marcos Mello Lima é professor particular de música há mais de uma década, lecionando " +
          "individualmente para dezenas de alunos em diversas modalidades (violão, guitarra, " +
          "cavaquinho, teclado, entre outros). Possui uma agenda extremamente ocupada durante toda " +
          "a semana, com alunos em horários distribuídos ao longo de todos os dias, reservando " +
          "apenas o domingo à noite como janela de administração de sua agenda. É o solicitante " +
          "direto do sistema e principal usuário do perfil de Professor/Administrador."
        ),
        heading2("2.3. Instituição"),
        body("Pontifícia Universidade Católica de Minas Gerais — PUC Minas"),
        heading2("2.4. Semestre / Sprint"),
        body("1º Semestre de 2025 — Sprint 1"),

        // ── DESCRIÇÃO DO PROBLEMA ──────────────────────
        heading1("3. Descrição do Problema"),
        body(
          "Antes do desenvolvimento deste sistema, o professor Marcos Mello Lima realizava toda a " +
          "gestão da sua agenda de aulas de forma completamente manual, recorrendo exclusivamente " +
          "a um bloco de notas físico. Com uma agenda tomada por alunos praticamente todos os dias " +
          "da semana — de segunda a sábado, com horários quase integralmente preenchidos —, " +
          "Marcos possuía apenas o domingo à noite como única janela de tempo disponível para " +
          "organizar a semana seguinte."
        ),
        body(
          "Nesse intervalo extremamente curto, ele precisava revisar todas as aulas previstas para " +
          "os próximos dias, contabilizar as faltas e créditos de reposição de cada aluno, encaixar " +
          "novas reposições nos horários vagos e anotar qualquer alteração de horário ou " +
          "cancelamento comunicado pelos alunos via mensagem de texto ao longo da semana. A " +
          "atividade era tão demorada e suscetível a erros que, com frequência, Marcos permanecia " +
          "acordado até as primeiras horas da madrugada de segunda-feira tentando finalizar o " +
          "planejamento da semana."
        ),
        body(
          "Esse modelo manual gerava uma série de problemas críticos:"
        ),
        bullet("Conflitos de horário: sem um sistema centralizado, era comum marcar dois alunos no mesmo horário."),
        bullet("Perda de controle de reposições: o histórico de faltas e créditos de reposição era mantido em papel, tornando fácil o esquecimento ou registro errado."),
        bullet("Sobrecarga de tempo: horas que poderiam ser dedicadas ao descanso ou ao aperfeiçoamento profissional eram consumidas por tarefas administrativas repetitivas."),
        bullet("Comunicação fragmentada: cancelamentos e reagendamentos chegavam por canais diferentes (WhatsApp, ligação, mensagem direta), sem registro formal centralizado."),
        bullet("Ausência de histórico: não havia como consultar rapidamente o histórico de aulas de um aluno específico, dificultando cobranças e planejamento pedagógico."),
        br(),
        body(
          "Diante desse cenário, ficou evidente a necessidade de uma solução digital que " +
          "automatizasse e centralizasse todo o processo de gestão, permitindo ao professor focar " +
          "no que realmente importa: ensinar música."
        ),

        // ── SOLUÇÃO PROPOSTA ───────────────────────────
        heading1("4. Proposta de Solução"),
        body(
          "A solução consiste em uma plataforma web moderna denominada Marcos Music, composta " +
          "por um frontend interativo desenvolvido em React/TypeScript e um backend robusto em " +
          "Java Spring Boot. O sistema centraliza todos os processos de gestão de aulas em um " +
          "único ambiente digital acessível de qualquer dispositivo conectado à internet."
        ),
        heading2("4.1. Funcionalidades Principais da Sprint 1 (MVP)"),
        bullet("Autenticação segura com cadastro e login por e-mail ou conta Google (OAuth2)."),
        bullet("Aceite digital de termos de uso com registro histórico auditável."),
        bullet("Dashboard interativo com visão panorâmica do dia, estatísticas e próximas aulas."),
        bullet("Agenda semanal/diária com criação, edição e cancelamento de aulas."),
        bullet("Cadastro e gestão completa de alunos com dados de contato e status de contrato."),
        bullet("Definição de disponibilidade semanal pelo professor."),
        bullet("Módulo de reposições: controle de faltas, créditos e agendamento de reposições."),
        bullet("Biblioteca de videoaulas para complemento pedagógico."),
        bullet("Central de alertas e notificações de cancelamentos e reagendamentos."),
        bullet("Reagendamento autônomo pelo aluno dentro das regras contratuais."),

        heading2("4.2. Benefícios Esperados"),
        bullet("Eliminação do controle manual em papel, reduzindo erros e conflitos de horário."),
        bullet("Recuperação das horas de domingo à noite antes gastas com planejamento manual."),
        bullet("Centralização de toda a comunicação e histórico de aulas em uma única plataforma."),
        bullet("Autonomia para os alunos gerenciarem suas próprias reposições e reagendamentos."),
        bullet("Geração automática de links para aulas online, integrando Google Calendar/Meet."),

        // ── TECNOLOGIAS ────────────────────────────────
        heading1("5. Tecnologias Utilizadas"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [bold("Camada", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Tecnologia", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Finalidade", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
              ],
            }),
            ...[
              ["Frontend", "React 18 + TypeScript", "Interface reativa e fortemente tipada"],
              ["Frontend", "Vite", "Build tool de alta performance"],
              ["Frontend", "Tailwind CSS", "Estilização utilitária e responsiva"],
              ["Frontend", "Framer Motion", "Animações e micro-interações"],
              ["Frontend", "React Router DOM", "Navegação entre páginas (SPA)"],
              ["Backend", "Java 21 + Spring Boot 3", "API REST robusta e segura"],
              ["Backend", "Spring Security + OAuth2", "Autenticação e autorização"],
              ["Backend", "Spring Data JPA / Hibernate", "Mapeamento ORM e persistência"],
              ["Banco de Dados", "PostgreSQL", "Armazenamento relacional dos dados"],
              ["Integração", "Google Calendar / Meet API", "Sincronização de agenda e aulas online"],
              ["Controle de Versão", "Git + GitHub", "Versionamento e colaboração em equipe"],
            ].map(([camada, tech, finalidade]) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [normal(camada)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [bold(tech, 22)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(finalidade)] })] }),
                ],
              })
            ),
          ],
        }),

        br(),

        // ── ARQUITETURA ────────────────────────────────
        heading1("6. Arquitetura do Sistema"),
        body(
          "O sistema adota uma arquitetura em três camadas bem definidas: Apresentação (Frontend " +
          "React/Vite), Lógica de Negócio (Backend Spring Boot) e Persistência (PostgreSQL). " +
          "A comunicação entre o frontend e o backend é realizada por meio de uma API RESTful " +
          "protegida por tokens JWT, garantindo segurança e escalabilidade."
        ),
        body(
          "O frontend é distribuído como uma Single Page Application (SPA), enquanto o backend " +
          "é empacotado como um serviço Spring Boot autossuficiente. Ambos os componentes são " +
          "independentes e podem ser deployados em infraestruturas de nuvem separadas."
        ),

        // ── EQUIPE ─────────────────────────────────────
        heading1("7. Equipe de Desenvolvimento"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [bold("Nome", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Função / Papel", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
              ],
            }),
            ...[
              ["Artur Costa Cavalcante Coelho", "Desenvolvedor Full Stack"],
              ["Bernardo Parreiras Prado", "Desenvolvedor Full Stack"],
              ["João Paulo Aguiar Prado", "Desenvolvedor Full Stack / Arquiteto"],
              ["Paulo Victor Fernandes de Araujo Silva", "Desenvolvedor Full Stack"],
              ["Rafael Nagem Volpini", "Desenvolvedor Full Stack / Scrum Master"],
            ].map(([nome, papel]) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [normal(nome)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(papel)] })] }),
                ],
              })
            ),
          ],
        }),

        br(),

        // ── CONSIDERAÇÕES FINAIS ───────────────────────
        heading1("8. Considerações Finais"),
        body(
          "Ao término da Sprint 1, a equipe entregou a fundação técnica e documental do sistema " +
          "Marcos Music. Os requisitos foram levantados em sessões de entrevista com o stakeholder " +
          "Marcos Mello Lima, o Document de Visão foi produzido, a arquitetura foi definida e as " +
          "primeiras telas do frontend foram implementadas e validadas."
        ),
        body(
          "O feedback inicial do stakeholder foi extremamente positivo, confirmando que a proposta " +
          "de solução endereça de forma precisa os problemas vivenciados no cotidiano de gestão " +
          "de suas aulas. As sprints seguintes irão aprofundar as funcionalidades do módulo de " +
          "reposições, a integração com Google Calendar e o módulo de notificações automáticas."
        ),
        body("Belo Horizonte, Junho de 2025."),
      ],
    },
  ],
});

// ──────────────────────────────────────────────
//  ATA DE REUNIÃO — 03/06/2026
// ──────────────────────────────────────────────
function linhaTabela(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "EDE7F6", fill: "EDE7F6" },
        children: [new Paragraph({ children: [bold(label, 22)] })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [normal(value, 22)] })],
      }),
    ],
  });
}

const ata = new Document({
  creator: "Marcos Music Team",
  title: "Ata de Reunião — 03/06/2026",
  sections: [
    {
      children: [
        // ── CABEÇALHO ──────────────────────────────────
        new Paragraph({
          children: [bold("PONTIFÍCIA UNIVERSIDADE CATÓLICA DE MINAS GERAIS", 22)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [normal("Curso de Engenharia de Software — Trabalho Interdisciplinar III", 20)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [bold("Projeto: Marcos Music — Sistema de Gestão de Aulas de Música", 22)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        br(),
        new Paragraph({
          children: [bold("ATA DE REUNIÃO Nº 01 — SPRINT 5", 28)],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        }),
        br(),

        // ── DADOS DA REUNIÃO ────────────────────────────
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            linhaTabela("Data:", "03 de junho de 2026"),
            linhaTabela("Horário:", "19h00 – 20h30"),
            linhaTabela("Local / Plataforma:", "Google Meet (videoconferência)"),
            linhaTabela("Tipo:", "Reunião de Revisão de Sprint (Sprint Review)"),
            linhaTabela("Próxima reunião:", "A definir"),
          ],
        }),

        br(),

        // ── PARTICIPANTES ───────────────────────────────
        heading1("1. Participantes"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [bold("Nome", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Papel", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("E-mail", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Presente", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
              ],
            }),
            ...[
              ["Marcos Mello Lima", "Stakeholder / Cliente", "marcosmellolima@email.com", "✓"],
              ["Artur Costa Cavalcante Coelho", "Desenvolvedor", "artur.coelho@sga.pucminas.br", "✓"],
              ["Bernardo Parreiras Prado", "Desenvolvedor", "bernardo.prado@sga.pucminas.br", "✓"],
              ["João Paulo Aguiar Prado", "Desenvolvedor / Arquiteto", "joao.prado@sga.pucminas.br", "✓"],
              ["Paulo Victor F. A. Silva", "Desenvolvedor", "paulo.silva@sga.pucminas.br", "✓"],
              ["Rafael Nagem Volpini", "Scrum Master / Dev", "rafael.volpini@sga.pucminas.br", "✓"],
            ].map(([nome, papel, email, presente]) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [normal(nome, 20)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(papel, 20)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(email, 20)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(presente, 20)] })], shading: { type: ShadingType.SOLID, color: "E8F5E9", fill: "E8F5E9" } }),
                ],
              })
            ),
          ],
        }),

        br(),

        // ── PAUTA ────────────────────────────────────────
        heading1("2. Pauta da Reunião"),
        bullet("Apresentação e validação das entregas da Sprint 5 com o stakeholder."),
        bullet("Demonstração ao vivo das funcionalidades implementadas na Sprint 5."),
        bullet("Coleta de feedback do stakeholder sobre as telas e fluxos entregues."),
        bullet("Levantamento de ajustes e melhorias solicitadas pelo stakeholder."),
        bullet("Alinhamento das prioridades para a próxima sprint."),

        br(),

        // ── APRESENTAÇÃO E DISCUSSÃO ─────────────────────
        heading1("3. Resumo das Discussões"),
        heading2("3.1. Demonstração das Funcionalidades da Sprint 5"),
        body(
          "A equipe apresentou ao stakeholder Marcos Mello Lima as seguintes funcionalidades " +
          "desenvolvidas e entregues ao longo da Sprint 5:"
        ),
        bullet("Central de Alertas e Notificações: exibição consolidada de cancelamentos, reagendamentos e pendências urgentes."),
        bullet("Módulo de Reagendamento Autônomo (ReschedulingPage): fluxo completo para alunos solicitarem reagendamento dentro das regras contratuais."),
        bullet("Melhorias na Agenda (CalendarView): overlay visual de reposições sobre o calendário semanal, facilitando a visualização de créditos pendentes."),
        bullet("Integração com Google Calendar: sincronização bidirecional de aulas com a agenda do Google, com modal de confirmação de sucesso."),
        bullet("Refinamentos de UX na interface geral: aplicação do design system premium com glassmorfismo, micro-animações via Framer Motion e suporte a modo escuro/claro."),

        heading2("3.2. Feedback do Stakeholder"),
        body(
          "O stakeholder demonstrou satisfação com as entregas, destacando a clareza visual da " +
          "Central de Alertas e a utilidade prática do módulo de reagendamento autônomo. Marcos " +
          "relatou que a eliminação do controle manual em papel representa um ganho imediato e " +
          "expressivo na sua rotina, especialmente ao comparar com as noites de domingo que " +
          "anteriormente eram inteiramente dedicadas à organização manual da agenda."
        ),
        body(
          "Foram apontadas as seguintes observações e solicitações de melhoria:"
        ),
        bullet("Adicionar notificação sonora ou visual mais destacada para novos cancelamentos de última hora."),
        bullet("Considerar um resumo semanal por e-mail automático com o balanço de aulas e reposições."),
        bullet("Verificar a usabilidade em dispositivos móveis, especialmente no calendário semanal."),

        br(),

        // ── DECISÕES ─────────────────────────────────────
        heading1("4. Decisões Tomadas"),
        bullet("Aprovar as entregas da Sprint 5 conforme apresentado."),
        bullet("Priorizar a responsividade mobile do componente CalendarView para a próxima sprint."),
        bullet("Avaliar a viabilidade do resumo semanal automatizado via e-mail na sprint seguinte."),
        bullet("Manter o backlog atualizado com os itens levantados no feedback do stakeholder."),

        br(),

        // ── PRÓXIMOS PASSOS ───────────────────────────────
        heading1("5. Próximos Passos / Ações"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [bold("#", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" }, width: { size: 5, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Ação", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Responsável", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" } }),
                new TableCell({ children: [new Paragraph({ children: [bold("Prazo", 22)] })], shading: { type: ShadingType.SOLID, color: "4A2580", fill: "4A2580" }, width: { size: 15, type: WidthType.PERCENTAGE } }),
              ],
            }),
            ...[
              ["1", "Implementar responsividade mobile no CalendarView", "João Paulo / Bernardo", "Sprint 6"],
              ["2", "Prototipar notificação sonora/visual para cancelamentos urgentes", "Rafael Volpini", "Sprint 6"],
              ["3", "Avaliar arquitetura para e-mail semanal automático (Spring Mail)", "Paulo Victor", "Sprint 6"],
              ["4", "Atualizar backlog e documentação (Documento de Visão, Casos de Uso)", "Artur Coelho", "Sprint 6"],
              ["5", "Agendar próxima reunião de revisão com stakeholder", "Rafael Volpini", "A definir"],
            ].map(([n, acao, resp, prazo]) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [normal(n, 20)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(acao, 20)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(resp, 20)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [normal(prazo, 20)] })] }),
                ],
              })
            ),
          ],
        }),

        br(),

        // ── ENCERRAMENTO ──────────────────────────────────
        heading1("6. Encerramento"),
        body(
          "Nada mais havendo a tratar, a reunião foi encerrada às 20h30 do dia 03 de junho de 2026. " +
          "Esta ata foi elaborada e deverá ser aprovada e assinada pelos participantes."
        ),
        br(), br(),

        // ── ASSINATURAS ───────────────────────────────────
        new Paragraph({ children: [bold("Assinaturas:", 22)], spacing: { after: 120 } }),
        br(),

        ...[
          ["Marcos Mello Lima", "Stakeholder"],
          ["Artur Costa Cavalcante Coelho", "Equipe"],
          ["Bernardo Parreiras Prado", "Equipe"],
          ["João Paulo Aguiar Prado", "Equipe"],
          ["Paulo Victor Fernandes de Araujo Silva", "Equipe"],
          ["Rafael Nagem Volpini", "Scrum Master"],
        ].map(([nome, papel]) =>
          new Paragraph({
            children: [
              new TextRun({ text: "_".repeat(50), size: 22 }),
              new TextRun({ text: `   ${nome} (${papel})`, size: 22 }),
            ],
            spacing: { after: 240 },
          })
        ),
      ],
    },
  ],
});

// ── SALVAR ARQUIVOS ────────────────────────────
const outDir = "..";

Packer.toBuffer(ebook).then((buf) => {
  writeFileSync(`${outDir}/Ebook_Sprint1_MarcosMusicr.docx`, buf);
  console.log("✓  Ebook_Sprint1_MarcosMusic.docx gerado");
});

Packer.toBuffer(ata).then((buf) => {
  writeFileSync(`${outDir}/Ata_Reuniao_03062026.docx`, buf);
  console.log("✓  Ata_Reuniao_03062026.docx gerado");
});
