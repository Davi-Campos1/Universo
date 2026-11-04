const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})

const Fastify = require('fastify')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const cors = require('@fastify/cors')

const Usuario = require('./models/Usuario')
const ObjetoCeleste = require('./models/ObjetoCeleste')

const fastify = Fastify({ logger: true })

// CONFIGURAÇÕES DA ECONOMIA ALTERRA
const PONTOS_INICIAIS = 10000
const PONTOS_TESTE = 10000
const PRECOS = {
  lua: 25,
  estrela: 50,
  buraco_negro: 100,
  tipoPlaneta: 5,
  atmosfera: 10,
  aneis: 13
}
const COBRANCA_ATIVA = true

fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

function booleano(valor, padrao = false) {
  if (valor === undefined || valor === null) return padrao
  if (typeof valor === 'boolean') return valor
  if (valor === 'true' || valor === 1 || valor === '1') return true
  if (valor === 'false' || valor === 0 || valor === '0') return false
  return padrao
}

function calcularCusto(dados, tipo, tipoPlaneta, atmosfera, aneis) {
  let custo = 0
  const detalhes = []

  if (tipo === 'lua') {
    custo += PRECOS.lua
    detalhes.push({ item: 'Criar lua', pontos: PRECOS.lua })
  } else if (tipo === 'estrela') {
    custo += PRECOS.estrela
    detalhes.push({ item: 'Criar estrela', pontos: PRECOS.estrela })
  } else if (tipo === 'buraco_negro') {
    custo += PRECOS.buraco_negro
    detalhes.push({ item: 'Criar buraco negro', pontos: PRECOS.buraco_negro })
  }

  if (tipo === 'planeta') {
    // O padrão gratuito é o planeta com água e terra (valor interno: terrestre).
    if (tipoPlaneta !== 'terrestre' && tipoPlaneta !== 'agua e terra') {
      custo += PRECOS.tipoPlaneta
      detalhes.push({ item: 'Tipo personalizado de planeta', pontos: PRECOS.tipoPlaneta })
    }

    if (atmosfera) {
      custo += PRECOS.atmosfera
      detalhes.push({ item: 'Atmosfera', pontos: PRECOS.atmosfera })
    }

    if (aneis) {
      custo += PRECOS.aneis
      detalhes.push({ item: 'Anéis', pontos: PRECOS.aneis })
    }
  }

  return { custo, detalhes }
}

async function conectarBanco() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI não encontrada no arquivo .env')
  await mongoose.connect(uri)
  console.log('🟢 MongoDB conectado com sucesso!')
}

fastify.get('/health', async () => ({
  status: 'online',
  mensagem: 'Servidor ALTERRA funcionando!',
  cobrancaAtiva: COBRANCA_ATIVA,
  precos: PRECOS
}))

// CADASTRO: novas contas começam com 10.000 pontos durante os testes.
fastify.post('/cadastro', async (request, reply) => {
  try {
    const dados = request.body || {}
    const nome = texto(dados.nome)
    const sobrenome = texto(dados.sobrenome)
    const email = texto(dados.email).toLowerCase()
    const senha = texto(dados.senha)

    if (!nome || !sobrenome || !email || !senha) {
      return reply.code(400).send({ erro: 'Preencha todos os campos.' })
    }
    if (!email.includes('@')) {
      return reply.code(400).send({ erro: 'Informe um e-mail válido.' })
    }
    if (senha.length < 6) {
      return reply.code(400).send({ erro: 'A senha precisa ter pelo menos 6 caracteres.' })
    }

    const usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      return reply.code(409).send({ erro: 'Este e-mail já está cadastrado.' })
    }

    const novoUsuario = new Usuario({
      nome,
      sobrenome,
      email,
      senha,
      pontos: PONTOS_INICIAIS
    })
    await novoUsuario.save()

    return reply.code(201).send({
      mensagem: 'Cadastro realizado com sucesso!',
      pontosIniciais: PONTOS_INICIAIS
    })
  } catch (erro) {
    request.log.error(erro)
    return reply.code(500).send({ erro: 'Não foi possível realizar o cadastro.' })
  }
})

// LOGIN
fastify.post('/login', async (request, reply) => {
  try {
    const dados = request.body || {}
    const email = texto(dados.email).toLowerCase()
    const senha = texto(dados.senha)

    if (!email || !senha) {
      return reply.code(400).send({ erro: 'Informe o e-mail e a senha.' })
    }

    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
      return reply.code(401).send({ erro: 'E-mail ou senha incorretos.' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return reply.code(401).send({ erro: 'E-mail ou senha incorretos.' })
    }

    const usuarioSeguro = usuario.toObject()
    delete usuarioSeguro.senha

    return reply.send({
      mensagem: 'Login realizado com sucesso!',
      usuario: usuarioSeguro
    })
  } catch (erro) {
    request.log.error(erro)
    return reply.code(500).send({ erro: 'Não foi possível realizar o login.' })
  }
})

// ROTA TEMPORÁRIA PARA COLOCAR A CONTA DE TESTE COM 10.000 PONTOS.
// Remover ou proteger com autenticação antes de publicar o ALTERRA.
fastify.post('/teste/adicionar-pontos', async (request, reply) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return reply.code(403).send({ erro: 'Rota disponível somente para testes.' })
    }

    const criadorId = texto(request.body?.criadorId)
    if (!mongoose.Types.ObjectId.isValid(criadorId)) {
      return reply.code(400).send({ erro: 'ID de usuário inválido.' })
    }

    const usuario = await Usuario.findByIdAndUpdate(
      criadorId,
      { $set: { pontos: PONTOS_TESTE } },
      { new: true, runValidators: true }
    )

    if (!usuario) return reply.code(404).send({ erro: 'Usuário não encontrado.' })

    return reply.send({ mensagem: 'Pontos de teste atualizados!', pontos: usuario.pontos })
  } catch (erro) {
    request.log.error(erro)
    return reply.code(500).send({ erro: 'Não foi possível atualizar os pontos.' })
  }
})

// CRIAR OBJETO E DESCONTAR OS PONTOS NO SERVIDOR.
fastify.post('/criar-objeto', async (request, reply) => {
  let pontosDescontados = 0
  let usuarioIdParaEstorno = null

  try {
    const dados = request.body || {}
    const nome = texto(dados.nome)
    const tipo = texto(dados.tipo).toLowerCase()
    const criadorId = texto(dados.criadorId)

    if (!nome || !tipo) {
      return reply.code(400).send({ erro: 'Nome e tipo são obrigatórios.' })
    }

    const tiposPermitidos = ['planeta', 'lua', 'estrela', 'buraco_negro']
    if (!tiposPermitidos.includes(tipo)) {
      return reply.code(400).send({ erro: 'Tipo de objeto inválido.' })
    }

    if (!mongoose.Types.ObjectId.isValid(criadorId)) {
      return reply.code(400).send({ erro: 'Identificação do usuário inválida.' })
    }

    const tamanho = Number(dados.tamanho ?? 1.3)
    const temperatura = Number(dados.temperatura ?? 15)
    if (!Number.isFinite(tamanho) || tamanho <= 0) {
      return reply.code(400).send({ erro: 'O tamanho informado é inválido.' })
    }
    if (!Number.isFinite(temperatura)) {
      return reply.code(400).send({ erro: 'A temperatura informada é inválida.' })
    }

    const tipoPlaneta = texto(dados.tipoPlaneta) || 'terrestre'
    const atmosfera = tipo === 'planeta' ? booleano(dados.atmosfera, false) : false
    const aneis = tipo === 'planeta' ? booleano(dados.aneis, false) : false
    const temAgua = booleano(dados.temAgua, true)
    const temTerra = booleano(dados.temTerra, true)

    const { custo, detalhes } = calcularCusto(
      dados,
      tipo,
      tipoPlaneta,
      atmosfera,
      aneis
    )

    // Desconto atômico: duas requisições simultâneas não conseguem gastar o mesmo saldo.
    let usuario
    if (custo > 0) {
      usuario = await Usuario.findOneAndUpdate(
        { _id: criadorId, pontos: { $gte: custo } },
        { $inc: { pontos: -custo } },
        { new: true, runValidators: true }
      )

      if (!usuario) {
        const conta = await Usuario.findById(criadorId).select('pontos')
        if (!conta) {
          return reply.code(404).send({ erro: 'Usuário não encontrado. Faça login novamente.' })
        }
        return reply.code(400).send({
          erro: `Pontos insuficientes. Esta criação custa ${custo} pontos e seu saldo é ${conta.pontos ?? 0}.`,
          custo,
          pontosDisponiveis: conta.pontos ?? 0,
          pontosNecessarios: custo
        })
      }

      pontosDescontados = custo
      usuarioIdParaEstorno = usuario._id
    } else {
      usuario = await Usuario.findById(criadorId)
      if (!usuario) {
        return reply.code(404).send({ erro: 'Usuário não encontrado. Faça login novamente.' })
      }
    }

    const novoObjeto = new ObjetoCeleste({
      nome,
      tipo,
      // O campo continua no banco apenas por compatibilidade com documentos antigos.
      // O usuário não escolhe mais modos no ALTERRA.
      modo: 'livre',
      tamanho,
      temperatura,
      corBase: dados.corBase || '#a6a6b5',
      corAgua: dados.corAgua || '#1d4ed8',
      corTerra: dados.corTerra || '#4f8a45',
      corAneis: dados.corAneis || '#c6b7e5',
      tipoPlaneta,
      temAgua,
      temTerra,
      descricao: texto(dados.descricao),
      curiosidade: texto(dados.curiosidade),
      atmosfera,
      aneis,
      criadorId: usuario._id
    })

    await novoObjeto.save()

    pontosDescontados = 0 // O objeto foi salvo; não deve haver estorno.

    return reply.code(201).send({
      mensagem: 'Objeto criado com sucesso!',
      objeto: novoObjeto,
      custo,
      detalhesCusto: detalhes,
      pontosRestantes: usuario.pontos ?? 0,
      cobrancaAtiva: COBRANCA_ATIVA
    })
  } catch (erro) {
    // Se a gravação do objeto falhar depois do desconto, devolve os pontos.
    if (pontosDescontados > 0 && usuarioIdParaEstorno) {
      try {
        await Usuario.updateOne(
          { _id: usuarioIdParaEstorno },
          { $inc: { pontos: pontosDescontados } }
        )
      } catch (erroEstorno) {
        request.log.error(erroEstorno, 'Falha ao devolver pontos após erro na criação')
      }
    }

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
    request.log.error(erro)
    return reply.code(500).send({ erro: 'Não foi possível buscar os objetos.' })
  }
})

async function iniciarServidor() {
  try {
    await conectarBanco()
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🚀 ALTERRA rodando na porta 3000!')
    console.log('💎 Economia ativa. Preços:', PRECOS)
  } catch (erro) {
    fastify.log.error(erro)
    process.exit(1)
  }
}

iniciarServidor()
