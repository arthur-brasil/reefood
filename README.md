🌿 ReFood
Menos desperdício, mais futuro.

Aplicativo mobile para redução do desperdício de alimentos no cotidiano, por meio do controle inteligente do estoque doméstico, monitoramento de prazos de validade, alertas preventivos de vencimento, sugestões de receitas e relatórios de desperdício.

Projeto acadêmico da disciplina de Engenharia de Software — 2026.

👥 Integrantes e responsabilidades
Integrante	Responsabilidade
Arthur Brasil	Firebase + PostgreSQL (configuração de banco e serviços de API)
Guilherme Luiz Almeida	React Native + Expo (telas mobile, navegação e tema)
Lucas Lonardi	Node.js + Express (server, rotas, controllers e models)
Henrique Borges	GitHub + Railway (repositório, README e deploy)
✅ Conceito de Pronto (Definition of Done)
Uma User Story só é considerada pronta quando:

Backend implementado e funcionando
Frontend implementado e funcionando
Critério de aceitação da User Story validado
Validado por outro membro da equipe
🛠️ Stack do projeto
Mobile: React Native + Expo
Backend: Node.js + Express
Banco de dados: PostgreSQL (hospedado no Railway, com SSL)
Autenticação e notificações: Firebase (Auth + Cloud Messaging)
API de receitas: TheMealDB
💻 Como montar o ambiente de desenvolvimento
1. Pré-requisitos
Instale na máquina:

Node.js (versão LTS)
Git
VS Code
App Expo Go no celular (Android ou iOS)
2. Clonar o repositório
bash
git clone https://github.com/borgeshenriq/REFOOD.git
cd REFOOD
3. Configurar o backend
Dentro da pasta do backend, crie um arquivo .env:

DATABASE_URL=postgresql://USUARIO:SENHA@HOST:PORTA/BANCO
PORT=3000
A DATABASE_URL é a connection string do Railway. A conexão exige SSL.

Instale as dependências:

bash
npm install
4. Configurar o mobile
Dentro da pasta mobile, crie um arquivo .env:

API_URL=http://SEU_IPV4:3000
⚠️ Atenção (laboratório): o IPv4 da máquina muda a cada sessão. Sempre confira o IP atual e atualize o API_URL no .env do mobile (e o BASE_URL no api.js) antes de rodar.

Instale as dependências:

bash
npm install
5. Configurar o Firebase
O arquivo de configuração do Firebase (firebase.js) já está no projeto. Garanta que as credenciais estão preenchidas para que login e notificações funcionem.

▶️ Como executar o projeto
Backend
bash
cd backend
npm start
O servidor sobe em http://localhost:3000.

Mobile
bash
cd mobile
npx expo start
Escaneie o QR Code com o app Expo Go no celular.

O celular e o PC precisam estar na mesma rede Wi-Fi.

🔄 Como atualizar o GitHub
📌 Regra de ouro: sempre dê git pull antes de qualquer push, para evitar conflitos com os colegas.

bash
# 1. Sempre puxe as alterações dos colegas primeiro
git pull origin main

# 2. Adicione apenas os arquivos da SUA parte
git add caminho/do/seu/arquivo

# 3. Faça o commit com uma mensagem clara
git commit -m "descrição clara do que foi feito"

# 4. Suba para o repositório
git push origin main
🧪 Problema de credencial no laboratório
Se aparecer erro de credencial (PC compartilhado já logado com outra conta), force o seu usuário na URL do remote:

bash
git remote set-url origin https://SEU_USUARIO@github.com/borgeshenriq/REFOOD.git
🌿 ReFood — Engenharia de Software · 2026
