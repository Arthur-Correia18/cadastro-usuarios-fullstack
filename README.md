# Cadastro de Usuários Full Stack

Aplicação full stack para cadastro, listagem e remoção de usuários, com frontend em React e backend em Node.js.

## Tecnologias utilizadas

### Frontend
- React
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express
- Prisma
- MongoDB
- CORS

## Funcionalidades
- Cadastrar usuários
- Listar usuários
- Deletar usuários
- Integração entre frontend e API

## Estrutura do projeto

```bash
cadastro-usuarios-fullstack/
├── API/
├── cadastro-de-usuarios/
└── .gitignore
Como executar o projeto
1. Clonar o repositório
git clone https://github.com/Arthur-Correia18/cadastro-usuarios-fullstack.git
cd cadastro-usuarios-fullstack
2. Rodar o backend
cd API
npm install
node server.js
3. Rodar o frontend

Abra outro terminal:

cd cadastro-de-usuarios
npm install
npm run dev
Rotas da API
Listar usuários
GET /usuarios
Criar usuário
POST /usuarios
Deletar usuário
DELETE /usuarios/:id
Exemplo de usuário
{
  "name": "Arthur",
  "age": 20,
  "email": "arthur@email.com"
}
Objetivo do projeto

Este projeto foi desenvolvido para praticar conceitos de desenvolvimento full stack, integração com API, manipulação de dados e operações CRUD.

Autor

Arthur Correia

GitHub: https://github.com/Arthur-Correia18
