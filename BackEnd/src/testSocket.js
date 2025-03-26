const { io } = require('socket.io-client');

const player1Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZEpvZ2Fkb3IiOjgsImlhdCI6MTc0Mjk1MDg0NSwiZXhwIjoxNzQyOTU4MDQ1fQ.21OjA04_DsFlqEUPqRJJs7xeljst7MQmR4ixrG9iapU';

const player2Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZEpvZ2Fkb3IiOjksImlhdCI6MTc0Mjk1MDg4MCwiZXhwIjoxNzQyOTU4MDgwfQ.Q3fETNRhFuG8bzibUJejSbAS6uTQNQPFDMWIfkCQTdQ';

// Função para criar uma conexão autenticada
function conectarSocket(token) {
  return io('http://localhost:8080', {
    auth: { token },
    reconnection: false,
  });
}

// Conectar os dois jogadores
const jogador1 = conectarSocket(player1Token);
const jogador2 = conectarSocket(player2Token);

let idSala = null;

// ✅ Testar fluxo completo: criar sala, entrar, alternar jogadas e finalizar
jogador1.on('connect', () => {
  console.log('✅ Jogador 1 conectado.');
  criarSala();
});

jogador1.on('connect_error', (err) => {
  console.error('❌ Erro ao conectar Jogador 1:', err.message);
});

jogador2.on('connect', () => {
  console.log('✅ Jogador 2 conectado.');
});

jogador2.on('connect_error', (err) => {
  console.error('❌ Erro ao conectar Jogador 2:', err.message);
});

// ✅ Função para criar uma nova sala
function criarSala() {
  jogador1.emit('criarSala', { nicknameJogador: 'Player1' }, (res) => {
    if (res.sucesso) {
      idSala = res.idSala;
      console.log('🟢 Sala criada com sucesso:', idSala);
      entrarNaSala();
    } else {
      console.error('❌ Erro ao criar sala:', res.mensagem);
    }
  });
}

// ✅ Função para o Jogador 2 entrar na sala
function entrarNaSala() {
  jogador2.emit('entrarSala', { idSala, nicknameJogador: 'Player2' }, (res) => {
    if (res.sucesso) {
      console.log('🔵 Jogador 2 entrou na sala.');
      iniciarJogo();
    } else {
      console.error('❌ Erro ao entrar na sala:', res.mensagem);
    }
  });
}

// ✅ Função para alternar jogadas entre os jogadores
async function iniciarJogo() {
  const sequenciaJogadas = [
    { socket: jogador1, nicknameJogador: 'Player1', index: 0 },
    { socket: jogador2, nicknameJogador: 'Player2', index: 1 },
    { socket: jogador1, nicknameJogador: 'Player1', index: 4 },
    { socket: jogador2, nicknameJogador: 'Player2', index: 2 },
    { socket: jogador1, nicknameJogador: 'Player1', index: 8 },
  ];

  for (let jogada of sequenciaJogadas) {
    await delay(1000); // Esperar 1 segundo entre as jogadas
    fazerJogada(jogada.socket, jogada.nicknameJogador, jogada.index);
  }
}

// ✅ Função para realizar uma jogada
function fazerJogada(socket, nicknameJogador, index) {
  socket.emit('fazerJogada', { idSala, index, nicknameJogador }, (res) => {
    if (res?.sucesso) {
      console.log(`✅ Jogada realizada por ${nicknameJogador} no índice ${index}.`);
    } else {
      console.error(`❌ Erro ao fazer jogada por ${nicknameJogador} no índice ${index}:`, res?.mensagem);
    }
  });
}

// ✅ Ouvir atualizações do tabuleiro
[jogador1, jogador2].forEach((socket) => {
  socket.on('atualizarTabuleiro', (tabuleiro) => {
    console.log('📋 Tabuleiro atualizado:', tabuleiro);
  });

  // ✅ Verificar o fim do jogo
  socket.on('fimDeJogo', (res) => {
    console.log('🏁 Fim de jogo:', res);
    process.exit(0); // Encerra o script quando o jogo termina
  });
});

// ✅ Função auxiliar para aguardar um tempo
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
