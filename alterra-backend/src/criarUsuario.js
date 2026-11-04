require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario'); // Importa o modelo que criaste

async function criarPrimeiroUsuario() {
  try {
    // 1. Ligar à base de dados
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('🟢 Ligado ao MongoDB. A preparar para criar o utilizador...');

    // 2. Criar os dados do utilizador
    const novoUsuario = new Usuario({
      nome: 'Davi',
      sobrenome: 'Criador',
      email: 'davi@alterra.com',
      senha: 'senhaSuperSecreta123',
      pontos: 500 // Vamos dar 500 pontos iniciais para testar
    });

    // 3. Salvar no banco (neste exato momento, o bcrypt vai transformar a senha!)
    await novoUsuario.save();
    console.log('✅ Utilizador criado e guardado com sucesso no MongoDB Atlas!');

  } catch (erro) {
    console.error('🔴 Erro ao criar utilizador:', erro.message);
  } finally {
    // 4. Fechar a ligação depois de terminar
    mongoose.disconnect();
    process.exit();
  }
}

criarPrimeiroUsuario();