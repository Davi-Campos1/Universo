<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '../stores/usuario'
import Planeta3D from '../components/Planeta3D.vue'

const router = useRouter()
const usuarioStore = useUsuarioStore()

const objetos = ref<any[]>([])
const carregando = ref(true)
const erro = ref('')
const objetoSelecionado = ref<any>(null)

usuarioStore.carregarSessao()

const buscarMinhasCriacoes = async () => {
  try {
    const criadorId = usuarioStore.id
    if (!criadorId) {
      erro.value = 'Sessão inválida. Faça login novamente.'
      carregando.value = false
      return
    }

    const resposta = await fetch(`http://localhost:3000/meus-objetos/${criadorId}`)
    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao carregar as criações.')
    }

    objetos.value = dados
  } catch (err: any) {
    erro.value = err.message || 'Erro de conexão com o servidor.'
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  buscarMinhasCriacoes()
})

const formatarTipo = (tipo: string) => {
  const tipos: Record<string, string> = {
    planeta: 'Planeta',
    estrela: 'Estrela',
    lua: 'Lua',
    buraco_negro: 'Buraco Negro'
  }
  return tipos[tipo] || tipo
}

const apagarObjeto = async (id: string) => {
  if (!confirm('Tem certeza que deseja destruir este corpo celeste do universo?')) return

  try {
    const resposta = await fetch(`http://localhost:3000/objeto/${id}`, {
      method: 'DELETE'
    })
    if (!resposta.ok) throw new Error('Erro ao apagar objeto.')

    objetos.value = objetos.value.filter(obj => obj._id !== id)
    if (objetoSelecionado.value?._id === id) {
      objetoSelecionado.value = null
    }
  } catch (err: any) {
    alert(err.message || 'Não foi possível apagar o objeto.')
  }
}
</script>

<template>
  <main class="criacoes-container">
    <div class="cenario">
      <div class="nebulosa nebulosa-1"></div>
      <div class="nebulosa nebulosa-2"></div>
      <div class="estrelas"></div>
    </div>

    <header class="topbar">
      <div class="logo" @click="router.push('/dashboard')">
        <span>✦</span> ALTERRA
      </div>
      <button class="btn-voltar" @click="router.push('/dashboard')">
        ← Voltar ao Dashboard
      </button>
    </header>

    <section class="conteudo-galeria">
      <div class="titulo-secao">
        <span class="tag-secao">GALERIA PESSOAL</span>
        <h2>Minhas Criações Celestiais</h2>
        <p>Explore todos os corpos celestes que já construiu no vasto universo do Alterra.</p>
      </div>

      <div v-if="carregando" class="estado-mensagem">
        <p>A escanear o cosmos em busca das suas criações...</p>
      </div>

      <div v-else-if="erro" class="estado-mensagem erro">
        <p>{{ erro }}</p>
      </div>

      <div v-else-if="objetos.length === 0" class="estado-mensagem vazio">
        <p>Ainda não registou nenhum corpo celeste no universo.</p>
        <button class="btn-criar-primeiro" @click="router.push('/criar')">
          Criar o meu primeiro objeto ✦
        </button>
      </div>

      <div v-else class="grid-cartoes">
        <div v-for="obj in objetos" :key="obj._id" class="cartao-celeste">
          <div class="cartao-header">
            <span class="badge-tipo" :class="obj.tipo">{{ formatarTipo(obj.tipo) }}</span>
          </div>

          <div class="cartao-corpo">
            <h3>{{ obj.nome }}</h3>
            <p class="descricao">{{ obj.descricao || 'Sem descrição registada.' }}</p>
            
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
            <button class="btn-detalhes" @click="objetoSelecionado = obj">Ver Completo</button>
            <button class="btn-apagar" @click="apagarObjeto(obj._id)">Excluir</button>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL DE DETALHES COMPLETOS COM PREVIEW 3D -->
    <div v-if="objetoSelecionado" class="modal-overlay" @click.self="objetoSelecionado = null">
      <div class="modal-card">
        <div class="modal-header">
          <span class="badge-tipo" :class="objetoSelecionado.tipo">{{ formatarTipo(objetoSelecionado.tipo) }}</span>
          <button class="btn-fechar" @click="objetoSelecionado = null">✕</button>
        </div>

        <h2>{{ objetoSelecionado.nome }}</h2>

        <!-- MINIATURA 3D DO OBJETO -->
        <div class="preview-3d-container">
          <Planeta3D
            :cor-base="objetoSelecionado.corBase"
            :cor-agua="objetoSelecionado.corAgua"
            :cor-terra="objetoSelecionado.corTerra"
            :cor-aneis="objetoSelecionado.corAneis"
            :tipo-planeta="objetoSelecionado.tipoPlaneta"
            :tem-agua="objetoSelecionado.temAgua"
            :tem-terra="objetoSelecionado.temTerra"
            :tamanho="objetoSelecionado.tamanho"
            :atmosfera="objetoSelecionado.atmosfera"
            :aneis="objetoSelecionado.aneis"
            :tipo="objetoSelecionado.tipo"
            :temperatura="objetoSelecionado.temperatura"
          />
        </div>

        <p class="modal-descricao"><strong>Descrição:</strong> {{ objetoSelecionado.descricao || 'Nenhuma descrição fornecida.' }}</p>

       <div class="modal-grid">
  <div>
    <small>Tamanho:</small>
    <strong>{{ objetoSelecionado.tamanho }}x</strong>
  </div>

  <div>
    <small>Temperatura:</small>
    <strong>{{ objetoSelecionado.temperatura }}°C</strong>
  </div>

  <template v-if="objetoSelecionado.tipo === 'planeta'">
    <div>
      <small>Tipo de planeta:</small>
      <strong>{{ objetoSelecionado.tipoPlaneta || 'Padrão' }}</strong>
    </div>

    <div>
      <small>Atmosfera:</small>
      <strong>{{ objetoSelecionado.atmosfera ? 'Sim' : 'Não' }}</strong>
    </div>

    <div>
      <small>Anéis:</small>
      <strong>{{ objetoSelecionado.aneis ? 'Sim' : 'Não' }}</strong>
    </div>
  </template>
</div>
        <div v-if="objetoSelecionado.curiosidade" class="modal-curiosidade">
          <small>✦ CURIOSIDADE</small>
          <p>{{ objetoSelecionado.curiosidade }}</p>
        </div>

        <button class="btn-apagar-modal" @click="apagarObjeto(objetoSelecionado._id); objetoSelecionado = null">
          Destruir Corpo Celeste
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.criacoes-container { color-scheme: dark; position: relative; width: 100%; min-height: 100vh; background: #070513; overflow-y: auto; padding-bottom: 50px; }
.cenario { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.nebulosa { position: absolute; width: 600px; height: 500px; border-radius: 50%; filter: blur(90px); opacity: 0.15; }
.nebulosa-1 { top: 5%; right: 10%; background: #7035c9; }
.nebulosa-2 { bottom: 10%; left: 10%; background: #244fba; }

.topbar { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: rgba(8, 5, 25, 0.72); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(170, 130, 255, 0.16); }
.logo { cursor: pointer; color: #fff; font-weight: 700; letter-spacing: 4px; font-size: 18px; }
.logo span { color: #b58aff; }
.btn-voltar { padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(180,150,255,0.25); border-radius: 8px; color: white; cursor: pointer; font-size: 12px; }

.conteudo-galeria { position: relative; z-index: 10; max-width: 1100px; margin: 40px auto 0; padding: 0 20px; }
.titulo-secao { margin-bottom: 30px; }
.tag-secao { color: #a78bfa; font-size: 10px; letter-spacing: 2px; }
.titulo-secao h2 { color: #eadcff; font-size: 28px; margin: 8px 0; }
.titulo-secao p { color: #aaa0c5; font-size: 14px; }

.estado-mensagem { text-align: center; padding: 60px 20px; color: #9689b2; background: rgba(12, 9, 32, 0.6); border: 1px solid rgba(170, 130, 255, 0.15); border-radius: 16px; }
.grid-cartoes { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

.cartao-celeste { background: rgba(12, 9, 32, 0.85); backdrop-filter: blur(15px); border: 1px solid rgba(170, 130, 255, 0.25); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
.cartao-header { display: flex; justify-content: flex-end; align-items: center; }
.badge-tipo { font-size: 10px; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px; background: rgba(139, 92, 246, 0.2); color: #c4a5ff; border: 1px solid rgba(139, 92, 246, 0.3); }
.cartao-corpo h3 { color: #fff; font-size: 18px; margin: 0 0 8px 0; }
.descricao { color: #aaa0c5; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0; min-height: 38px; }
.detalhes-tecnicos { display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(170, 130, 255, 0.15); }
.detalhe-item small { color: #7a6f96; font-size: 10px; }
.detalhe-item strong { color: #e9ddff; font-size: 13px; }

.cartao-acoes { display: flex; gap: 10px; margin-top: 5px; }
.btn-detalhes { flex: 2; padding: 8px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 8px; color: #c4a5ff; cursor: pointer; font-size: 12px; }
.btn-apagar { flex: 1; padding: 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; font-size: 12px; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
.modal-card { background: #120d2a; border: 1px solid rgba(170, 130, 255, 0.3); border-radius: 16px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; padding: 25px; color: white; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
.modal-header { display: flex; justify-content: space-between; align-items: center; }
.btn-fechar { background: none; border: none; color: #aaa; font-size: 18px; cursor: pointer; }

/* PREVIEW 3D NO MODAL */
.preview-3d-container {
  width: 100%;
  height: 200px;
  background: rgba(7, 5, 19, 0.8);
  border: 1px solid rgba(170, 130, 255, 0.2);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; }
.modal-grid small { color: #887aae; font-size: 10px; display: block; }
.modal-grid strong { color: #e9ddff; font-size: 13px; }
.modal-curiosidade { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); padding: 12px; border-radius: 10px; }
.modal-curiosidade small { color: #c4a5ff; font-size: 9px; letter-spacing: 1px; }
.modal-curiosidade p { margin: 5px 0 0 0; font-size: 12px; color: #dcd6f7; }
.btn-apagar-modal { padding: 10px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 8px; color: #f87171; font-weight: 600; cursor: pointer; }
</style>