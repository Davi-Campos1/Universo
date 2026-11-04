
import { defineStore } from 'pinia'

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    id: '',
    nome: '',
    sobrenome: '',
    email: '',
    pontos: 0
  }),

  actions: {
    salvarSessao(usuario: {
      _id?: string
      id?: string
      nome?: string
      sobrenome?: string
      email?: string
      pontos?: number
    }) {
      localStorage.setItem('usuario', JSON.stringify(usuario))

      this.id = usuario._id || usuario.id || ''
      this.nome = usuario.nome || ''
      this.sobrenome = usuario.sobrenome || ''
      this.email = usuario.email || ''
      this.pontos = usuario.pontos ?? 0
    },

    carregarSessao() {
      const dados = localStorage.getItem('usuario')

      if (dados) {
        const usuario = JSON.parse(dados)

        this.id = usuario._id || usuario.id || ''
        this.nome = usuario.nome || ''
        this.sobrenome = usuario.sobrenome || ''
        this.email = usuario.email || ''
        this.pontos = usuario.pontos ?? 0
      }
    },

    atualizarPontos(novosPontos: number) {
      this.pontos = novosPontos

      const dados = localStorage.getItem('usuario')

      if (dados) {
        const usuario = JSON.parse(dados)
        usuario.pontos = novosPontos

        localStorage.setItem('usuario', JSON.stringify(usuario))
      }
    },

    sair() {
      this.id = ''
      this.nome = ''
      this.sobrenome = ''
      this.email = ''
      this.pontos = 0

      localStorage.removeItem('usuario')
    }
  }
})
