
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const mouseX = ref(0)
const mouseY = ref(0)
const reducedMotion = ref(false)

let mediaQuery: MediaQueryList | null = null

const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
  reducedMotion.value = e.matches
}

const handleMouseMove = (e: MouseEvent) => {
  if (reducedMotion.value) return
  // Suavização e limitação do deslocamento (parallax leve)
  const x = (e.clientX / window.innerWidth) - 0.5
  const y = (e.clientY / window.innerHeight) - 0.5
  mouseX.value = x * 15
  mouseY.value = y * 15
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = mediaQuery.matches

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleMediaQueryChange)
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleMediaQueryChange)
  }

  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (mediaQuery) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    } else if (mediaQuery.removeListener) {
      mediaQuery.removeListener(handleMediaQueryChange)
    }
  }
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div class="fundo-espacial-container">
    <!-- Camada de Fundo Profundo com Parallax Suave -->
    <div 
      class="camada-parallax" 
      :style="{ transform: `translate(${mouseX * 0.4}px, ${mouseY * 0.4}px)` }"
    >
      <div class="nebulosa nebulosa-1"></div>
      <div class="nebulosa nebulosa-2"></div>
      <div class="nebulosa nebulosa-3"></div>
      <div class="campo-estrelas estrelas-pequenas"></div>
    </div>

    <!-- Camada Intermédia com Parallax Moderado -->
    <div 
      class="camada-parallax camada-media" 
      :style="{ transform: `translate(${mouseX * 0.9}px, ${mouseY * 0.9}px)` }"
    >
      <div class="campo-estrelas estrelas-medias"></div>
      <div class="particulas-flutuantes">
        <span class="particula" v-for="n in 15" :key="n" :style="`--i: ${n};`"></span>
      </div>
    </div>

    <!-- Grade Tecnológica Sutil Estilo Sci-Fi -->
    <div class="grade-tecnologica"></div>
  </div>
</template>

<style scoped>
.fundo-espacial-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
height: 100dvh;
  background: radial-gradient(circle at 50% 30%, #130a2a 0%, #070411 60%, #020107 100%);
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.camada-parallax {
  position: absolute;
  inset: -40px;
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

/* Nebulosas Imersivas (Roxo, Violeta, Azul) */
.nebulosa {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  mix-blend-mode: screen;
  animation: pulsarNebulosa 12s ease-in-out infinite alternate;
}

.nebulosa-1 {
  width: 650px;
  height: 650px;
  top: -10%;
  left: 10%;
  background: radial-gradient(circle, #7c3aed 0%, #4c1d95 60%, transparent 100%);
  animation-delay: 0s;
}

.nebulosa-2 {
  width: 750px;
  height: 750px;
  bottom: -15%;
  right: 5%;
  background: radial-gradient(circle, #3b82f6 0%, #1d4ed8 50%, transparent 100%);
  animation-delay: -4s;
}

.nebulosa-3 {
  width: 500px;
  height: 500px;
  top: 35%;
  left: 30%;
  background: radial-gradient(circle, #a855f7 0%, #6d28d9 70%, transparent 100%);
  animation-delay: -8s;
}

@keyframes pulsarNebulosa {
  0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
  50% { transform: scale(1.08) translate(15px, -12px); opacity: 0.42; }
  100% { transform: scale(0.96) translate(-12px, 15px); opacity: 0.3; }
}

/* Campos de Estrelas em Camadas */
.campo-estrelas {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
  animation: cintilarEstrelas 8s ease-in-out infinite alternate;
}

.estrelas-pequenas {
  background-image: 
    radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 40px 70px, #e9d5ff, rgba(0,0,0,0)),
    radial-gradient(1.5px 1.5px at 90px 40px, #93c5fd, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 150px 120px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 220px 180px, #c084fc, rgba(0,0,0,0));
  background-size: 250px 250px;
  opacity: 0.7;
}

.estrelas-medias {
  background-image: 
    radial-gradient(2px 2px at 60px 100px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2.5px 2.5px at 180px 200px, #bfdbfe, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 280px 70px, #e879f9, rgba(0,0,0,0));
  background-size: 350px 350px;
  opacity: 0.9;
  animation-duration: 5s;
}

@keyframes cintilarEstrelas {
  0% { opacity: 0.5; filter: brightness(0.8); }
  100% { opacity: 1; filter: brightness(1.2); }
}

/* Partículas Flutuantes Tecnológicas (Sem uso de funções matemáticas complexas em calc) */
.particulas-flutuantes {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particula {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #c084fc;
  box-shadow: 0 0 8px #a855f7;
  border-radius: 50%;
  bottom: -10px;
  left: calc((var(--i) - 1) * 100% / 14);
  animation: flutuarParticula calc(7s + (var(--i) * 0.4s)) linear infinite;
  opacity: 0;
}

@keyframes flutuarParticula {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  80% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-110vh) translateX(calc((var(--i) - 7) * 4px));
    opacity: 0;
  }
}

/* Grade Tecnológica de Fundo Sutil */
.grade-tecnologica {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.4;
}

/* Acessibilidade: Reduzir Movimento */
@media (prefers-reduced-motion: reduce) {
  .nebulosa, .campo-estrelas, .particula, .camada-parallax {
    animation: none !important;
    transform: none !important;
  }
}

/* Responsividade Mobile */
@media (max-width: 768px) {
  .nebulosa {
    filter: blur(80px);
    opacity: 0.25;
  }
  .nebulosa-1 { width: 400px; height: 400px; }
  .nebulosa-2 { width: 450px; height: 450px; }
  .nebulosa-3 { width: 300px; height: 300px; }
}
</style>

