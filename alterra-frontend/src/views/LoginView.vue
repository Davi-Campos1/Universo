
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '../stores/usuario'

const router = useRouter()
const usuarioStore = useUsuarioStore()

const email = ref('')
const senha = ref('')
const mensagem = ref('')

async function fazerLogin() {
  try {
    const resposta = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        senha: senha.value
      })
    })

    const dados = await resposta.json()

    if (resposta.ok) {
      usuarioStore.salvarSessao(dados.usuario)

      router.push('/dashboard')
    } else {
      mensagem.value = '⚠️ ' + dados.erro
    }
  } catch (erro) {
    mensagem.value = '🔴 Erro ao ligar ao servidor.'
  }
}
</script>

<template>
  <div class="container-login">
    <div class="glass-panel">
      <h1>Iniciar Sessão</h1>
      <p>Bem-vindo de volta ao ALTERRA</p>

      <form @submit.prevent="fazerLogin">
        <input
          v-model="email"
          type="email"
          placeholder="E-mail"
          required
        />

        <input
          v-model="senha"
          type="password"
          placeholder="Senha"
          required
        />

        <button type="submit">Entrar</button>
      </form>

      <p v-if="mensagem" class="mensagem">
        {{ mensagem }}
      </p>

      <div class="links-rodape">
        <router-link to="/">
          Ainda não tem conta? Cadastre-se
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-login {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  z-index: 10;
}

.glass-panel {
  position: relative;

  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 20px;

  width: 100%;
  max-width: 380px;

  text-align: center;

  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);

  max-height: 90vh;
  overflow-y: auto;
}

h1 {
  color: #fff;
  margin-bottom: 5px;
  font-size: 1.5rem;
  font-weight: 600;
}

p {
  color: #b3b3b3;
  margin-bottom: 20px;
  font-size: 0.85em;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 12px;
  border-radius: 8px;
  color: white;
  outline: none;
  font-size: 0.95em;
  width: 100%;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

input:focus {
  border-color: #8b5cf6;
  background: rgba(255, 255, 255, 0.1);
}

button {
  background: linear-gradient(135deg, #6d28d9, #4c1d95);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 5px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(109, 40, 217, 0.5);
}

.mensagem {
  margin-top: 15px;
  color: #fff;
  font-size: 0.9em;
  font-weight: bold;
}

.links-rodape {
  margin-top: 20px;
}

.links-rodape a {
  color: #8b5cf6;
  text-decoration: none;
  font-size: 0.85em;
  transition: color 0.2s;
}

.links-rodape a:hover {
  color: #a78bfa;
  text-decoration: underline;
}
</style>
