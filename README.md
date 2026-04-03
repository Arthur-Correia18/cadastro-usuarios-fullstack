# Cadastro de Usuários Full Stack

Aplicação full stack para cadastro, listagem e remoção de usuários, com frontend em React e backend em Node.js.

🛠️ Tecnologias utilizadas

    - Frontend
    |
- React
- Vite
- Axios
- CSS

    - Backend
    |
- Node.js
- Express
- Prisma
- CORS

    - Banco de dados
    |
- MongoDB


⚙️ Funcionalidades

  🎨 Frontend

- Formulário de cadastro
- Validação de campos
- Listagem de usuários
- Botão de deletar
- Mensagens de erro/sucesso (toast)
- Loading no botão

  🔧 Backend

POST /usuarios → Criar usuário
GET /usuarios → Listar usuários
PUT /usuarios/:id → Atualizar usuário
DELETE /usuarios/:id → Deletar usuário

    🔐 Validações

  -Frontend
Nome obrigatório
Idade obrigatória
Idade maior que 0
E-mail válido
Bloqueio de e-mail duplicado

    - Backend

Nome obrigatório
E-mail obrigatório
Idade obrigatória
Idade maior que 0
Validação de e-mail
Tratamento de e-mail duplicado

🗃️ Banco de dados

Modelo User:

model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  email String @unique
  name  String
  age   Int
}

## 🗂️ Estrutura do projeto

```bash
cadastro-usuarios-fullstack/
├── API/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── server.js
└── cadastro-de-usuarios/
    ├── public/
    ├── src/
    │   ├── pages/
    │   │   └── Home/
    │   ├── services/
    │   ├── assets/
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── index.html
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

## Deploy

Frontend: [https://cadastrousuariosfullstack.vercel.app/]
Backend: [https://cadastro-usuarios-fullstack.onrender.com]

🎯 Objetivo
Praticar CRUD completo
Integração frontend + backend
Uso do Prisma
Consumo de API
Organização full stack

Autor

Arthur Correia

GitHub: https://github.com/Arthur-Correia18
