# Jogo da Velha na Nuvem ☁️❌⭕

Projeto completo de um jogo da velha multiplayer em tempo real com backend na nuvem e frontend responsivo, utilizando tecnologias modernas e integração com WebSocket, Redis e PostgreSQL.

## 🔧 Tecnologias Utilizadas

### Backend:
- **Node.js** + **Express**
- **WebSocket** com `socket.io`
- **Redis** (armazenamento de estado das salas em tempo real)
- **PostgreSQL** (persistência de jogadores e histórico de partidas)
- **Sequelize** (ORM)
- **JWT** para autenticação
- **Hospedagem:** Railway

### Frontend:
- **React** com **Vite**
- **React Router DOM**
- **Context API** para gestão global do estado
- **CSS Modules** com estilo retrô/pixel art
- **Hospedagem:** Vercel

## 🚀 Funcionalidades

- Login/cadastro de jogadores
- Criação de salas multiplayer com WebSocket
- Atualização em tempo real de jogadas
- Placar acumulado por sala
- Reinício de partida com placar salvo
- Histórico salvo no PostgreSQL (vencedor, tabuleiro final, etc)
- Botão de sair da sala
- Indicador de vez de jogador
- Painel lateral informativo estilizado

## 📦 Estrutura do Projeto

```
├── backend
│   ├── models
│   ├── migrations
│   ├── sockets
│   └── index.js
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── contexts
│   │   ├── pages (Login, CreateRoom, JogoVelha)
│   │   └── style (CSS Modules)
```

## 🖼️ Captura de Tela
![tela](./src/assets/demo.png)

## 📝 Como Rodar Localmente

### Backend:
```bash
cd backend
npm install
npm run dev
```

Crie um arquivo `.env` com:
```
JWT_SECRET=sua_chave
DATABASE_URL=postgres://...
REDIS_URL=redis://...
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

Configure a URL do backend no `GameContext.jsx`:
```js
const URL_BACKEND = "http://localhost:8080"; // ou Railway
```

## ✨ Créditos e Reconhecimento
Esse projeto foi desenvolvido com muito carinho e com ajuda da IA 💻✨


Divirta-se jogando! 🎮

