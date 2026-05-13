# Documento de Visão: Marcos Music (Sistema de Gestão de Aulas de Música)

## 1. Introdução
Este documento define a visão geral do sistema **Marcos Music** (Escola de Música). O objetivo é fornecer uma compreensão clara do propósito, escopo, funcionalidades e principais entidades que compõem o sistema, facilitando o alinhamento técnico e de negócios.

## 2. Oportunidade de Negócio e Propósito
O sistema visa modernizar e automatizar a gestão de uma escola de música ou de professores particulares (foco no professor Marcos). O problema resolvido inclui a eliminação do controle manual de agendas, o gerenciamento de faltas e reposições de aulas (que costuma ser complexo e propenso a conflitos) e a centralização de comunicação, aulas agendadas e material didático (videoaulas). 

Com este sistema, professores ganham previsibilidade e organização, enquanto alunos ganham autonomia para agendar, cancelar ou reagendar suas aulas seguindo regras contratuais.

## 3. Perfis dos Usuários (Atores)
O sistema foi projetado para atender aos seguintes perfis:

* **Professor (Administrador do próprio tempo):** Responsável por definir sua grade de horários disponíveis, validar agendamentos e gerenciar o conteúdo oferecido.
* **Aluno:** Usuário que consome as aulas. Possui autonomia para visualizar a agenda, marcar aulas, solicitar reagendamentos ou reposições e consumir as videoaulas.
* **Usuário sem Login (Visitante):** Pode visualizar a página "Sobre Mim" e as "Informações de Contato" do professor/escola para conhecer o serviço.
* **Sistema (Ator automatizado):** Atua de forma autônoma para enviar notificações, validar regras de contratos de reposição, confirmar presenças e gerar links para reuniões online.

## 4. Escopo e Principais Funcionalidades
A plataforma oferece um conjunto robusto de casos de uso (UCs) divididos nos seguintes pilares:

### 4.1. Gestão de Agenda e Aulas
* **Definir Disponibilidade:** O professor cadastra os horários livres na semana.
* **Agendamento e Remarcação:** O aluno pode escolher horários para novas aulas ou reagendar aulas existentes, dependendo da disponibilidade.
* **Cancelamento:** Cancelar aulas com devida notificação aos envolvidos.
* **Gestão de Reposições:** Controle de faltas e aulas canceladas para criar créditos de reposição baseados nas regras do contrato.
* **Aulas Remotas:** Integração para gerar links de reuniões online automaticamente para aulas à distância.

### 4.2. Relacionamento e Engajamento
* **Notificações:** Alertas automáticos via sistema/e-mail sobre agendamentos, remarcações e cancelamentos.
* **Confirmação de Presença:** Fluxo para que os alunos confirmem se comparecerão à aula agendada.
* **Acesso a Videoaulas:** Biblioteca de vídeos onde o aluno pode complementar seu estudo.

### 4.3. Segurança e Acesso
* Cadastro, Autenticação e aceite de Termos de Uso (histórico auditável de aceite de termos).

## 5. Visão da Arquitetura e Modelo de Domínio
O sistema adota uma arquitetura Web Moderna (Frontend com **React/Vite** e Backend com **Java Spring Boot**) e organiza seus dados ao redor das seguintes entidades principais:

* **Usuário e Aluno:** Controle de acesso (Roles de USER/ADMIN), dados de contato, status de contrato e saldo de reposições.
* **Disponibilidade:** Horários que o professor marca como livres.
* **Aula:** O evento principal. Pode ser recorrente, ter sua presença confirmada, ser cancelada ou ser classificada como uma aula de reposição.
* **AulaAluno:** Mapeamento de logs ou horários recorrentes atrelados ao aluno.
* **Reposição:** Uma entidade dedicada a tratar as exceções (quando uma aula normal não acontece e precisa ser compensada), avaliando o status e vinculando-se a disponibilidades futuras.
* **TermsHistory:** Rastreamento do aceite de contratos pelos alunos.

---
