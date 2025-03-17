import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Listar todos os jogadores
export const listarJogadores = async () => {
  try {
    const response = await api.get('/users');
    return response.data.users;
  } catch (error) {
    console.error('Erro ao listar jogadores:', error);
    throw error;
  }
};

// Buscar um jogador específico por ID
export const buscarJogador = async (idJogador) => {
  try {
    const response = await api.get(`/users/${idJogador}`);
    return response.data.user;
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    throw error;
  }
};

// Cadastrar novo jogador
export const cadastrarJogador = async (dadosJogador) => {
  try {
    const response = await api.post('/signup', dadosJogador);
    return response.data;
  } catch (error) {
    console.error('Erro ao cadastrar jogador:', error);
    throw error;
  }
};

// Realizar login
export const realizarLogin = async (emailJogador, passwordJogador) => {
  try {
    const response = await api.post('/login', { emailJogador, passwordJogador });
    return response.data.jogador;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// Atualizar XP do jogador
export const atualizarXP = async (idJogador, novoXP) => {
  try {
    const response = await api.put('/login', { idJogador, pontuacaoJogadorXP: novoXP });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar XP:', error);
    throw error;
  }
};

export default api;