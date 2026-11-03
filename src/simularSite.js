async function testarCadastro() {
  console.log('Enviando dados para o servidor do ALTERRA...');
  
  const resposta = await fetch('http://localhost:3000/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Explorador',
      sobrenome: 'Espacial',
      email: 'explorador@galaxia.com',
      senha: 'minhasenha123'
    })
  });

  const dados = await resposta.json();
  console.log('Resposta do Servidor:', dados);
}

testarCadastro();