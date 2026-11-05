
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  corBase: { type: String, default: '#3b82f6' },
  corAgua: { type: String, default: '#1d4ed8' },
  corTerra: { type: String, default: '#4f8a45' },
  corAneis: { type: String, default: '#c6b7e5' },
  tipoPlaneta: { type: String, default: 'terrestre' },
  temAgua: { type: Boolean, default: true },
  temTerra: { type: Boolean, default: true },
  tamanho: { type: Number, default: 1.3 },
  atmosfera: { type: Boolean, default: true },
  aneis: { type: Boolean, default: false },
  tipo: { type: String, default: 'planeta' },
  temperatura: { type: Number, default: 15 },
  deslocamentoX: { type: Number, default: 2.5 }
})

const containerRef = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null

let objetoGrupo: THREE.Group | null = null
let objetoMesh: THREE.Mesh | null = null
let cloudsMesh: THREE.Mesh | null = null
let glowMesh: THREE.Sprite | null = null
let diskMesh: THREE.Mesh | null = null
let animationFrameId = 0
let resizeObserver: ResizeObserver | null = null
let pointerAtivo = false
let ultimoX = 0
let ultimoY = 0

const iniciarArraste = (event: PointerEvent) => {
  if (!renderer || !camera || !objetoGrupo || event.button !== 0) return

  const rect = renderer.domElement.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // Só inicia a rotação quando o clique realmente atinge o corpo celeste.
  if (raycaster.intersectObject(objetoGrupo, true).length === 0) return

  pointerAtivo = true
  ultimoX = event.clientX
  ultimoY = event.clientY
  renderer.domElement.setPointerCapture(event.pointerId)
}

const moverArraste = (event: PointerEvent) => {
  if (!pointerAtivo || !objetoGrupo) return
  const deltaX = event.clientX - ultimoX
  const deltaY = event.clientY - ultimoY
  ultimoX = event.clientX
  ultimoY = event.clientY
  objetoGrupo.rotation.y += deltaX * 0.008
  objetoGrupo.rotation.x += deltaY * 0.008
  objetoGrupo.rotation.x = THREE.MathUtils.clamp(objetoGrupo.rotation.x, -Math.PI / 2, Math.PI / 2)
}

const terminarArraste = () => {
  pointerAtivo = false
}

// O objeto fica deslocado para a direita.
// A câmera e os controles olham para o centro da tela.


const criarTexturaPlaneta = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  if (props.tipoPlaneta === 'gasoso') {
    // Faixas atmosféricas com a cor escolhida pelo usuário.
    ctx.fillStyle = props.corBase
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < canvas.height; y += 12 + Math.random() * 25) {
      const altura = 8 + Math.random() * 28
      ctx.fillStyle = Math.random() > 0.5
        ? 'rgba(255,255,255,0.18)'
        : 'rgba(20,10,30,0.16)'
      ctx.fillRect(0, y, canvas.width, altura)
    }

    for (let i = 0; i < 90; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      ctx.beginPath()
      ctx.ellipse(x, y, 25 + Math.random() * 100, 5 + Math.random() * 20, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,235,210,0.12)'
      ctx.fill()
    }
  } else if (props.tipoPlaneta === 'rochoso') {
    ctx.fillStyle = props.corBase
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < 950; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const r = 3 + Math.random() * 26
      const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 1, x, y, r)
      grad.addColorStop(0, 'rgba(20,18,25,0.45)')
      grad.addColorStop(0.75, 'rgba(70,65,70,0.18)')
      grad.addColorStop(1, 'rgba(230,225,220,0.25)')
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }
  } else {
    // Planeta terrestre: água e continentes usam as cores escolhidas.
    const corAguaFinal = props.corAgua
    const corTerraFinal = props.corTerra
    ctx.fillStyle = props.temAgua ? corAguaFinal : corTerraFinal
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (props.temTerra) {
      const continentes = [
        [280, 260, 170, 100], [450, 510, 130, 190],
        [850, 280, 210, 120], [1110, 570, 150, 110],
        [1500, 300, 230, 150], [1770, 650, 140, 100],
        [650, 800, 110, 60]
      ]

      ctx.fillStyle = corTerraFinal
      for (const [x, y, largura, altura] of continentes) {
        ctx.beginPath()
        const pontos = 28
        for (let i = 0; i <= pontos; i++) {
          const angulo = (i / pontos) * Math.PI * 2
          const irregularidade = 0.78 + Math.random() * 0.35
          const px = x + Math.cos(angulo) * largura * irregularidade
          const py = y + Math.sin(angulo) * altura * irregularidade
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  // Variações suaves de superfície.
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    ctx.beginPath()
    ctx.arc(x, y, 3 + Math.random() * 12, 0, Math.PI * 2)
    ctx.fillStyle = Math.random() > 0.5
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.07)'
    ctx.fill()
  }

  const textura = new THREE.CanvasTexture(canvas)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

const criarTexturaLua = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#92929d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Manchas e mares lunares.
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const r = 15 + Math.random() * 100

    ctx.beginPath()
    ctx.ellipse(x, y, r, r * (0.5 + Math.random()), 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(40,40,48,0.13)'
    ctx.fill()
  }

  // Crateras com borda clara e interior escuro.
  for (let i = 0; i < 650; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const r = 3 + Math.random() * 28

    const gradiente = ctx.createRadialGradient(
      x - r * 0.25, y - r * 0.25, r * 0.1,
      x, y, r
    )

    gradiente.addColorStop(0, 'rgba(35,35,42,0.5)')
    gradiente.addColorStop(0.7, 'rgba(60,60,68,0.35)')
    gradiente.addColorStop(1, 'rgba(220,220,225,0.45)')

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = gradiente
    ctx.fill()
  }

  const textura = new THREE.CanvasTexture(canvas)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

const criarTexturaNuvens = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height

    ctx.beginPath()
    ctx.ellipse(
      x, y,
      20 + Math.random() * 80,
      4 + Math.random() * 13,
      Math.random() * Math.PI,
      0, Math.PI * 2
    )

    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.12})`
    ctx.fill()
  }

  const textura = new THREE.CanvasTexture(canvas)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

const criarTexturaBrilho = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256

  const ctx = canvas.getContext('2d')!
  const gradiente = ctx.createRadialGradient(128, 128, 5, 128, 128, 128)

  gradiente.addColorStop(0, 'rgba(255,255,255,0.8)')
  gradiente.addColorStop(0.2, 'rgba(255,255,255,0.35)')
  gradiente.addColorStop(0.55, 'rgba(255,255,255,0.08)')
  gradiente.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradiente
  ctx.fillRect(0, 0, 256, 256)

  return new THREE.CanvasTexture(canvas)
}

const limparObjeto = () => {
  if (!objetoGrupo) return

  objetoGrupo.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
      child.geometry?.dispose()

      const materiais = Array.isArray(child.material)
        ? child.material
        : [child.material]

      materiais.forEach((material) => {
        if ('map' in material && material.map) {
          material.map.dispose()
        }
        material.dispose()
      })
    }
  })

  scene?.remove(objetoGrupo)

  objetoGrupo = null
  objetoMesh = null
  cloudsMesh = null
  glowMesh = null
  diskMesh = null
}

const criarObjeto = () => {
  if (!scene) return

  limparObjeto()

  objetoGrupo = new THREE.Group()
  objetoGrupo.position.set(
  containerRef.value && containerRef.value.clientWidth <= 700
    ? 0
    : props.deslocamentoX,
  0,
  0
)

  const raio = props.tipo === 'lua'
    ? props.tamanho * 0.65
    : props.tipo === 'estrela'
      ? props.tamanho * 1.1
      : props.tamanho

  if (props.tipo === 'planeta') {
    const geometria = new THREE.SphereGeometry(raio, 128, 128)

    const corTemperatura = props.temperatura <= 0
      ? '#b9d9ff'
      : props.temperatura >= 100
        ? '#ff9b70'
        : '#ffffff'

    const material = new THREE.MeshStandardMaterial({
      map: criarTexturaPlaneta(),
      color: corTemperatura,
      roughness: 0.85,
      metalness: 0
    })

    objetoMesh = new THREE.Mesh(geometria, material)
    objetoMesh.rotation.z = -0.2
    objetoGrupo.add(objetoMesh)

    if (props.atmosfera) {
      const nuvens = new THREE.Mesh(
        new THREE.SphereGeometry(raio * 1.025, 96, 96),
        new THREE.MeshStandardMaterial({
          map: criarTexturaNuvens(),
          transparent: true,
          opacity: 0.55,
          depthWrite: false
        })
      )

      cloudsMesh = nuvens
      objetoGrupo.add(nuvens)
    }

    if (props.aneis) {
      const aneis = new THREE.Mesh(
        new THREE.RingGeometry(raio * 1.35, raio * 2.0, 128),
        new THREE.MeshStandardMaterial({
          color: props.corAneis,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          roughness: 0.9
        })
      )

      aneis.rotation.x = Math.PI / 2.5
      aneis.rotation.y = 0.15
      objetoGrupo.add(aneis)
    }
  }

  if (props.tipo === 'lua') {
    const geometria = new THREE.SphereGeometry(raio, 128, 128)

    const material = new THREE.MeshStandardMaterial({
      map: criarTexturaLua(),
      color: props.corBase,
      roughness: 1,
      metalness: 0
    })

    objetoMesh = new THREE.Mesh(geometria, material)
    objetoGrupo.add(objetoMesh)
  }

  if (props.tipo === 'estrela') {
    // Estrela sem textura de planeta: superfície luminosa e lisa.
    const material = new THREE.MeshBasicMaterial({
      color: props.corBase
    })

    objetoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(raio, 96, 96),
      material
    )

    objetoGrupo.add(objetoMesh)

    const brilhoMaterial = new THREE.SpriteMaterial({
      map: criarTexturaBrilho(),
      color: props.corBase,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    glowMesh = new THREE.Sprite(brilhoMaterial)
    glowMesh.scale.set(raio * 4.5, raio * 4.5, 1)
    objetoGrupo.add(glowMesh)
  }

  if (props.tipo === 'buraco_negro') {
    // Núcleo escuro.
    const nucleo = new THREE.Mesh(
      new THREE.SphereGeometry(raio * 0.72, 96, 96),
      new THREE.MeshBasicMaterial({ color: '#000000' })
    )

    objetoMesh = nucleo
    objetoGrupo.add(nucleo)

    // Disco de acreção com espessura, inclinado.
    const discoMaterial = new THREE.MeshBasicMaterial({
      color: props.corBase,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    diskMesh = new THREE.Mesh(
      new THREE.TorusGeometry(raio * 1.25, raio * 0.24, 16, 120),
      discoMaterial
    )

    diskMesh.rotation.x = Math.PI / 2.3
    objetoGrupo.add(diskMesh)

    const discoExterno = new THREE.Mesh(
      new THREE.TorusGeometry(raio * 1.65, raio * 0.07, 12, 120),
      new THREE.MeshBasicMaterial({
        color: props.corBase,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
    )

    discoExterno.rotation.x = Math.PI / 2.3
    objetoGrupo.add(discoExterno)
  }

  scene.add(objetoGrupo)
}

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    38,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  )

  // A câmera olha para o centro da tela, não para o planeta.
  camera.position.set(0, 0, 8)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  if (objetoGrupo) {
  objetoGrupo.position.x = container.clientWidth <= 700
    ? 0
    : props.deslocamentoX
}
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  container.appendChild(renderer.domElement)
  renderer.domElement.addEventListener('pointerdown', iniciarArraste)
  renderer.domElement.addEventListener('pointermove', moverArraste)
  renderer.domElement.addEventListener('pointerup', terminarArraste)
  renderer.domElement.addEventListener('pointercancel', terminarArraste)
  renderer.domElement.addEventListener('lostpointercapture', terminarArraste)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enablePan = false
  controls.enableRotate = false
  controls.minDistance = 3
  controls.maxDistance = 12

  // Esta é a correção que impede o planeta de voltar ao centro.
  controls.target.set(0, 0, 0)
  controls.update()

  scene.add(new THREE.AmbientLight(0xffffff, 1.1))

  const luz = new THREE.DirectionalLight(0xffffff, 1.5)
  luz.position.set(4, 5, 7)
  scene.add(luz)

  criarObjeto()

  resizeObserver = new ResizeObserver(() => {
    if (!container || !camera || !renderer) return

    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

  resizeObserver.observe(container)

  const clock = new THREE.Clock()

  const animar = () => {
    animationFrameId = requestAnimationFrame(animar)

    const delta = Math.min(clock.getDelta(), 0.05)

    if (objetoGrupo) {
      if (!pointerAtivo) objetoGrupo.rotation.y += delta * 0.07
    }

    controls?.update()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animar()
})

watch(
  () => [
    props.corBase,
    props.corAgua,
    props.corTerra,
    props.corAneis,
    props.tipoPlaneta,
    props.temAgua,
    props.temTerra,
    props.tamanho,
    props.atmosfera,
    props.aneis,
    props.tipo,
    props.temperatura
  ],
  () => {
    criarObjeto()
  }
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  resizeObserver?.disconnect()
  controls?.dispose()

  limparObjeto()

  if (renderer) {
    renderer.domElement.removeEventListener('pointerdown', iniciarArraste)
    renderer.domElement.removeEventListener('pointermove', moverArraste)
    renderer.domElement.removeEventListener('pointerup', terminarArraste)
    renderer.domElement.removeEventListener('pointercancel', terminarArraste)
    renderer.domElement.removeEventListener('lostpointercapture', terminarArraste)
    renderer.dispose()
    renderer.domElement.remove()
  }

  scene = null
  camera = null
  renderer = null
})
</script>

<template>
  <div ref="containerRef" class="planet-background"></div>
</template>

<style scoped>
.planet-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
  z-index: 1;
  cursor: grab;
}

.planet-background :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
}
</style>
