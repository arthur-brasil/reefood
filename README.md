🌿 ReFood — Product Backlog
> **Redução do Desperdício de Alimentos** | Engenharia de Software 2026  
> Equipe: Arthur Brasil · Guilherme Luiz · Henrique Borges · Lucas Lonardi
---
📊 Resumo
User Stories	Prioridade Alta	Prioridade Média	Prioridade Baixa	Story Points	Sprints
14	6	5	3	58 SP	4
---
📋 User Stories
ID	User Story	Critério de Aceitação	Req.	Prioridade	SP	Sprint	Origem	Status
US-01	Como usuário, quero cadastrar um alimento informando nome, categoria, quantidade, unidade e data de validade para controlar meu estoque.	Todos os campos obrigatórios validados, item aparece na listagem imediatamente	RF03	🔴 Alta	8	Sprint 1	Entrevista	⬜ A Fazer
US-02	Como novo usuário, quero me cadastrar com nome, e-mail e senha para ter minha conta individual no ReFood.	Cadastro salvo, e-mail único, senha criptografada, feedback de erro em campos inválidos	RF01	🔴 Alta	5	Sprint 1	Entrevista	⬜ A Fazer
US-03	Como usuário cadastrado, quero fazer login com e-mail e senha para acessar meus dados com segurança.	Login funcional, sessão mantida, mensagem de erro em dados inválidos	RF02	🔴 Alta	3	Sprint 1	Entrevista	⬜ A Fazer
US-04	Como usuário, quero recuperar minha senha por e-mail para não perder acesso à minha conta.	E-mail enviado em até 1 min, link de redefinição funcional por 24h	RF02	🟡 Média	3	Sprint 1	Questionário	⬜ A Fazer
US-05	Como usuário, quero visualizar a lista completa dos meus alimentos, podendo filtrar por categoria e ordenar por validade, para encontrar itens rapidamente.	Filtros funcionais, badges de status por cor, ordenação correta por data	RF06	🔴 Alta	5	Sprint 2	Entrevista	⬜ A Fazer
US-06	Como usuário, quero atualizar a data de validade de um alimento para corrigir informações incorretas.	Edição salva corretamente, data refletida nos alertas em tempo real	RF04	🔴 Alta	3	Sprint 2	Questionário	⬜ A Fazer
US-07	Como usuário, quero editar os dados de um alimento cadastrado para manter as informações sempre corretas.	Todos os campos editáveis, alterações persistem após fechar o app	RF05	🟡 Média	3	Sprint 2	Análise Similares	⬜ A Fazer
US-08	Como usuário, quero excluir um alimento do estoque para remover itens consumidos ou descartados.	Confirmação antes de deletar, item removido da lista imediatamente	RF05	🟡 Média	2	Sprint 2	Análise Similares	⬜ A Fazer
US-09	Como usuário, quero receber notificações automáticas quando um alimento estiver próximo ao vencimento para não perder prazos.	Notificação disparada conforme antecedência configurada, push notification funcionando em Android e iOS	RF07	🔴 Alta	8	Sprint 3	Entrevista	⬜ A Fazer
US-10	Como usuário, quero configurar com quantos dias de antecedência quero ser alertado (1 a 7 dias) para personalizar minha experiência.	Slider/seletor de 1 a 7 dias, configuração salva por alimento, padrão 3 dias	RF07	🟡 Média	3	Sprint 3	Questionário	⬜ A Fazer
US-11	Como usuário, quero criar uma lista de compras com itens em falta ou com estoque baixo para organizar minhas compras.	Adicionar/remover itens da lista, marcar como comprado, lista persiste entre sessões	RF08	🟡 Média	5	Sprint 3	Análise Similares	⬜ A Fazer
US-12	Como usuário, quero visualizar um relatório com os alimentos que venceram ou foram descartados para entender meu padrão de desperdício.	Relatório por período, gráfico por categoria, ranking dos mais desperdiçados	RF09	🔴 Alta	8	Sprint 4	Entrevista	⬜ A Fazer
US-13	Como usuário, quero registrar um alimento como "consumido" ou "descartado" para que o sistema contabilize no relatório.	Ação registrada com data e tipo, impacto visível no relatório do período	RF09	🟢 Baixa	3	Sprint 4	Entrevista	⬜ A Fazer
US-14	Como usuário, quero compartilhar minha lista de compras com outros membros da casa para facilitar as compras em família.	Lista compartilhável via link ou contato, atualizações em tempo real para todos	RF08	🟢 Baixa	5	Sprint 4	Análise Similares	⬜ A Fazer
---
🚀 Planejamento de Sprints
Sprint	Foco	User Stories	Story Points	Observações
Sprint 1	Base do Sistema	US-01, US-02, US-03, US-04	19 SP	Autenticação, cadastro de usuários e primeiro cadastro de alimento
Sprint 2	Gestão do Estoque	US-05, US-06, US-07, US-08	13 SP	Listagem com filtros, edição e exclusão de alimentos
Sprint 3	Alertas e Lista	US-09, US-10, US-11	16 SP	Notificações push configuráveis e lista de compras
Sprint 4	Relatórios e Extras	US-12, US-13, US-14	16 SP	Relatório de desperdício, registro de consumo/descarte e compartilhamento
TOTAL			58 SP	
---
🔒 Requisitos Não Funcionais
ID	Requisito	Descrição	Critério de Aceitação	Prioridade	Categoria
RNF-01	Usabilidade	Interface simples e intuitiva, sem necessidade de treinamento prévio	Novos usuários completam cadastro e primeiro alimento em até 3 minutos sem ajuda externa	🔴 Alta	UX
RNF-02	Desempenho	Tempo de resposta máximo de 2 segundos nas operações principais	Cadastro, listagem e alertas respondem em ≤ 2s em conexão 4G mínima	🔴 Alta	Performance
RNF-03	Disponibilidade	Sistema disponível 24/7 com mínimo de 99% de uptime	Downtime máximo de 7h/mês, monitorado por ferramenta externa de uptime	🔴 Alta	Infraestrutura
RNF-04	Segurança (LGPD)	Dados protegidos por criptografia e controle de acesso conforme LGPD	Senhas com hash bcrypt, dados em trânsito via HTTPS/TLS, conformidade LGPD Lei 13.709/2018	🔴 Alta	Segurança
RNF-05	Portabilidade	Compatível com Android, iOS e navegadores web desktop e notebook	Testado em Android 10+, iOS 14+, Chrome/Firefox/Safari nas versões mais recentes	🟡 Média	Compatibilidade
RNF-06	Manutenibilidade	Código documentado com separação de responsabilidades	Cobertura de comentários ≥ 70%, arquitetura MVC documentada no repositório	🟢 Baixa	Qualidade
---
Backlog gerado para a disciplina de Engenharia de Software 2026.
