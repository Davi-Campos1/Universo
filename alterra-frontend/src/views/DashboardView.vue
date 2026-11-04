
<script setup lang="ts">
import { useUsuarioStore } from '../stores/usuario'
import { useRouter } from 'vue-router'
import Planeta3D from '../components/Planeta3D.vue'
import { onMounted } from 'vue'

const usuarioStore = useUsuarioStore()
const router = useRouter()
usuarioStore.carregarSessao()

// Opcional: Atualiza os dados do utilizador do servidor ao entrar no dashboard
onMounted(async () => {
  if (usuarioStore.id) {
    try {
      // Podes criar uma rota rápida no server.js para buscar dados do utilizador ou usar o login/sessão
      // Por agora, garantimos que o localStorage está sincronizado com a store:
      usuarioStore.carregarSessao()
    } catch (e) {
      console.error('Erro ao sincronizar sessão', e)
    }
  }
})

const sair = () => {
  usuarioStore.sair()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-container">

    <!-- BARRA SUPERIOR -->
    <header class="topbar">
      <div class="logo">
        <span>✦</span>
        ALTERRA
      </div>

      <div class="topbar-right">
        <div class="pontos">
          <span>✧</span>
          {{ usuarioStore.pontos }} Pontos
        </div>

<button class="btn-acao" @click="$router.push('/criar')">Criar Novo Planeta</button>
<button class="btn-acao" @click="$router.push('/minhas-criacoes')">Minhas Criações</button>
<button class="btn-acao" @click="$router.push('/explorar')">Explorar Universo</button>
<div class="usuario" @click="$router.push('/perfil')" style="cursor: pointer;" title="Ver Perfil de Comandante">
  <div class="avatar">
    {{ usuarioStore.nome?.charAt(0)?.toUpperCase() || 'U' }}
  </div>
  <span>Comandante</span>
</div>
        <button class="btn-sair" @click="sair">
          ↪ &nbsp; Sair
        </button>
      </div>
    </header>

    <!-- BOAS-VINDAS -->
    <section class="welcome">

      <div class="status-badge">
        <span class="status-dot"></span>
        SISTEMA DE EXPLORAÇÃO ATIVO
      </div>

      <h1>
        Bem-vindo ao
        <span>ALTERRA</span>
      </h1>

      <p>
        Prepare-se para explorar<br />
        os limites do universo.
      </p>

      <div class="welcome-line"></div>

      <div class="welcome-footer">
        ✦ &nbsp; SEU UNIVERSO COMEÇA AQUI
      </div>

    </section>

    <!-- PLANETA -->
    <section class="planet-section">

      <div class="planet-orbit orbit-one"></div>
      <div class="planet-orbit orbit-two"></div>
      <div class="planet-orbit orbit-three"></div>

      <div class="planet-container">
        <Planeta3D :deslocamento-x="0" />
      </div>

      <div class="distant-planet"></div>

      <div class="planet-label">
        <span></span>
        <div>
          <small>OBJETO CELESTE</small>
          <strong>SECTOR ALFA-01</strong>
        </div>
      </div>

    </section>

    <!-- INFORMAÇÕES -->
    <footer class="info-panel">

      <div class="info-item">
        <span class="info-icon purple">⌁</span>
        <div>
          <small>STATUS</small>
          <strong>Exploração ativa</strong>
        </div>
      </div>

      <div class="separator"></div>

      <div class="info-item">
        <span class="info-icon location">⌖</span>
        <div>
          <small>LOCALIZAÇÃO</small>
          <strong>Sector Alfa-01</strong>
        </div>
      </div>

      <div class="separator"></div>

      <div class="info-item">
        <span class="info-icon gold">★</span>
        <div>
          <small>SEUS PONTOS</small>
          <strong>{{ usuarioStore.pontos }}</strong>
        </div>
      </div>

    </footer>

  </div>
</template>

<style scoped>

/* TELA INTEIRA: NÃO DEPENDE DO TAMANHO DO PAI */

.conteudo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: flex-start; /* Empurra o painel para a esquerda */
  align-items: center;
  z-index: 10;
  padding-left: 80px; /* Dá margem em relação à borda esquerda */
}

/* BARRA SUPERIOR */

.topbar {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 72px;

  padding: 0 4%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: rgba(8, 5, 25, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border-bottom: 1px solid rgba(170, 130, 255, 0.16);

  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;

  font-size: 22px;
  font-weight: 700;
  letter-spacing: 5px;
  white-space: nowrap;
}

.logo span {
  color: #b58aff;
  font-size: 28px;
  text-shadow: 0 0 15px #995aff;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.pontos {
  color: #eee5ff;
  font-size: 14px;
  white-space: nowrap;
}

.pontos span {
  color: #bd91ff;
  font-size: 20px;
  margin-right: 5px;
}

.usuario {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  font-size: 14px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;

  display: grid;
  place-items: center;

  background: linear-gradient(135deg, #a56aff, #49228f);
  border: 1px solid #bb91ff;

  box-shadow: 0 0 12px rgba(140,80,255,0.3);
}

.btn-sair {
  padding: 10px 23px;

  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,150,255,0.25);
  border-radius: 9px;

  color: white;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;

  transition: 0.3s;
}

.btn-sair:hover {
  background: rgba(130,70,220,0.3);
  border-color: #a78bfa;
}

/* BOAS-VINDAS */

.welcome {
  position: absolute;

  left: 6%;
  top: 50%;
  transform: translateY(-58%);

  width: 39%;
  max-width: 540px;

  z-index: 10;
  text-align: left;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;

  padding: 11px 17px;

  border: 1px solid rgba(160,120,255,0.3);
  border-radius: 30px;

  background: rgba(30,20,65,0.5);

  color: #d9c9ff;
  font-size: 10px;
  letter-spacing: 2px;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;

  background: #55f5c0;
  box-shadow: 0 0 10px #55f5c0;
}

.welcome h1 {
  font-size: clamp(34px, 4vw, 58px);
  font-weight: 400;
  line-height: 1.2;

  margin: 30px 0 20px;

  color: #f5f0ff;
  white-space: nowrap;
}

.welcome h1 span {
  display: block;

  font-weight: 700;
  letter-spacing: 7px;

  background: linear-gradient(
    90deg,
    #c6a4ff,
    #9564f7,
    #6d8dff
  );

  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.welcome p {
  color: #c3bddb;
  font-size: 17px;
  line-height: 1.8;
}

.welcome-line {
  width: 90px;
  height: 2px;
  margin-top: 35px;

  background: linear-gradient(90deg, #a56aff, transparent);
}

.welcome-footer {
  margin-top: 20px;

  font-size: 9px;
  letter-spacing: 3px;
  color: #9686bf;
  white-space: nowrap;
}

/* PLANETA */

.planet-section {
  position: absolute;
  overflow: visible;

  right: 4%;
  top: 10%;

  width: 58%;
  height: 78%;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 2;
}

.planet-container {
  position: relative;

  width: min(100%, 580px);
  height: min(100%, 580px);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 5;
}

/* REMOVE EFEITOS EXTERNOS DO PLANETA */

.planet-container :deep(.halo),
.planet-container :deep(.glow),
.planet-container :deep(.planet-glow) {
  display: none !important;
  box-shadow: none !important;
}

.planet-container :deep(canvas) {
  display: block;
  max-width: 100%;
  max-height: 100%;

  filter: none !important;
  box-shadow: none !important;
}

/* ÓRBITAS */

.planet-orbit {
  position: absolute;
  top: 50%;
  left: 50%;

  border: 1px solid rgba(166,130,255,0.16);
  border-radius: 50%;

  pointer-events: none;
}

.orbit-one {
  width: 90%;
  height: 30%;
  transform: translate(-50%, -50%) rotate(-25deg);
  animation: orbitMove 45s linear infinite;
}

.orbit-two {
  width: 110%;
  height: 45%;
  transform: translate(-50%, -50%) rotate(30deg);
  border-color: rgba(90,140,255,0.13);
  animation: orbitMove 60s linear infinite reverse;
}

.orbit-three {
  width: 120%;
  height: 55%;
  transform: translate(-50%, -50%) rotate(-50deg);
  border-color: rgba(180,120,255,0.1);
  animation: orbitMove 80s linear infinite;
}

/* PLANETA DISTANTE */

.distant-planet {
  position: absolute;
  width: 35px;
  height: 35px;

  top: 8%;
  left: 15%;

  border-radius: 50%;

  background: radial-gradient(
    circle at 30% 30%,
    #a8d9ff,
    #345d91 55%,
    #101d43
  );

  box-shadow: inset -7px -5px 12px #10152c;
}

.planet-label {
  position: absolute;
  bottom: 2%;
  right: 3%;

  display: flex;
  align-items: center;
  gap: 12px;

  z-index: 10;
  white-space: nowrap;
}

.planet-label > span {
  width: 45px;
  height: 1px;
  background: #a78bfa;
}

.planet-label div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.planet-label small {
  color: #b89aff;
  letter-spacing: 3px;
  font-size: 9px;
}

.planet-label strong {
  color: white;
  font-size: 12px;
  letter-spacing: 2px;
}

/* PAINEL INFERIOR CENTRALIZADO */

.info-panel {
  position: absolute;

  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);

  width: min(850px, 85vw);
  min-height: 90px;

  display: flex;
  align-items: center;
  justify-content: space-around;

  padding: 15px 25px;

  background: rgba(9, 7, 29, 0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border: 1px solid rgba(160,120,255,0.35);
  border-radius: 17px;

  z-index: 20;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
}

.info-icon {
  font-size: 29px;
}

.purple { color: #b58aff; }
.location { color: #a66aff; }
.gold { color: #ffd15b; }

.info-item div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.info-item small {
  color: #b4a5da;
  font-size: 10px;
  letter-spacing: 2px;
}

.info-item strong {
  color: white;
  font-size: 14px;
}

.separator {
  height: 45px;
  width: 1px;
  background: rgba(180,150,255,0.35);
  flex-shrink: 0;
}

/* TELAS MENORES */

@media (max-width: 850px) {

  .welcome {
    left: 4%;
    top: 15%;
    transform: none;
    width: 92%;
    max-width: none;
    text-align: center;
  }

  .welcome h1 {
    font-size: clamp(30px, 6vw, 45px);
    margin: 15px 0;
  }

  .welcome h1 span {
    letter-spacing: 4px;
  }

  .welcome p {
    font-size: 14px;
  }

  .welcome-line,
  .welcome-footer {
    display: none;
  }

  .planet-section {
    width: 100%;
    height: 48%;
    top: 36%;
    right: 0;
  }

  .planet-container {
    height: 100%;
    width: min(85vw, 380px);
  }

  .planet-label {
    display: none;
  }

  .info-panel {
    bottom: 12px;
    width: 94%;
    padding: 12px 8px;
  }

  .info-item {
    gap: 7px;
  }

  .info-item strong {
    font-size: 10px;
  }

  .info-item small {
    font-size: 8px;
  }

  .info-icon {
    font-size: 20px;
  }
}

@media (max-width: 550px) {

  .topbar {
    padding: 0 12px;
    height: 65px;
  }

  .logo {
    font-size: 15px;
    letter-spacing: 2px;
    gap: 6px;
  }

  .topbar-right {
    gap: 9px;
  }

  .usuario span {
    display: none;
  }

  .pontos {
    font-size: 10px;
  }

  .btn-sair {
    padding: 8px 10px;
  }

  .status-badge {
    font-size: 8px;
    letter-spacing: 1px;
  }

  .welcome h1 {
    white-space: normal;
  }

  .info-panel {
    min-height: 75px;
  }

  .separator {
    height: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .planet-orbit {
    animation: none;
  }
}
.planet-container {
  position: relative;
  width: min(100%, 580px);
  height: min(100%, 580px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.planet-container > * {
  width: 100%;
  height: 100%;
}
.btn-acao {
  padding: 10px 23px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,150,255,0.25);
  border-radius: 9px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: 0.3s;
}

.btn-acao:hover {
  background: rgba(130,70,220,0.3);
  border-color: #a78bfa;
}

.btn-acao:active {
  transform: scale(0.97);
}
</style>
