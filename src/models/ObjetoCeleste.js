const mongoose = require('mongoose')

const objetoCelesteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true, enum: ['planeta', 'estrela', 'buraco_negro', 'lua'] },
  modo: { type: String, required: true, enum: ['cientifico', 'livre'], default: 'livre' },
  
  // Parâmetros físicos e visuais
  tamanho: { type: Number, default: 1.3 },
  temperatura: { type: Number, default: 15 },
  corBase: { type: String, default: '#a6a6b5' },
  
  // Especificidades de Planetas
  tipoPlaneta: { type: String, default: 'terrestre' },
  corAgua: { type: String, default: '#1d4ed8' },
  corTerra: { type: String, default: '#4f8a45' },
  corAneis: { type: String, default: '#c6b7e5' },
  temAgua: { type: Boolean, default: true },
  temTerra: { type: Boolean, default: true },
  atmosfera: { type: Boolean, default: false },
  aneis: { type: Boolean, default: false },

  // Textos e descrições personalizadas
  descricao: { type: String, default: '', maxlength: 500 },
  curiosidade: { type: String, default: '' },

  // Dono da criação
  criadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  criadoEm: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ObjetoCeleste', objetoCelesteSchema)
