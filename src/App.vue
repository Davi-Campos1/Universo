
<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()

function moverUniverso(event: PointerEvent) {
  // Não movimentar o cenário no dashboard
  if (route.path === '/dashboard') return

  const elemento = event.currentTarget as HTMLElement

  const x = event.clientX / window.innerWidth - 0.5
  const y = event.clientY / window.innerHeight - 0.5

  elemento.style.setProperty('--mouse-x', `${x * 25}px`)
  elemento.style.setProperty('--mouse-y', `${y * 25}px`)
}
</script>


<template>
 <div
  class="universo-background"
  :class="{ 'dashboard-mode': route.path === '/dashboard' }"
  @pointermove="moverUniverso"
>

    <div class="cosmos">

      <!-- NEBULOSAS -->
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="nebula nebula-3"></div>
      <div class="nebula nebula-4"></div>

      <!-- GALÁXIA CENTRAL -->
      <div class="galaxy-container">
        <div class="galaxy">
          <div class="galaxy-arm arm-1"></div>
          <div class="galaxy-arm arm-2"></div>
          <div class="galaxy-arm arm-3"></div>
          <div class="galaxy-core"></div>
        </div>
      </div>

      <!-- PLANETA COM ANEL -->
      <div class="orbit orbit-1">
        <div class="orbit-planet saturn">
          <div class="saturn-ring"></div>
        </div>
      </div>

      <!-- SEGUNDO PLANETA -->
      <div class="orbit orbit-2">
        <div class="orbit-planet blue-planet"></div>
      </div>

      <!-- TERCEIRO PLANETA -->
      <div class="orbit orbit-3">
        <div class="orbit-planet purple-planet"></div>
      </div>

      <!-- ESTRELAS -->
      <div class="stars stars-1"></div>
      <div class="stars stars-2"></div>
      <div class="stars stars-3"></div>

      <!-- ESTRELAS BRILHANTES -->
      <div class="bright-stars">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- METEOROS -->
      <div class="meteors">
        <span class="meteor meteor-1"></span>
        <span class="meteor meteor-2"></span>
        <span class="meteor meteor-3"></span>
        <span class="meteor meteor-4"></span>
        <span class="meteor meteor-5"></span>
      </div>

      <!-- PARTÍCULAS -->
      <div class="particles">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>

      <!-- CAMPO DE LUZ -->
      <div class="cosmic-light"></div>

      <!-- BORDAS -->
      <div class="vignette"></div>

    </div>

    <!-- PÁGINAS -->
    <div class="page-content">
      <RouterView />
    </div>

  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
}

body {
  background: #02030b;
  color: white;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.universo-background {
  --mouse-x: 0px;
  --mouse-y: 0px;

  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 100vh;
  background: #02030b;
}

.cosmos {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;

  background:
    radial-gradient(ellipse at 50% 50%, #11102b 0%, #07091a 55%, #02030b 100%);
}

/* NEBULOSAS */

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(65px);
  mix-blend-mode: screen;
  pointer-events: none;
}

.nebula-1 {
  width: 650px;
  height: 400px;
  top: 0;
  left: 0;
  background: rgba(112, 35, 220, 0.35);
  animation: nebula1 18s ease-in-out infinite alternate;
}

.nebula-2 {
  width: 700px;
  height: 500px;
  right: -10%;
  bottom: -10%;
  background: rgba(30, 90, 220, 0.3);
  animation: nebula2 22s ease-in-out infinite alternate;
}

.nebula-3 {
  width: 550px;
  height: 350px;
  top: 35%;
  left: 30%;
  background: rgba(190, 40, 180, 0.22);
  animation: nebula3 15s ease-in-out infinite alternate;
}

.nebula-4 {
  width: 400px;
  height: 400px;
  top: -15%;
  right: 10%;
  background: rgba(50, 60, 200, 0.25);
  animation: nebula1 25s ease-in-out infinite alternate-reverse;
}

/* GALÁXIA */

.galaxy-container {
  position: absolute;
  width: min(95vw, 900px);
  aspect-ratio: 1;
  top: 50%;
  left: 50%;

  transform:
    translate(
      calc(-50% + var(--mouse-x)),
      calc(-50% + var(--mouse-y))
    );

  animation: galaxyFloat 12s ease-in-out infinite alternate;
}

.galaxy {
  position: absolute;
  inset: 0;
  border-radius: 50%;

  background:
    repeating-conic-gradient(
      from 0deg,
      transparent 0deg 12deg,
      rgba(125, 75, 255, 0.12) 16deg,
      rgba(75, 145, 255, 0.2) 22deg,
      transparent 32deg 45deg
    );

  mask-image: radial-gradient(
    circle,
    transparent 0%,
    black 15%,
    black 42%,
    transparent 72%
  );

  animation: galaxySpin 100s linear infinite;
}

.galaxy-arm {
  position: absolute;
  inset: 12%;
  border-radius: 50%;
  filter: blur(15px);
}

.arm-1 {
  background: conic-gradient(
    from 20deg,
    transparent 0deg,
    rgba(150, 70, 255, 0.4) 55deg,
    transparent 110deg,
    rgba(70, 140, 255, 0.35) 180deg,
    transparent 250deg,
    rgba(180, 80, 255, 0.3) 320deg,
    transparent 360deg
  );
}

.arm-2 {
  inset: 22%;
  background: conic-gradient(
    from 120deg,
    transparent,
    rgba(90, 100, 255, 0.35),
    transparent 45%,
    rgba(200, 80, 255, 0.4),
    transparent
  );
  animation: galaxySpin 60s linear infinite reverse;
}

.arm-3 {
  inset: 30%;
  background: conic-gradient(
    from 200deg,
    transparent,
    rgba(190, 120, 255, 0.45),
    transparent 50%,
    rgba(70, 160, 255, 0.35),
    transparent
  );
}

.galaxy-core {
  position: absolute;
  width: 20%;
  height: 20%;
  top: 40%;
  left: 40%;
  border-radius: 50%;

  background: radial-gradient(
    circle,
    white 0%,
    #e4c9ff 8%,
    #a35aff 25%,
    rgba(120, 60, 255, 0.4) 55%,
    transparent 75%
  );

  box-shadow:
    0 0 30px #a66bff,
    0 0 80px #833bff,
    0 0 150px rgba(100, 60, 255, 0.6);

  animation: corePulse 5s ease-in-out infinite alternate;
}

/* ÓRBITAS DOS PLANETAS */

.orbit {
  position: absolute;
  border: 1px solid rgba(180, 150, 255, 0.12);
  border-radius: 50%;
  top: 50%;
  left: 50%;
}

.orbit-1 {
  width: 600px;
  height: 250px;
  margin-left: -300px;
  margin-top: -125px;
  transform: rotate(-25deg);
  animation: orbit1 35s linear infinite;
}

.orbit-2 {
  width: 850px;
  height: 380px;
  margin-left: -425px;
  margin-top: -190px;
  transform: rotate(35deg);
  animation: orbit2 55s linear infinite;
}

.orbit-3 {
  width: 1050px;
  height: 470px;
  margin-left: -525px;
  margin-top: -235px;
  transform: rotate(-50deg);
  animation: orbit3 70s linear infinite;
}

.orbit-planet {
  position: absolute;
  top: 50%;
  left: 0;
  border-radius: 50%;
}

.saturn {
  width: 65px;
  height: 65px;
  margin-top: -32px;

  background: radial-gradient(
    circle at 30% 30%,
    #e2caff,
    #8058ba 45%,
    #21113d 85%
  );

  box-shadow: 0 0 35px rgba(150, 100, 255, 0.4);
}

.saturn-ring {
  position: absolute;
  width: 110px;
  height: 30px;
  top: 18px;
  left: -22px;
  border: 5px solid rgba(193, 155, 255, 0.65);
  border-radius: 50%;
  transform: rotate(-25deg);
  box-shadow: 0 0 15px rgba(160, 100, 255, 0.5);
}

.blue-planet {
  width: 35px;
  height: 35px;
  margin-top: -17px;

  background: radial-gradient(
    circle at 30% 30%,
    #c0e7ff,
    #3676c8 50%,
    #101b49
  );

  box-shadow: 0 0 25px rgba(80, 150, 255, 0.6);
}

.purple-planet {
  width: 23px;
  height: 23px;
  margin-top: -11px;

  background: radial-gradient(
    circle at 30% 30%,
    #ffd0ff,
    #a13cce 50%,
    #270b48
  );

  box-shadow: 0 0 25px #a34dff;
}

/* ESTRELAS */

.stars {
  position: absolute;
  inset: -100px;
  background-repeat: repeat;
}

.stars-1 {
  background-image:
    radial-gradient(1px 1px at 20px 30px, white 99%, transparent),
    radial-gradient(1px 1px at 100px 150px, white 99%, transparent),
    radial-gradient(1px 1px at 200px 80px, #b7a8ff 99%, transparent),
    radial-gradient(1px 1px at 300px 220px, white 99%, transparent);

  background-size: 350px 300px;
  animation: starTravel 80s linear infinite;
}

.stars-2 {
  background-image:
    radial-gradient(2px 2px at 50px 80px, white 99%, transparent),
    radial-gradient(2px 2px at 180px 200px, #a8baff 99%, transparent),
    radial-gradient(2px 2px at 300px 100px, white 99%, transparent);

  background-size: 450px 350px;
  animation: starTravel 120s linear infinite reverse;
}

.stars-3 {
  background-image:
    radial-gradient(3px 3px at 100px 100px, white 99%, transparent),
    radial-gradient(2px 2px at 250px 200px, #d8baff 99%, transparent);

  background-size: 600px 400px;
  animation: starTwinkle 3s ease-in-out infinite alternate;
}

/* ESTRELAS CINTILANTES */

.bright-stars span {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;

  box-shadow:
    0 0 8px white,
    0 0 20px #a78bfa,
    0 0 35px #8b5cf6;

  animation: brightPulse 2s ease-in-out infinite alternate;
}

.bright-stars span:nth-child(1) {
  top: 15%;
  left: 20%;
}

.bright-stars span:nth-child(2) {
  top: 75%;
  left: 80%;
  animation-delay: 1s;
}

.bright-stars span:nth-child(3) {
  top: 25%;
  left: 85%;
  animation-delay: 0.5s;
}

.bright-stars span:nth-child(4) {
  top: 80%;
  left: 35%;
  animation-delay: 1.5s;
}

.bright-stars span:nth-child(5) {
  top: 45%;
  left: 10%;
  animation-delay: 0.8s;
}

.bright-stars span:nth-child(6) {
  top: 55%;
  left: 65%;
  animation-delay: 2s;
}

/* METEOROS */

.meteor {
  position: absolute;
  width: 160px;
  height: 2px;

  background: linear-gradient(
    90deg,
    white,
    #a78bfa 30%,
    transparent
  );

  box-shadow: 0 0 12px #a78bfa;
  transform: rotate(-35deg);
  opacity: 0;
  animation: meteorFly 8s linear infinite;
}

.meteor-1 {
  top: 15%;
  left: 80%;
  animation-delay: 0s;
}

.meteor-2 {
  top: 40%;
  left: 50%;
  animation-delay: 3s;
}

.meteor-3 {
  top: 10%;
  left: 30%;
  animation-delay: 5s;
}

.meteor-4 {
  top: 70%;
  left: 90%;
  animation-delay: 7s;
}

.meteor-5 {
  top: 60%;
  left: 40%;
  animation-delay: 10s;
}

/* PARTÍCULAS FLUTUANTES */

.particles span {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #c7a8ff;
  box-shadow: 0 0 10px #9b5cff;
  animation: particleFloat 12s ease-in-out infinite;
}

.particles span:nth-child(1) { left: 10%; top: 90%; animation-delay: 0s; }
.particles span:nth-child(2) { left: 20%; top: 70%; animation-delay: 2s; }
.particles span:nth-child(3) { left: 30%; top: 85%; animation-delay: 4s; }
.particles span:nth-child(4) { left: 40%; top: 95%; animation-delay: 1s; }
.particles span:nth-child(5) { left: 50%; top: 80%; animation-delay: 5s; }
.particles span:nth-child(6) { left: 60%; top: 90%; animation-delay: 3s; }
.particles span:nth-child(7) { left: 70%; top: 75%; animation-delay: 6s; }
.particles span:nth-child(8) { left: 80%; top: 95%; animation-delay: 2s; }
.particles span:nth-child(9) { left: 90%; top: 80%; animation-delay: 4s; }
.particles span:nth-child(10) { left: 15%; top: 50%; animation-delay: 7s; }
.particles span:nth-child(11) { left: 35%; top: 45%; animation-delay: 3s; }
.particles span:nth-child(12) { left: 65%; top: 40%; animation-delay: 8s; }
.particles span:nth-child(13) { left: 75%; top: 30%; animation-delay: 5s; }
.particles span:nth-child(14) { left: 85%; top: 55%; animation-delay: 1s; }
.particles span:nth-child(15) { left: 45%; top: 25%; animation-delay: 6s; }

/* ILUMINAÇÃO */

.cosmic-light {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 50%,
    transparent 20%,
    rgba(90, 50, 180, 0.08) 60%,
    transparent 80%
  );

  animation: lightPulse 8s ease-in-out infinite alternate;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 25%,
    rgba(2, 3, 11, 0.4) 70%,
    rgba(2, 3, 11, 0.85) 100%
  );
}

/* CONTEÚDO */

.page-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
}

/* ANIMAÇÕES */

@keyframes galaxySpin {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}

@keyframes galaxyFloat {
  from { scale: 0.95; }
  to { scale: 1.05; }
}

@keyframes corePulse {
  from { scale: 0.85; opacity: 0.7; }
  to { scale: 1.2; opacity: 1; }
}

@keyframes nebula1 {
  from { transform: translate(-50px, -20px) scale(0.9); }
  to { transform: translate(100px, 80px) scale(1.3); }
}

@keyframes nebula2 {
  from { transform: translate(50px, 20px) scale(1); }
  to { transform: translate(-100px, -60px) scale(1.25); }
}

@keyframes nebula3 {
  from { transform: translate(-40px, 40px) scale(1); }
  to { transform: translate(80px, -50px) scale(1.3); }
}

@keyframes orbit1 {
  from { transform: rotate(-25deg); }
  to { transform: rotate(335deg); }
}

@keyframes orbit2 {
  from { transform: rotate(35deg); }
  to { transform: rotate(395deg); }
}

@keyframes orbit3 {
  from { transform: rotate(-50deg); }
  to { transform: rotate(310deg); }
}

@keyframes starTravel {
  from { background-position: 0 0; }
  to { background-position: 350px 300px; }
}

@keyframes starTwinkle {
  from { opacity: 0.2; }
  to { opacity: 0.9; }
}

@keyframes brightPulse {
  from { opacity: 0.3; scale: 0.6; }
  to { opacity: 1; scale: 1.5; }
}

@keyframes meteorFly {
  0%, 70% {
    opacity: 0;
    transform: translate(0, 0) rotate(-35deg);
  }
  73% { opacity: 1; }
  85% {
    opacity: 0;
    transform: translate(-350px, 230px) rotate(-35deg);
  }
  100% { opacity: 0; }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-180px) translateX(35px);
    opacity: 0.8;
  }
}

@keyframes lightPulse {
  from { opacity: 0.4; }
  to { opacity: 1; }
}

/* CELULAR */

@media (max-width: 600px) {
  .galaxy-container {
    width: 130vw;
  }

  .orbit-1 {
    width: 450px;
    margin-left: -225px;
  }

  .orbit-2 {
    width: 600px;
    margin-left: -300px;
  }

  .orbit-3 {
    width: 750px;
    margin-left: -375px;
  }

  .saturn {
    width: 45px;
    height: 45px;
  }
}

/* ACESSIBILIDADE */

@media (prefers-reduced-motion: reduce) {
  .cosmos *,
  .cosmos *::before,
  .cosmos *::after {
    animation: none !important;
  }
}
body {
  font-family: 'Space Grotesk', sans-serif;
}

h1, h2, h3 {
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 1px;
}

button, nav, .menu, .perfil {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
}

.logo {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  letter-spacing: 4px;
}

/* DASHBOARD: REMOVE O NÚCLEO ROXO */
.dashboard-mode .galaxy-core {
  display: none;
}

/* Evita movimento do cenário no dashboard */
.dashboard-mode .galaxy-container {
  transform: translate(-50%, -50%);
}

</style>
