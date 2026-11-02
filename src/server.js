const fastify = require('fastify')({ logger: true })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const path = require('path')

// O arquivo .env deve ficar na pasta principal ALTERRA, um nível acima de src.
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})

const Usuario = require('./models/Usuario')
const ObjetoCeleste = require('./models/ObjetoCeleste')

fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

// CADASTRO
fastify.post('/cadastro', async (request, reply) => {
  try {
    const nome = texto(request.body?.nome)
    const sobrenome = texto(request.body?.sobrenome)
    const email = texto(request.body?.email).toLowerCase()
    const senha = texto(request.body?.senha)

    if (!nome || !sobrenome || !email || !senha) {
      return reply.code(400).send({ erro: 'Preencha nome, sobrenome, e-mail e senha.' })
    }
    if (senha.length < 6) {
      return reply.code(400).send({ erro: 'A senha precisa ter pelo menos 6 caracteres.' })
    }

    const existente = await Usuario.findOne({ email })
    if (existente) {
      return reply.code(409).send({ erro: 'Este e-mail já está cadastrado.' })
    }

    // O hook pre-save do Usuario.js aplica o hash da senha.
    const novoUsuario = new Usuario({ nome, sobrenome, email, senha })
    await novoUsuario.save()

    return reply.code(201).send({
      mensagem: 'Cadastro realizado com sucesso!',
      usuario: {
        _id: novoUsuario._id,
        nome: novoUsuario.nome,
        sobrenome: novoUsuario.sobrenome,
        email: novoUsuario.email,
        pontos: novoUsuario.pontos
      }
    })
  } catch (erro) {
    request.log.error(erro, 'Erro no cadastro')
    if (erro.code === 11000) {
      return reply.code(409).send({ erro: 'Este e-mail já está cadastrado.' })
    }
    return reply.code(500).send({ erro: 'Erro interno ao realizar cadastro.' })
  }
})

// LOGIN
fastify.post('/login', async (request, reply) => {
  try {
    const email = texto(request.body?.email).toLowerCase()
    const senha = texto(request.body?.senha)

    if (!email || !senha) {
      return reply.code(400).send({ erro: 'Informe e-mail e senha.' })
    }

    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
      return reply.code(401).send({ erro: 'E-mail ou senha incorretos.' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return reply.code(401).send({ erro: 'E-mail ou senha incorretos.' })
    }

    return reply.send({
      mensagem: `Bem-vindo de volta, ${usuario.nome}!`,
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        pontos: usuario.pontos
      }
    })
  } catch (erro) {
    request.log.error(erro, 'Erro no login')
    return reply.code(500).send({ erro: 'Erro interno no servidor ao fazer login.' })
  }
})

// CRIAR OBJETO CELESTE
fastify.post('/criar-objeto', async (request, reply) => {
  try {
    const dados = request.body || {}
    const nome = texto(dados.nome)
    const tipo = texto(dados.tipo)
    const criadorId = texto(dados.criadorId)

    if (!nome || !tipo) {
      return reply.code(400).send({ erro: 'Nome e tipo são obrigatórios.' })
    }
    if (!mongoose.Types.ObjectId.isValid(criadorId)) {
      return reply.code(400).send({ erro: 'Identificação do usuário inválida ou ausente. Entre novamente na sua conta.' })
    }

    const criadorExiste = await Usuario.exists({ _id: criadorId })
    if (!criadorExiste) {
      return reply.code(401).send({ erro: 'Usuário não encontrado. Faça login novamente.' })
    }

    const novoObjeto = new ObjetoCeleste({
      nome,
      tipo,
      modo: dados.modo || 'livre',
      tamanho: dados.tamanho ?? 1.3,
      temperatura: dados.temperatura ?? 15,
      corBase: dados.corBase || '#a6a6b5',
      corAgua: dados.corAgua || '#1d4ed8',
      corTerra: dados.corTerra || '#4f8a45',
      corAneis: dados.corAneis || '#c6b7e5',
      tipoPlaneta: dados.tipoPlaneta || 'terrestre',
      temAgua: dados.temAgua ?? true,
      temTerra: dados.temTerra ?? true,
      descricao: dados.descricao || '',
      curiosidade: dados.curiosidade || '',
      atmosfera: dados.atmosfera ?? true,
      aneis: dados.aneis ?? false,
      criadorId
    })

    await novoObjeto.save()
    return reply.code(201).send({ mensagem: 'Corpo celeste criado com sucesso!', objeto: novoObjeto })
  } catch (erro) {
    request.log.error(erro, 'Erro ao criar objeto celeste')
    return reply.code(500).send({ erro: 'Erro interno ao criar o objeto no servidor.' })
  }
})

// LISTAR OBJETOS
fastify.get('/objetos', async (request, reply) => {
  try {
    const objetos = await ObjetoCeleste.find().sort({ createdAt: -1 })
    return reply.send(objetos)
  } catch (erro) {
    request.log.error(erro, 'Erro ao buscar objetos')
    return reply.code(500).send({ erro: 'Erro interno ao buscar o universo.' })
  }
})

fastify.get('/health', async () => ({ status: 'ok', banco: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado' }))

async function iniciarServidor() {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI não foi encontrada. Confira o arquivo .env na pasta ALTERRA.')

    await mongoose.connect(uri)
    fastify.log.info('MongoDB conectado com sucesso!')

    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    fastify.log.info('ALTERRA disponível em http://localhost:3000')
  } catch (erro) {
    fastify.log.error(erro)
    process.exit(1)
  }
}

iniciarServidor()
