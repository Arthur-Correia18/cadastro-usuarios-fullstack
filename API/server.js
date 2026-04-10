import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token não enviado.",
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({
      message: "Token inválido.",
    });
  }

  const [scheme, token] = parts;

  if (scheme !== "Bearer") {
    return res.status(401).json({
      message: "Token mal formatado.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token expirado ou inválido.",
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Somente administrador pode fazer isso.",
    });
  }

  next();
}

app.post("/usuarios", async (req, res) => {
  try {
    const { name, age, email, password } = req.body;

    if (!name || !age || !email || !password) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Digite um e-mail válido.",
      });
    }

    if (Number(age) <= 0) {
      return res.status(400).json({
        message: "A idade deve ser maior que 0.",
      });
    }

    if (Number(age) > 110) {
      return res.status(400).json({
        message: "A idade máxima permitida é 110 anos.",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Este e-mail já está cadastrado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        age: Number(age),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "user",
      },
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("ERRO POST /usuarios:", error);
    return res.status(500).json({
      message: "Erro ao cadastrar usuário.",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Usuário sem senha cadastrada.",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("ERRO POST /login:", error);
    return res.status(500).json({
      message: "Erro ao fazer login.",
      error: error.message,
    });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const admin = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!admin) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Este usuário não é administrador.",
      });
    }

    if (!admin.password) {
      return res.status(400).json({
        message: "Administrador sem senha cadastrada.",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(password, admin.password);

    if (!passwordIsCorrect) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = createToken(admin);

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log("ERRO POST /admin/login:", error);
    return res.status(500).json({
      message: "Erro ao fazer login do admin.",
      error: error.message,
    });
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        name: true,
        age: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log("ERRO GET /me:", error);
    return res.status(500).json({
      message: "Erro ao buscar usuário logado.",
      error: error.message,
    });
  }
});

app.get("/admin/me", authMiddleware, adminOnly, async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        name: true,
        age: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json(admin);
  } catch (error) {
    console.log("ERRO GET /admin/me:", error);
    return res.status(500).json({
      message: "Erro ao buscar administrador.",
      error: error.message,
    });
  }
});

app.get("/usuarios", authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        age: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.log("ERRO GET /usuarios:", error);
    return res.status(500).json({
      message: "Erro ao buscar usuários.",
      error: error.message,
    });
  }
});

app.delete("/usuarios/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.user.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    return res.status(200).json({
      message: "Usuário deletado com sucesso!",
    });
  } catch (error) {
    console.log("ERRO DELETE /usuarios/:id:", error);
    return res.status(500).json({
      message: "Erro ao deletar usuário.",
      error: error.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
});