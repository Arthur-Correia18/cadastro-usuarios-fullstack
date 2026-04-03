import { PrismaClient } from "@prisma/client";
import express from 'express'
import cors from 'cors'

const prisma = new PrismaClient()

const app = express()

app.use(express.json())
app.use(cors())

function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email)
}

app.post('/usuarios', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.age) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })
        }

        if (!validateEmail(req.body.email)) {
            return res.status(400).json({ message: 'Digite um e-mail válido.' })
        }

        if (Number(req.body.age) <= 0) {
            return res.status(400).json({ message: 'A idade deve ser maior que 0.' })
        }

        if (Number(req.body.age) > 110) {
            return res.status(400).json({ message: 'A idade máxima permitida é 110 anos.' })
        }

        await prisma.user.create({
            data: {
                email: req.body.email,
                name: req.body.name,
                age: req.body.age
            }
        })

        res.status(201).json(req.body)
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' })
        }

        console.log(error)
        res.status(500).json({ message: 'Erro ao cadastrar usuário.' })
    }
})

app.get('/usuarios', async (req, res) => {
    let users = []

    if (req.query.name || req.query.email || req.query.age) {
        users = await prisma.user.findMany({
            where: {
                name: req.query.name,
                email: req.query.email,
                age: req.query.age
            }
        })

    } else {
        users = await prisma.user.findMany()
    }

    res.status(200).json(users)
})

app.put('/usuarios/:id', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.age) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })
        }

        if (!validateEmail(req.body.email)) {
            return res.status(400).json({ message: 'Digite um e-mail válido.' })
        }

        if (Number(req.body.age) <= 0) {
            return res.status(400).json({ message: 'A idade deve ser maior que 0.' })
        }

        if (Number(req.body.age) > 110) {
            return res.status(400).json({ message: 'A idade máxima permitida é 110 anos.' })
        }

        await prisma.user.update({
            where: {
                id: req.params.id
            },
            data: {
                email: req.body.email,
                name: req.body.name,
                age: req.body.age
            }
        })

        res.status(201).json(req.body)
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' })
        }

        console.log(error)
        res.status(500).json({ message: 'Erro ao editar usuário.' })
    }
})

app.delete('/usuarios/:id', async (req, res) => {
    await prisma.user.delete({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({ message: 'usuario deletado com sucesso!' })
})

app.listen(3000)

/*
Criar nossa API de Usuarios 
- Criar um usuario
- Listar todos os usuarios
- Editar um usuario
- Deletar um usuario
*/