const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  sobrenome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha: { type: String, required: true, select: true },
  pontos: { type: Number, default: 0, min: 0 }
}, { timestamps: true })

// Gera o hash somente quando a senha for nova ou tiver sido alterada.
usuarioSchema.pre('save', async function () {
  if (!this.isModified('senha')) return
  this.senha = await bcrypt.hash(this.senha, 10)
})

module.exports = mongoose.model('Usuario', usuarioSchema, )
