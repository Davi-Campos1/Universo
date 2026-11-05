
<script setup lang="ts">
import { getApiUrl } from '../services/api'
import FundoEspacialAuth from '../components/FundoEspacialAuth.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '../stores/usuario'

const router = useRouter()
const usuarioStore = useUsuarioStore()

const nome = ref('')
const sobrenome = ref('')
const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const handleCadastro = async () => {
  erro.value = ''
  carregando.value = true

  try {
    const resposta = await fetch(getApiUrl('/cadastro'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.value,
        sobrenome: sobrenome.value,
        email: email.value,
        senha: senha.value
      })
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao criar conta.')
    }

    usuarioStore.salvarSessao(dados.usuario)
    router.push('/dashboard')
  } catch (err: unknown) {
    erro.value = err instanceof Error
      ? err.message
      : 'Erro de conexão com o servidor.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <main class="auth-container">
    <FundoEspacialAuth />
    

    <div class="auth-card">
      <div class="logo-topo"><span>✦</span> ALTERRA</div>
      <h2>Registo de Comandante</h2>
      <p class="subtitulo">Inscreva-se para iniciar a sua exploração cósmica.</p>

      <form @submit.prevent="handleCadastro" class="auth-form">
        <div class="input-grupo">
          <label>Nome</label>
          <input v-model="nome" type="text" required placeholder="Ex: Élida" />
        </div>

        <div class="input-grupo">
          <label>Sobrenome</label>
          <input v-model="sobrenome" type="text" required placeholder="Ex: Terracao" />
        </div>

        <div class="input-grupo">
          <label>E-mail</label>
          <input v-model="email" type="email" required placeholder="comandante@alterra.com" />
        </div>

        <div class="input-grupo">
          <label>Palavra-passe</label>
          <input v-model="senha" type="password" required minlength="6" placeholder="••••••••" />
        </div>

        <p v-if="erro" class="mensagem-erro">{{ erro }}</p>

        <button type="submit" class="btn-submit" :disabled="carregando">
          {{ carregando ? 'Criando conta...' : 'Criar Conta Estelar' }}
        </button>
      </form>

      <p class="footer-auth">
        Já possui patente? <router-link to="/login">Entrar na Base</router-link>
      </p>
    </div>
  </main>
</template>

<style scoped>
.auth-container {
  color-scheme: dark;
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 30px 16px;
  background: #070513;
  overflow: hidden;
}

.cenario {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.nebulosa {
  position: absolute;
  width: 600px;
  height: 500px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.15;
}

.nebulosa-1 {
  top: 10%;
  left: 15%;
  background: #7035c9;
}

.nebulosa-2 {
  bottom: 10%;
  right: 15%;
  background: #244fba;
}

.auth-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  background: rgba(12, 9, 32, 0.85);
  border: 1px solid rgba(170, 130, 255, 0.25);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  backdrop-filter: blur(20px);
}

.logo-topo {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #fff;
  margin-bottom: 10px;
}

.logo-topo span {
  color: #b58aff;
}

.auth-card h2 {
  color: #fff;
  font-size: 22px;
  margin: 0 0 5px;
}

.subtitulo {
  color: #9689b2;
  font-size: 13px;
  margin: 0 0 25px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-grupo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.input-grupo label {
  color: #bcaedc;
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 600;
}

.input-grupo input {
  padding: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(170,130,255,0.2);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}

.input-grupo input:focus {
  border-color: #b58aff;
  box-shadow: 0 0 10px rgba(181,138,255,0.2);
}

.mensagem-erro {
  color: #f87171;
  font-size: 12px;
  text-align: center;
}

.btn-submit {
  margin-top: 10px;
  padding: 12px;
  background: linear-gradient(135deg,#8b5cf6,#6366f1);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-submit:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: wait;
}

.footer-auth {
  margin-top: 25px;
  text-align: center;
  color: #9689b2;
  font-size: 13px;
}

.footer-auth a {
  color: #b58aff;
  text-decoration: none;
  font-weight: 600;
}

.footer-auth a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 28px 22px;
  }
}
</style>
