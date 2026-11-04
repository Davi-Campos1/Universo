
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '../stores/usuario'
import Planeta3D from '../components/Planeta3D.vue'

const router = useRouter()
const usuarioStore = useUsuarioStore()

const objetosPublicos = ref<any[]>([])
const carregando = ref(true)
const erro = ref('')
const mensagemSucesso = ref('')
const tempoRestanteCooldown = ref('')

usuarioStore.carregarSessao()

const buscarObjetosUniverso = async () => {
  try {
    const resposta = await fetch('http://localhost:3000/objetos')
    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error('Erro ao carregar o universo.')
    }

    objetosPublicos.value = dados
  } catch (err: any) {
    erro.value = err.message || 'Erro de conexão.'
  } finally {
    carregando.value = false
  }
}

const verificarCooldownEscaneamento = () => {
  const ultimoScan = localStorage.getItem(`ultimo_scan_${usuarioStore.id}`)

  if (ultimoScan) {
    const agora = Date.now()
    const diff = agora - Number(ultimoScan)
    const umDia = 24 * 60 * 60 * 1000

    if (diff < umDia) {
      const horasRestantes = Math.ceil(
        (umDia - diff) / (1000 * 60 * 60)
      )

      tempoRestanteCooldown.value =
        `Próximo scan disponível em ${horasRestantes}h`
    } else {
      tempoRestanteCooldown.value = ''
    }
  }
}

const escanearSetor = async () => {
  const ultimoScan = localStorage.getItem(`ultimo_scan_${usuarioStore.id}`)
  const agora = Date.now()
  const umDia = 24 * 60 * 60 * 1000

  if (ultimoScan && agora - Number(ultimoScan) < umDia) {
    alert('O radar está a recarregar. Só pode escanear o setor a cada 24 horas!')
    return
  }

  try {
    const resposta = await fetch('http://localhost:3000/explorar/recompensa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        criadorId: usuarioStore.id,
        pontos: 100
      })
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao coletar pontos.')
    }

    usuarioStore.atualizarPontos(dados.pontosRestantes)

    localStorage.setItem(
      `ultimo_scan_${usuarioStore.id}`,
      agora.toString()
    )

    verificarCooldownEscaneamento()

    mensagemSucesso.value =
      `✦ Setor escaneado! Ganhou +${dados.pontosGanho} pontos!`

    setTimeout(() => {
      mensagemSucesso.value = ''
    }, 4000)

  } catch (err: any) {
    alert(err.message)
  }
}

const curtirObjeto = async (objeto: any) => {
  if (objeto.criadorId === usuarioStore.id) {
    alert('Não pode curtir a sua própria criação!')
    return
  }

  if (
    objeto.curtidoPor &&
    objeto.curtidoPor.includes(usuarioStore.id)
  ) {
    alert('Você já curtiu esta criação!')
    return
  }

  try {
    const resposta = await fetch('http://localhost:3000/objeto/curtir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objetoId: objeto._id,
        usuarioId: usuarioStore.id
      })
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao curtir objeto.')
    }

    objeto.curtidas = dados.totalCurtidas

    if (!objeto.curtidoPor) {
      objeto.curtidoPor = []
    }

    if (!objeto.curtidoPor.includes(usuarioStore.id)) {
      objeto.curtidoPor.push(usuarioStore.id)
    }

    mensagemSucesso.value =
      '✦ Curtiu o objeto! O criador recebeu 25 pontos.'

    setTimeout(() => {
      mensagemSucesso.value = ''
    }, 3000)

  } catch (err: any) {
    alert(err.message)
  }
}

const formatarTipo = (tipo: string) => {
  const tipos: Record<string, string> = {
    planeta: 'Planeta',
    estrela: 'Estrela',
    lua: 'Lua',
    buraco_negro: 'Buraco Negro'
  }

  return tipos[tipo] || tipo
}

onMounted(() => {
  buscarObjetosUniverso()
  verificarCooldownEscaneamento()
})
</script>

<template>
  <main class="explorar-container">
    <div class="cenario">
      <div class="nebulosa nebulosa-1"></div>
      <div class="nebulosa nebulosa-2"></div>
      <div class="estrelas"></div>
    </div>

    <header class="topbar">
      <div class="logo" @click="router.push('/dashboard')">
        <span>✦</span> ALTERRA
      </div>

      <div class="topbar-right">
        <div class="pontos">
          <span>✧</span> {{ usuarioStore.pontos }} Pontos
        </div>

        <button class="btn-voltar" @click="router.push('/dashboard')">
          ← Dashboard
        </button>
      </div>
    </header>

    <section class="conteudo-explorar">
      <div class="banner-exploracao">
        <div>
          <span class="tag-secao">SETOR DE PESQUISA</span>
          <h2>Radar de Exploração</h2>
          <p>
            Escanear o setor concede 100 pontos (disponível a cada 24 horas).
            Curta criações de outros comandantes para recompensá-los!
          </p>
        </div>

        <button
          class="btn-escanear"
          @click="escanearSetor"
          :disabled="!!tempoRestanteCooldown"
        >
          {{ tempoRestanteCooldown || '📡 Escanear Setor (+100 pts)' }}
        </button>
      </div>

      <p v-if="mensagemSucesso" class="aviso-sucesso">
        {{ mensagemSucesso }}
      </p>

      <p v-if="erro" class="aviso-erro">
        {{ erro }}
      </p>

      <div class="titulo-feed">
        <h3>Corpos Celestes Registados no Universo</h3>
      </div>

      <div v-if="carregando" class="estado-mensagem">
        <p>A mapear o espaço sideral...</p>
      </div>

      <div
        v-else-if="objetosPublicos.length === 0"
        class="estado-mensagem"
      >
        <p>Nenhum corpo celeste descoberto no universo ainda.</p>
      </div>

      <div v-else class="grid-cartoes">
        <div
          v-for="obj in objetosPublicos"
          :key="obj._id"
          class="cartao-celeste"
        >
          <div class="cartao-header">
            <span class="badge-tipo" :class="obj.tipo">
              {{ formatarTipo(obj.tipo) }}
            </span>
          </div>

          <div class="preview-3d-mini">
            <Planeta3D
              :cor-base="obj.corBase"
              :cor-agua="obj.corAgua"
              :cor-terra="obj.corTerra"
              :cor-aneis="obj.corAneis"
              :tipo-planeta="obj.tipoPlaneta"
              :tem-agua="obj.temAgua"
              :tem-terra="obj.temTerra"
              :tamanho="obj.tamanho"
              :atmosfera="obj.atmosfera"
              :aneis="obj.aneis"
              :tipo="obj.tipo"
              :temperatura="obj.temperatura"
            />
          </div>

          <div class="cartao-corpo">
            <h3>{{ obj.nome }}</h3>

            <p class="descricao">
              {{ obj.descricao || 'Sem descrição registada.' }}
            </p>

            <div class="detalhes-tecnicos">
              <div class="detalhe-item">
                <small>Tamanho</small>
                <strong>{{ obj.tamanho }}x</strong>
              </div>

              <div class="detalhe-item">
                <small>Temperatura</small>
                <strong>{{ obj.temperatura }}°C</strong>
              </div>
            </div>
          </div>

          <div class="cartao-acoes">
            <button
              class="btn-curtir"
              @click="curtirObjeto(obj)"
              :disabled="
                obj.criadorId === usuarioStore.id ||
                (obj.curtidoPor && obj.curtidoPor.includes(usuarioStore.id))
              "
            >
              {{
                obj.curtidoPor &&
                obj.curtidoPor.includes(usuarioStore.id)
                  ? '❤️ Curtido'
                  : `❤️ Curtir (${obj.curtidas || 0})`
              }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.explorar-container { color-scheme: dark; position: relative; width: 100%; min-height: 100vh; background: #070513; overflow-y: auto; padding-bottom: 50px; }
.cenario { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.nebulosa { position: absolute; width: 600px; height: 500px; border-radius: 50%; filter: blur(90px); opacity: 0.15; }
.nebulosa-1 { top: 5%; left: 10%; background: #7035c9; }
.nebulosa-2 { bottom: 10%; right: 10%; background: #244fba; }

.topbar { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: rgba(8, 5, 25, 0.72); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(170, 130, 255, 0.16); }
.logo { cursor: pointer; color: #fff; font-weight: 700; letter-spacing: 4px; font-size: 18px; }
.logo span { color: #b58aff; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.pontos { color: #eee5ff; font-size: 14px; }
.pontos span { color: #bd91ff; font-size: 18px; }
.btn-voltar { padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(180,150,255,0.25); border-radius: 8px; color: white; cursor: pointer; font-size: 12px; }

.conteudo-explorar { position: relative; z-index: 10; max-width: 1100px; margin: 40px auto 0; padding: 0 20px; display: flex; flex-direction: column; gap: 25px; }

.banner-exploracao { display: flex; justify-content: space-between; align-items: center; background: rgba(12, 9, 32, 0.85); border: 1px solid rgba(170, 130, 255, 0.3); border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
.tag-secao { color: #a78bfa; font-size: 10px; letter-spacing: 2px; }
.banner-exploracao h2 { color: #eadcff; font-size: 24px; margin: 6px 0; }
.banner-exploracao p { color: #aaa0c5; font-size: 13px; margin: 0; max-width: 500px; }

.btn-escanear { padding: 12px 22px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 13px; white-space: nowrap; transition: 0.2s; }
.btn-escanear:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-2px); }
.btn-escanear:disabled { opacity: 0.5; cursor: not-allowed; }

.aviso-sucesso { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; padding: 12px; border-radius: 10px; text-align: center; font-size: 13px; font-weight: 600; }
.aviso-erro { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; padding: 12px; border-radius: 10px; text-align: center; font-size: 13px; }

.titulo-feed h3 { color: #d9d0eb; font-size: 18px; margin: 10px 0 0 0; }
.estado-mensagem { text-align: center; padding: 40px; color: #9689b2; background: rgba(12, 9, 32, 0.6); border: 1px solid rgba(170, 130, 255, 0.15); border-radius: 16px; }

.grid-cartoes { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.cartao-celeste { background: rgba(12, 9, 32, 0.85); border: 1px solid rgba(170, 130, 255, 0.25); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
.cartao-header { display: flex; justify-content: flex-end; }
.badge-tipo { font-size: 10px; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px; background: rgba(139, 92, 246, 0.2); color: #c4a5ff; border: 1px solid rgba(139, 92, 246, 0.3); }

.preview-3d-mini { width: 100%; height: 150px; background: rgba(7, 5, 19, 0.8); border: 1px solid rgba(170, 130, 255, 0.2); border-radius: 10px; position: relative; overflow: hidden; }

.cartao-corpo h3 { color: #fff; font-size: 18px; margin: 0 0 8px 0; }
.descricao { color: #aaa0c5; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0; min-height: 38px; }
.detalhes-tecnicos { display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(170, 130, 255, 0.15); }
.detalhe-item small { color: #7a6f96; font-size: 10px; }
.detalhe-item strong { color: #e9ddff; font-size: 13px; }

.cartao-acoes { margin-top: 5px; }
.btn-curtir { width: 100%; padding: 9px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; }
.btn-curtir:hover:not(:disabled) { background: rgba(239, 68, 68, 0.3); }
.btn-curtir:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
