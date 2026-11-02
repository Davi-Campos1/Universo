import { defineStore } from 'pinia'
import { ref } from 'vue'

type DadosUsuario = {
  _id?: string
  id?: string
  nome?: string
  sobrenome?: string
  email?: string
  pontos?: number
}

export const useUsuarioStore = defineStore('usuario', () => {
  const id = ref('')
  const nome = ref('')
  const sobrenome = ref('')
  const email = ref('')
  const pontos = ref(0)
  const estaLogado = ref(false)

  function salvarSessao(dadosUsuario: DadosUsuario) {
    const identificador = dadosUsuario._id || dadosUsuario.id
    if (!identificador) {
      throw new Error('O servidor não retornou o ID do usuário.')
    }

    id.value = identificador
    nome.value = dadosUsuario.nome || ''
    sobrenome.value = dadosUsuario.sobrenome || ''
    email.value = dadosUsuario.email || ''
    pontos.value = dadosUsuario.pontos ?? 0
    estaLogado.value = true

    localStorage.setItem('usuarioAlterra', JSON.stringify({
      _id: identificador,
      nome: nome.value,
      sobrenome: sobrenome.value,
      email: email.value,
      pontos: pontos.value
    }))
  }

  function carregarSessao() {
    const dadosGuardados = localStorage.getItem('usuarioAlterra')
    if (!dadosGuardados) return

    try {
      const usuario: DadosUsuario = JSON.parse(dadosGuardados)
      const identificador = usuario._id || usuario.id
      if (!identificador) {
        sair()
        return
      }

      id.value = identificador
      nome.value = usuario.nome || ''
      sobrenome.value = usuario.sobrenome || ''
      email.value = usuario.email || ''
      pontos.value = usuario.pontos ?? 0
      estaLogado.value = true
    } catch (erro) {
      console.error('Não foi possível recuperar a sessão do usuário:', erro)
      sair()
    }
  }

  function sair() {
    id.value = ''
    nome.value = ''
    sobrenome.value = ''
    email.value = ''
    pontos.value = 0
    estaLogado.value = false
    localStorage.removeItem('usuarioAlterra')
  }

  return { id, nome, sobrenome, email, pontos, estaLogado, salvarSessao, carregarSessao, sair }
})
