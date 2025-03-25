const express = require('express');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const playerRoutes = require('./routes/playerRoutes');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/players', playerRoutes);


db.sequelize.authenticate()
  .then(() => console.log('Conectado ao banco de dados.'))
  .catch((err) => console.error('Erro na conexão:', err));

module.exports = app;