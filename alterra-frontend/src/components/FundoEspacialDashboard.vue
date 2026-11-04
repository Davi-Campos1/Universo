
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const mouseX = ref(0)
const mouseY = ref(0)
const movimentoAtivo = ref(true)

const estrelas = Array.from({ length: 180 }, (_, i) => ({
  id: i,
  x: (i * 73.7) % 100,
  y: (i * 41.3) % 100,
  tamanho: i % 13 === 0 ? 3 : i % 5 === 0 ? 2 : 1,
  atraso: (i % 20) * 0.25,
  duracao: 2 + (i % 5)
}))

let mediaQuery: MediaQueryList | null = null

const moverCamera = (event: MouseEvent) => {
  if (!movimentoAtivo.value) return

  mouseX.value = (event.clientX / window.innerWidth - 0.5) * 12
  mouseY.value = (event.clientY / window.innerHeight - 0.5) * 12
}

const verificarMovimento = (event: MediaQueryListEvent | MediaQueryList) => {
  movimentoAtivo.value = !event.matches

  if (event.matches) {
    mouseX.value = 0
    mouseY.value = 0
  }
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  verificarMovimento(mediaQuery)

  mediaQuery.addEventListener?.('change', verificarMovimento)

  if (movimentoAtivo.value) {
    window.addEventListener('mousemove', moverCamera)
  }
})

onUnmounted(() => {
  mediaQuery?.removeEventListener?.('change', verificarMovimento)
  window.removeEventListener('mousemove', moverCamera)
})
</script>

<template>
  <div class="universo-dashboard" aria-hidden="true">

    <!-- CAMADA DE PROFUNDIDADE -->
    <div
      class="camada estrelas-distantes"
      :style="{
        transform: `translate(${mouseX * -0.25}px, ${mouseY * -0.25}px)`
      }"
    >
      <span
        v-for="estrela in estrelas"
        :key="estrela.id"
        class="estrela"
        :style="{
          left: `${estrela.x}%`,
          top: `${estrela.y}%`,
          width: `${estrela.tamanho}px`,
          height: `${estrela.tamanho}px`,
          animationDelay: `${estrela.atraso}s`,
          animationDuration: `${estrela.duracao}s`
        }"
      />
    </div>

    <!-- NEBULOSAS -->
    <div
      class="camada nebulosas"
      :style="{
        transform: `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px)`
      }"
    >
      <div class="nebulosa nebulosa-roxa" />
      <div class="nebulosa nebulosa-azul" />
      <div class="nebulosa nebulosa-magenta" />
      <div class="nebulosa nebulosa-central" />
    </div>

    <!-- PLANETAS DISTANTES -->
    <div
      class="camada planetas-distantes"
      :style="{
        transform: `translate(${mouseX}px, ${mouseY}px)`
      }"
    >
      <div class="planeta-fundo planeta-azul">
        <span />
      </div>

      <div class="planeta-fundo planeta-roxo">
        <span />
      </div>

      <div class="planeta-anel">
        <div />
      </div>
    </div>

    <!-- POEIRA CÓSMICA -->
    <div class="poeira">
      <span v-for="n in 24" :key="n" :style="{ '--i': n }" />
    </div>

    <!-- ESTRELAS CADENTES -->
    <div class="estrelas-cadentes">
      <span class="cadente cadente-um" />
      <span class="cadente cadente-dois" />
      <span class="cadente cadente-tres" />
    </div>

    <!-- PROFUNDIDADE E ESCURECIMENTO NAS BORDAS -->
    <div class="vinheta" />
  </div>
</template>

<style scoped>
.universo-dashboard {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  isolation: isolate;
  background:
    radial-gradient(ellipse at 72% 45%, #17102f 0%, transparent 48%),
    radial-gradient(ellipse at 20% 75%, #160e35 0%, transparent 48%),
    linear-gradient(135deg, #05040e, #0b0820 55%, #080615);
}

.camada {
  position: absolute;
  inset: -35px;
  transition: transform 0.25s ease-out;
  will-change: transform;
}

.estrelas-distantes {
  z-index: 1;
}

.estrela {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: #e6ddff;
  box-shadow: 0 0 6px rgba(190, 165, 255, 0.8);
  opacity: 0.45;
  animation: cintilar infinite ease-in-out alternate;
}

@keyframes cintilar {
  from {
    opacity: 0.2;
    transform: scale(0.7);
  }
  to {
    opacity: 0.95;
    transform: scale(1.4);
  }
}

/* NEBULOSAS */

.nebulosas {
  z-index: 2;
  filter: blur(65px);
}

.nebulosa {
  position: absolute;
  border-radius: 50%;
  opacity: 0.35;
  animation: respirar 18s ease-in-out infinite alternate;
}

.nebulosa-roxa {
  width: 55vw;
  height: 45vw;
  min-width: 400px;
  min-height: 350px;
  top: 5%;
  left: 5%;
  background: #5725a5;
}

.nebulosa-azul {
  width: 50vw;
  height: 40vw;
  min-width: 350px;
  min-height: 300px;
  right: -5%;
  top: 20%;
  background: #173f91;
  animation-delay: -6s;
}

.nebulosa-magenta {
  width: 40vw;
  height: 35vw;
  min-width: 300px;
  min-height: 280px;
  left: 35%;
  bottom: -20%;
  background: #842d91;
  opacity: 0.2;
  animation-delay: -10s;
}

.nebulosa-central {
  width: 35vw;
  height: 25vw;
  min-width: 280px;
  min-height: 220px;
  left: 40%;
  top: 25%;
  background: #4441a3;
  opacity: 0.18;
  animation-delay: -3s;
}

@keyframes respirar {
  from {
    transform: scale(0.9) rotate(-8deg);
  }
  to {
    transform: scale(1.15) rotate(8deg);
  }
}

/* PLANETAS DISTANTES */

.planetas-distantes {
  z-index: 3;
}

.planeta-fundo {
  position: absolute;
  border-radius: 50%;
  overflow: hidden;
}

.planeta-azul {
  width: 115px;
  height: 115px;
  top: 18%;
  right: 12%;
  background: radial-gradient(
    circle at 30% 25%,
    #a8d8ff,
    #426aa5 35%,
    #172c58 70%,
    #080d25
  );
  box-shadow:
    inset -22px -15px 30px #05091c,
    0 0 45px rgba(75, 127, 225, 0.2);
  opacity: 0.72;
}

.planeta-azul span {
  position: absolute;
  width: 130%;
  height: 20%;
  left: -15%;
  top: 40%;
  border-radius: 50%;
  border: 1px solid rgba(190, 220, 255, 0.3);
  transform: rotate(-25deg);
}

.planeta-roxo {
  width: 58px;
  height: 58px;
  bottom: 20%;
  left: 9%;
  background: radial-gradient(
    circle at 30% 25%,
    #d6b3ff,
    #7953b8 45%,
    #20113d 85%
  );
  box-shadow: inset -12px -8px 18px #100820;
  opacity: 0.65;
}

.planeta-anel {
  position: absolute;
  width: 75px;
  height: 75px;
  right: 27%;
  bottom: 12%;
  border-radius: 50%;
  border: 1px solid rgba(185, 151, 255, 0.25);
  transform: rotate(-25deg) scaleY(0.35);
  opacity: 0.5;
}

.planeta-anel div {
  position: absolute;
  inset: 20px -12px;
  border: 2px solid rgba(161, 125, 255, 0.35);
  border-radius: 50%;
}

/* POEIRA CÓSMICA */

.poeira {
  position: absolute;
  inset: 0;
  z-index: 4;
}

.poeira span {
  position: absolute;
  left: calc((var(--i) - 1) * 100% / 23);
  bottom: -10px;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #c7aaff;
  opacity: 0;
  box-shadow: 0 0 8px #a77aff;
  animation: subir 12s linear infinite;
  animation-delay: calc(var(--i) * -0.8s);
}

@keyframes subir {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  15% {
    opacity: 0.6;
  }
  85% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-110vh);
    opacity: 0;
  }
}

/* ESTRELAS CADENTES */

.cadente {
  position: absolute;
  width: 110px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #d8c6ff, transparent);
  opacity: 0;
  transform: rotate(-35deg);
  animation: atravessar 9s linear infinite;
}

.cadente-um {
  top: 18%;
  left: 45%;
}

.cadente-dois {
  top: 55%;
  left: 75%;
  animation-delay: 4s;
}

.cadente-tres {
  top: 75%;
  left: 20%;
  animation-delay: 7s;
}

@keyframes atravessar {
  0%, 75% {
    opacity: 0;
    transform: translate(0, 0) rotate(-35deg);
  }
  78% {
    opacity: 0.8;
  }
  88% {
    opacity: 0;
    transform: translate(-180px, 130px) rotate(-35deg);
  }
  100% {
    opacity: 0;
  }
}

/* BORDAS */

.vinheta {
  position: absolute;
  inset: 0;
  z-index: 5;
  background:
    linear-gradient(90deg, rgba(5, 4, 14, 0.25), transparent 25%, transparent 75%, rgba(5, 4, 14, 0.2)),
    linear-gradient(0deg, rgba(5, 4, 14, 0.3), transparent 30%, transparent 80%, rgba(5, 4, 14, 0.2));
}

@media (max-width: 700px) {
  .planeta-azul {
    width: 70px;
    height: 70px;
    right: 5%;
  }

  .planeta-roxo {
    width: 38px;
    height: 38px;
  }

  .nebulosas {
    filter: blur(45px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .estrela,
  .nebulosa,
  .poeira span,
  .cadente {
    animation: none !important;
  }

  .camada {
    transition: none;
    transform: none !important;
  }
}
</style>
