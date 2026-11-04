<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Planeta3D from '../components/Planeta3D.vue'
import { useUsuarioStore } from '../stores/usuario'

const router = useRouter()
const usuarioStore = useUsuarioStore()

// Carregar a sessão para identificar o criador da publicação
usuarioStore.carregarSessao()

const nome = ref('')
const tipo = ref('planeta')
const tamanho = ref(1.3)
const temperaturaCelsius = ref(15)

const corBase = ref('#a6a6b5')
const corAgua = ref('#1d4ed8')
const corTerra = ref('#4f8a45')
const corAneis = ref('#c6b7e5')
const tipoPlaneta = ref('terrestre')
const temAgua = ref(true)
const temTerra = ref(true)
const descricao = ref('')

const atmosfera = ref(false)
const aneis = ref(false)

const mensagemErro = ref('')
const mensagemSucesso = ref('')
const carregando = ref(false)

// Preços oficiais da economia ALTERRA (IGUAIS ao server.js).
const PRECOS = {
  lua: 25,
  estrela: 50,
  buraco_negro: 100, // Corrigido para buraco_negro
  tipoPlaneta: 5,
  atmosfera: 10,
  aneis: 13
}

const custoCalculado = computed(() => {
  let custo = 0

  if (tipo.value === 'lua') custo += PRECOS.lua
  if (tipo.value === 'estrela') custo += PRECOS.estrela
  if (tipo.value === 'buraco_negro') custo += PRECOS.buraco_negro // Corrigido

  if (tipo.value === 'planeta') {
    if (tipoPlaneta.value !== 'terrestre' && tipoPlaneta.value !== 'agua e terra') {
      custo += PRECOS.tipoPlaneta
    }
    if (atmosfera.value) custo += PRECOS.atmosfera
    if (aneis.value) custo += PRECOS.aneis
  }

  return custo
})

const obterCuriosidade = () => {
  const curiosidades: Record<string, string> = {
    planeta: 'Um planeta pode ter composição rochosa, gasosa ou gelada. A temperatura, a atmosfera e a distância da estrela influenciam suas condições.',
    estrela: 'Estrelas produzem energia por fusão nuclear em seu núcleo, transformando elementos leves em outros mais pesados.',
    lua: 'Luas são corpos naturais que orbitam planetas. Algumas possuem atividade geológica, oceanos subterrâneos ou atmosferas muito finas.',
    buraco_negro: 'A gravidade de um buraco negro é tão intensa que, depois de cruzar o horizonte de eventos, nem mesmo a luz consegue escapar.'
  }
  return curiosidades[tipo.value] || curiosidades.planeta
}

watch(tipo, (novoTipo) => {
  if (novoTipo === 'estrela') corBase.value = '#ffbd59'
  if (novoTipo === 'lua') corBase.value = '#a6a6b5'
  if (novoTipo === 'buraco_negro') corBase.value = '#a855f7'
  if (novoTipo === 'planeta') corBase.value = '#3b82f6'
})

const criarObjeto = async () => {
  mensagemErro.value = ''
  mensagemSucesso.value = ''

  if (!nome.value.trim()) {
    mensagemErro.value = 'Por favor, atribui um nome ao teu corpo celeste.'
    return
  }

  const criadorId = usuarioStore.id

  if (!criadorId) {
    mensagemErro.value = 'Sua sessão não possui um identificador válido. Saia da conta e entre novamente.'
    return
  }

  if (usuarioStore.pontos < custoCalculado.value) {
    mensagemErro.value = `Pontos insuficientes. Esta criação custa ${custoCalculado.value} pontos e você tem ${usuarioStore.pontos}.`
    return
  }

  carregando.value = true

  try {
    const resposta = await fetch('http://localhost:3000/criar-objeto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.value.trim(),
        tipo: tipo.value,
        tamanho: Number(tamanho.value),
        temperatura: Number(temperaturaCelsius.value),
        corBase: corBase.value,
        corAgua: corAgua.value,
        corTerra: corTerra.value,
        corAneis: corAneis.value,
        tipoPlaneta: tipoPlaneta.value,
        temAgua: temAgua.value,
        temTerra: temTerra.value,
        descricao: descricao.value.trim(),
        curiosidade: obterCuriosidade(),
        atmosfera: atmosfera.value,
        aneis: aneis.value,
        criadorId
      })
    })
const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao criar o objeto.')
    }

    // Isto é o que força a store e o localStorage a atualizarem os pontos imediatamente!
    if (dados.pontosRestantes !== undefined) {
      usuarioStore.atualizarPontos(dados.pontosRestantes)
    }

    mensagemSucesso.value = `Corpo celeste criado com sucesso! Foram descontados ${dados.custo} pontos.`

    setTimeout(() => router.push('/dashboard'), 1500)
  } catch (erro: any) {
    mensagemErro.value = erro.message || 'Erro de conexão com o servidor.'
  } finally {
    carregando.value = false
  }
}

const voltarDashboard = () => router.push('/dashboard')
</script>

<template>
  <main class="criacao-container">

    <div class="cenario">
      <div class="nebulosa nebulosa-1"></div>
      <div class="nebulosa nebulosa-2"></div>
      <div class="estrelas"></div>
    </div>

    <Planeta3D
      :cor-base="corBase"
      :cor-agua="corAgua"
      :cor-terra="corTerra"
      :cor-aneis="corAneis"
      :tipo-planeta="tipoPlaneta"
      :tem-agua="temAgua"
      :tem-terra="temTerra"
      :tamanho="tamanho"
      :atmosfera="atmosfera"
      :aneis="aneis"
      :tipo="tipo"
      :temperatura="temperaturaCelsius"
    />

    <section class="editor-card">

      <header class="header-editor">
        <div>
          <span class="editor-tag">ALTERRA / LABORATÓRIO</span>
          <h2>Editor de Criações</h2>
        </div>

        <button class="btn-voltar" type="button" @click="voltarDashboard">
          ← Voltar
        </button>
      </header>

      <div class="painel-pontos" aria-label="Resumo de pontos da criação">
        <div class="pontos-item">
          <span class="pontos-legenda">Saldo disponível</span>
          <strong>{{ usuarioStore.pontos.toLocaleString('pt-BR') }} <small>pts</small></strong>
        </div>
        <span class="pontos-separador" aria-hidden="true"></span>
        <div class="pontos-item custo-atual">
          <span class="pontos-legenda">Esta criação</span>
          <strong>{{ custoCalculado.toLocaleString('pt-BR') }} <small>pts</small></strong>
        </div>
      </div>

      <p class="subtitulo">
        Configure seu objeto celeste e acompanhe sua criação em tempo real.
      </p>

      <form @submit.prevent="criarObjeto" class="form-editor">

        <div class="input-group">
          <label for="nome">Nome do corpo celeste</label>
          <input
            id="nome"
            type="text"
            v-model="nome"
            placeholder="Ex: Kepler-442b"
            maxlength="40"
            required
          />
        </div>

        <div class="input-group">
          <label for="tipo">Tipo de objeto</label>
          <select id="tipo" v-model="tipo">
            <option value="planeta">Planeta</option>
            <option value="estrela">Estrela (50 pontos)</option>
            <option value="lua">Lua (25 pontos)</option>
            <option value="buraco_negro">Buraco Negro (100 pontos)</option>
          </select>
        </div>

        <div v-if="tipo === 'planeta'" class="grupo-personalizacao">
          <div class="divisor-titulo">
            <span>COMPOSIÇÃO DO PLANETA</span>
          </div>

          <div class="input-group">
            <label for="tipo-planeta">Tipo de planeta (5 pontos se diferente do padrão)</label>
            <select id="tipo-planeta" v-model="tipoPlaneta">
              <option value="terrestre">Com água e terra (grátis)</option>
              <option value="rochoso">Rochoso / craterado (5 pontos)</option>
              <option value="gasoso">Gasoso / faixas de nuvens (5 pontos)</option>
            </select>
          </div>

          <div v-if="tipoPlaneta === 'terrestre' || tipoPlaneta === 'agua e terra'" class="grid-duplo">
            <div class="input-group">
              <label>Cor da água</label>
              <div class="seletor-cor">
                <div class="amostra-cor" :style="{ background: corAgua }">
                  <input type="color" v-model="corAgua" aria-label="Escolher cor da água" />
                </div>
                <span>{{ corAgua.toUpperCase() }}</span>
              </div>
              <label class="opcao-check">
                <input type="checkbox" v-model="temAgua" />
                <span>Ter água</span>
              </label>
            </div>

            <div class="input-group">
              <label>Cor da terra</label>
              <div class="seletor-cor">
                <div class="amostra-cor" :style="{ background: corTerra }">
                  <input type="color" v-model="corTerra" aria-label="Escolher cor da terra" />
                </div>
                <span>{{ corTerra.toUpperCase() }}</span>
              </div>
              <label class="opcao-check">
                <input type="checkbox" v-model="temTerra" />
                <span>Ter continentes</span>
              </label>
            </div>
          </div>

          <div v-else class="input-group">
            <label>Cor das camadas</label>
            <div class="seletor-cor seletor-cor-grande">
              <div class="amostra-cor" :style="{ background: corBase }">
                <input type="color" v-model="corBase" aria-label="Escolher cor do planeta" />
              </div>
              <span>{{ corBase.toUpperCase() }}</span>
            </div>
          </div>

          <label class="opcao-check">
            <input type="checkbox" v-model="atmosfera" />
            <span>Atmosfera e nuvens (10 pontos)</span>
          </label>

          <label class="opcao-check">
            <input type="checkbox" v-model="aneis" />
            <span>Adicionar anéis ao planeta (13 pontos)</span>
          </label>

          <div v-if="aneis" class="input-group">
            <label>Cor dos anéis</label>
            <div class="seletor-cor seletor-cor-grande">
              <div class="amostra-cor" :style="{ background: corAneis }">
                <input type="color" v-model="corAneis" aria-label="Escolher cor dos anéis" />
              </div>
              <span>{{ corAneis.toUpperCase() }}</span>
            </div>
          </div>
        </div>

        <div v-else class="input-group">
          <label>Cor principal do objeto</label>
          <div class="seletor-cor seletor-cor-grande">
            <div class="amostra-cor" :style="{ background: corBase }">
              <input type="color" v-model="corBase" aria-label="Escolher cor do objeto" />
            </div>
            <span>{{ corBase.toUpperCase() }}</span>
          </div>
        </div>

        <div class="input-group">
          <label class="label-range">
            <span>Tamanho</span>
            <strong>{{ tamanho.toFixed(1) }}x</strong>
          </label>

          <input
            type="range"
            v-model.number="tamanho"
            min="0.1"
            max="1.8"
            step="0.1"
            class="range-input"
          />
        </div>

        <div class="input-group">
          <label>Temperatura</label>

          <div class="temperatura-input">
            <input
              type="number"
              v-model.number="temperaturaCelsius"
              min="-273"
              max="3000"
              step="1"
            />
            <span>°C</span>
          </div>

          <input
            type="range"
            v-model.number="temperaturaCelsius"
            min="-273"
            max="3000"
            step="1"
            class="range-input"
          />

          <small class="ajuda">
            Digite o valor ou utilize o controle deslizante.
          </small>
        </div>

        <div class="input-group">
          <label for="descricao">Descrição do objeto</label>
          <textarea
            id="descricao"
            v-model="descricao"
            maxlength="500"
            rows="3"
            placeholder="Conte a história, as características ou os detalhes da sua criação..."
          ></textarea>
          <small class="ajuda">{{ descricao.length }}/500 caracteres</small>
        </div>

        <section class="curiosidade-box">
          <span class="curiosidade-tag">✦ VOCÊ SABIA?</span>
          <p>{{ obterCuriosidade() }}</p>
          <small>Informação relacionada ao tipo de objeto selecionado.</small>
        </section>

        <p v-if="mensagemErro" class="mensagem erro">{{ mensagemErro }}</p>
        <p v-if="mensagemSucesso" class="mensagem sucesso">{{ mensagemSucesso }}</p>

        <button type="submit" class="btn-criar" :disabled="carregando">
          {{ carregando ? 'Criando objeto...' : '✦ Salvar no Universo' }}
        </button>

      </form>
    </section>

    <div class="indicador-preview">
      <span class="indicador-ponto"></span>
      VISUALIZAÇÃO EM TEMPO REAL
    </div>

  </main>
</template>

<style scoped>
.criacao-container {
  color-scheme: dark;
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 75% 45%, rgba(73, 35, 145, 0.22), transparent 48%),
    radial-gradient(ellipse at 50% 100%, rgba(50, 35, 110, 0.2), transparent 55%),
    #070513;
}

.cenario {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.nebulosa {
  position: absolute;
  width: 600px;
  height: 500px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.2;
}

.nebulosa-1 {
  top: 5%;
  right: 0;
  background: #7035c9;
}

.nebulosa-2 {
  bottom: -20%;
  right: 25%;
  background: #244fba;
  opacity: 0.12;
}

.estrelas {
  position: absolute;
  inset: 0;
  opacity: 0.7;
  background-image:
    radial-gradient(1px 1px at 10% 20%, white 90%, transparent),
    radial-gradient(1px 1px at 30% 70%, white 90%, transparent),
    radial-gradient(2px 2px at 70% 15%, #c4a5ff 90%, transparent),
    radial-gradient(1px 1px at 85% 65%, white 90%, transparent),
    radial-gradient(1px 1px at 55% 45%, white 90%, transparent),
    radial-gradient(2px 2px at 93% 30%, #c4a5ff 90%, transparent);
  background-size: 250px 220px;
}

.editor-card {
  position: absolute;
  z-index: 10;
  top: 50%;
  left: clamp(20px, 5vw, 80px);
  transform: translateY(-50%);
  width: min(440px, calc(100vw - 40px));
  max-height: calc(100vh - 36px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 25px;

  color: #fff;
  background: rgba(12, 9, 32, 0.91);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(170, 130, 255, 0.28);
  border-radius: 18px;
  box-shadow: 0 20px 65px rgba(0,0,0,0.5);
}

.editor-card::-webkit-scrollbar {
  width: 5px;
}

.editor-card::-webkit-scrollbar-thumb {
  background: rgba(167,139,250,0.4);
  border-radius: 10px;
}

.header-editor {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.editor-tag {
  color: #a78bfa;
  font-size: 9px;
  letter-spacing: 2px;
}

.header-editor h2 {
  margin: 5px 0 0;
  color: #eadcff;
  font-size: 21px;
}

.painel-pontos {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: center;
  gap: 14px;
  margin: 17px 0 12px;
  padding: 11px 13px;
  background: rgba(21, 16, 43, 0.62);
  border: 1px solid rgba(170, 130, 255, 0.18);
  border-radius: 10px;
}

.pontos-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.pontos-legenda {
  color: #9689b2;
  font-size: 10px;
  letter-spacing: 0.25px;
  text-transform: none;
}

.pontos-item strong {
  color: #e9ddff;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.pontos-item strong small {
  color: #a99acb;
  font-size: 10px;
  font-weight: 500;
}

.pontos-separador {
  width: 1px;
  height: 30px;
  background: rgba(170, 130, 255, 0.2);
}

.custo-atual {
  text-align: right;
}

.custo-atual strong {
  color: #c4a5ff;
}

.subtitulo {
  color: #aaa0c5;
  font-size: 12px;
  line-height: 1.6;
  margin: 10px 0 15px;
}

.form-editor {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.input-group > label,
.label-range {
  color: #d9d0eb;
  font-size: 12px;
}

.input-group input[type="text"],
.input-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  color: white;
  background: rgba(27, 21, 55, 0.9);
  border: 1px solid rgba(170,130,255,0.25);
  border-radius: 9px;
  outline: none;
  font-size: 13px;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
}

.input-group select option {
  background: #17102f;
  color: white;
}

.input-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  color: #fff;
  background: #080611;
  border: 1px solid rgba(170,130,255,0.25);
  border-radius: 9px;
  outline: none;
  resize: vertical;
  font: inherit;
  font-size: 12px;
  line-height: 1.5;
}

.curiosidade-box {
  padding: 13px;
  border: 1px solid rgba(167,139,250,0.25);
  border-radius: 10px;
  background: #080611;
}

.curiosidade-tag {
  color: #c4a5ff;
  font-size: 9px;
  letter-spacing: 1.8px;
  font-weight: 700;
}

.curiosidade-box p {
  margin: 8px 0;
  color: #e8e0f7;
  font-size: 11px;
  line-height: 1.6;
}

.curiosidade-box small {
  color: #8f85a7;
  font-size: 9px;
}

@media (max-width: 420px) {
  .painel-pontos { gap: 9px; padding: 10px; }
  .pontos-item strong { font-size: 14px; }
}

.grid-duplo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.grupo-personalizacao {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 14px;
  background: rgba(95, 65, 155, 0.09);
  border: 1px solid rgba(170,130,255,0.16);
  border-radius: 12px;
}

.divisor-titulo {
  color: #bda4f5;
  font-size: 9px;
  letter-spacing: 2px;
}

.seletor-cor {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 5px 9px;
  box-sizing: border-box;
  background: rgba(27,21,55,0.9);
  border: 1px solid rgba(170,130,255,0.25);
  border-radius: 8px;
}

.seletor-cor-grande {
  height: 45px;
}

.amostra-cor {
  position: relative;
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 6px;
  overflow: hidden;
}

.amostra-cor input[type="color"] {
  color-scheme: dark;
  background: #000;
  accent-color: #a78bfa;
  position: absolute;
  inset: -8px;
  width: 45px;
  height: 45px;
  padding: 0;
  border: 0;
  opacity: 0;
  cursor: pointer;
}

.seletor-cor span {
  color: #e9ddff;
  font: 11px monospace;
  letter-spacing: 1px;
}

.opcao-check {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #d9d0eb;
  font-size: 11px;
  cursor: pointer;
}

.opcao-check input {
  accent-color: #a78bfa;
  width: 15px;
  height: 15px;
}

.label-range {
  display: flex;
  justify-content: space-between;
}

.label-range strong {
  color: #c4a5ff;
}

.range-input {
  width: 100%;
  accent-color: #a78bfa;
  cursor: pointer;
}

.temperatura-input {
  display: flex;
  align-items: center;
  gap: 9px;
}

.temperatura-input input {
  width: 110px;
  padding: 9px 10px;
  color: white;
  background: rgba(27,21,55,0.9);
  border: 1px solid rgba(170,130,255,0.25);
  border-radius: 8px;
  outline: none;
}

.temperatura-input span {
  color: #c4a5ff;
  font-size: 12px;
}

.ajuda {
  color: #83799d;
  font-size: 10px;
}

.btn-criar {
  padding: 13px;
  color: white;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border: 1px solid rgba(216,180,254,0.3);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.btn-criar:hover:not(:disabled) {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(139,92,246,0.3);
}

.btn-criar:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-voltar {
  padding: 8px 12px;
  color: #e9ddff;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,150,255,0.25);
  border-radius: 8px;
  font-size: 11px;
  cursor: pointer;
}

.btn-voltar:hover {
  background: rgba(130,70,220,0.3);
  border-color: #a78bfa;
}

.mensagem {
  margin: 0;
  font-size: 12px;
}

.erro { color: #f87171; }
.sucesso { color: #4ade80; }

.indicador-preview {
  position: absolute;
  z-index: 5;
  right: 5%;
  bottom: 30px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #b9a8df;
  font-size: 9px;
  letter-spacing: 2px;
}

.indicador-ponto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #55f5c0;
  box-shadow: 0 0 10px #55f5c0;
}

@media (max-width: 700px) {
  .criacao-container {
    min-height: 100vh;
    overflow-y: auto;
  }

  .editor-card {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    width: auto;
    max-height: none;
    margin: 90px 15px 30px;
    padding: 20px;
  }

  .indicador-preview {
    display: none;
  }
}
</style>
