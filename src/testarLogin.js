async function testarLogin() {
  console.log('A tentar iniciar sessão no ALTERRA...');
  
  const resposta = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'comandante@alterra.com', // Coloca o email exato que acabaste de criar
      senha: 'senha123'                // Coloca a senha exata que acabaste de criar
    })
  });

  const dados = await resposta.json();
  console.log('Resposta do Servidor:', dados);
}

testarLogin();