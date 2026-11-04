<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '../stores/usuario'

const router = useRouter()
const usuarioStore = useUsuarioStore()

const estatisticas = ref({
  nome: '',
  sobrenome: '',
  email: '',
  pontos: 0,
  patente: 'Explorador Estelar',
  totalCriacoes: 0
})
const carregando = ref(true)

usuarioStore.carregarSessao()

onMounted(async () => {
  try {
    if (!usuarioStore.id) return
    const resposta = await fetch(`http://localhost:3000/usuario/estatisticas/${usuarioStore.id}`)
    const dados = await resposta.json()
    if (resposta.ok) {
      estatisticas.value = dados
    }
  } catch (err) {
    console.error('Erro ao carregar perfil', err)
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <main class="perfil-container">
    <div class="cenario">
      <div class="grade-espacial"></div>
      <div class="nebulosa nebulosa-1"></div>
      <div class="nebulosa nebulosa-2"></div>
      <div class="estrelas"></div>
    </div>

    <header class="topbar">
      <div class="logo" @click="router.push('/dashboard')">
        <span>✦</span> ALTERRA
      </div>
      <button class="btn-voltar" @click="router.push('/dashboard')">← Voltar ao Dashboard</button>
    </header>

    <section class="conteudo-perfil">
      <!-- TERMINAL DA IA LAILLA -->
      <div class="terminal-lailla" v-if="!carregando">
        <div class="lailla-header">
          <span class="lailla-icon">✦</span>
          <strong>LAILLA — IA DE BORDO</strong>
          <span class="status-online"></span>
        </div>
        <p class="lailla-texto">
          "Relatório de bordo, <strong>{{ estatisticas.patente }} {{ estatisticas.nome || usuarioStore.nome }}</strong>. Os sistemas do Alterra estão operacionais. O senhor(a) possui <strong>{{ estatisticas.pontos }} pontos</strong> e registou <strong>{{ estatisticas.totalCriacoes }} corpos celestes</strong> no nosso banco de dados cósmico."
        </p>
      </div>

      <div class="cartao-perfil">
        <div class="avatar-grande">
          {{ usuarioStore.nome?.charAt(0)?.toUpperCase() || 'U' }}
        </div>

        <h2>{{ estatisticas.nome || usuarioStore.nome }} {{ estatisticas.sobrenome || usuarioStore.sobrenome }}</h2>
        <p class="email-comandante">{{ estatisticas.email || usuarioStore.email }}</p>
        
        <!-- PATENTE SORTEADA E FIXADA -->
        <span class="badge-cargo">✦ {{ estatisticas.patente }} ✦</span>

        <div v-if="carregando" class="carregando">A aceder aos registos da base de dados...</div>

        <div v-else class="estatisticas-grid">
          <div class="estatistica-box">
            <small>PONTOS TOTAIS</small>
            <strong>✧ {{ estatisticas.pontos }}</strong>
          </div>
          <div class="estatistica-box">
            <small>CRIAÇÕES CELESTES</small>
            <strong>🪐 {{ estatisticas.totalCriacoes }}</strong>
          </div>
        </div>

        <div class="acoes-perfil">
          <button class="btn-acao-primaria" @click="router.push('/minhas-criacoes')">Ver Minhas Criações</button>
          <button class="btn-acao-secundaria" @click="router.push('/explorar')">Explorar Universo</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.perfil-container { 
  color-scheme: dark; 
  position: relative; 
  width: 100%; 
  min-height: 100vh; 
  background: radial-gradient(circle at 50% 20%, #170b3b 0%, #080416 50%, #030208 100%); 
  overflow-y: auto; 
  padding-bottom: 50px; 
  font-size: 16px;
}

.cenario { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

.grade-espacial {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.6;
}

.nebulosa { position: absolute; width: 700px; height: 600px; border-radius: 50%; filter: blur(110px); opacity: 0.25; }
.nebulosa-1 { top: 5%; right: 5%; background: #8b5cf6; }
.nebulosa-2 { bottom: 5%; left: 5%; background: #3b82f6; }

.topbar { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 22px 5%; background: rgba(12, 8, 30, 0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(170, 130, 255, 0.2); }
.logo { cursor: pointer; color: #fff; font-weight: 700; letter-spacing: 4px; font-size: 20px; }
.logo span { color: #b58aff; }
.btn-voltar { padding: 10px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(180,150,255,0.3); border-radius: 10px; color: white; cursor: pointer; font-size: 14px; transition: 0.2s; }
.btn-voltar:hover { background: rgba(139, 92, 246, 0.25); }

.conteudo-perfil { position: relative; z-index: 10; max-width: 580px; margin: 50px auto 0; padding: 0 20px; display: flex; flex-direction: column; gap: 24px; }

.terminal-lailla {
  background: rgba(15, 11, 38, 0.92);
  border: 1px solid rgba(170, 130, 255, 0.45);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
  backdrop-filter: blur(20px);
}

.lailla-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 13px;
  letter-spacing: 2px;
  color: #c4a5ff;
}

.lailla-icon { font-size: 18px; color: #b58aff; text-shadow: 0 0 12px #b58aff; }
.status-online { width: 9px; height: 9px; background: #34d399; border-radius: 50%; box-shadow: 0 0 10px #34d399; margin-left: auto; }

.lailla-texto {
  color: #e2dcff;
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
  font-style: italic;
}
.lailla-texto strong { color: #fff; font-style: normal; }

.cartao-perfil { 
  background: rgba(15, 11, 38, 0.92); 
  border: 1px solid rgba(170, 130, 255, 0.35); 
  border-radius: 22px; 
  padding: 40px 35px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  text-align: center; 
  box-shadow: 0 20px 60px rgba(0,0,0,0.7); 
  backdrop-filter: blur(20px); 
}

.avatar-grande { 
  width: 90px; 
  height: 90px; 
  border-radius: 50%; 
  display: grid; 
  place-items: center; 
  background: linear-gradient(135deg, #a56aff, #49228f); 
  border: 3px solid #bb91ff; 
  box-shadow: 0 0 25px rgba(140,80,255,0.5); 
  font-size: 36px; 
  font-weight: bold; 
  color: white; 
  margin-bottom: 16px; 
}

.cartao-perfil h2 { color: #fff; font-size: 26px; margin: 0 0 6px 0; }
.email-comandante { color: #a395c7; font-size: 14px; margin: 0 0 16px 0; }

.badge-cargo { font-size: 11px; letter-spacing: 2px; padding: 6px 16px; border-radius: 20px; background: rgba(139, 92, 246, 0.25); color: #c4a5ff; border: 1px solid rgba(139, 92, 246, 0.4); margin-bottom: 25px; }

.estatisticas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; width: 100%; margin-bottom: 25px; }
.estatistica-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(170, 130, 255, 0.2); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
.estatistica-box small { color: #9a8bbf; font-size: 11px; letter-spacing: 1px; }
.estatistica-box strong { color: #f3efff; font-size: 20px; }

.acoes-perfil { display: flex; gap: 12px; width: 100%; }
.btn-acao-primaria { flex: 1; padding: 12px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; font-size: 14px; transition: 0.2s; }
.btn-acao-primaria:hover { filter: brightness(1.15); }
.btn-acao-secundaria { flex: 1; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(180,150,255,0.3); border-radius: 12px; color: white; font-weight: 600; cursor: pointer; font-size: 14px; transition: 0.2s; }
.btn-acao-secundaria:hover { background: rgba(139, 92, 246, 0.2); }

.carregando { color: #9689b2; font-size: 14px; margin: 20px 0; }
</style>
