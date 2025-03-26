const express = require('express');
const cors = require('cors');
const app = express();

// Configuração do middleware CORS
app.use(cors({ origin: 'http://localhost:5173' })); // Permite requisições do frontend
app.use(express.json());

// ...existing code...

// Exemplo de rota
app.post('/auth/login', (req, res) => {
  // ...existing code...
});

// ...existing code...

app.listen(8080, () => {
  console.log('Servidor rodando na porta 8080');
});
