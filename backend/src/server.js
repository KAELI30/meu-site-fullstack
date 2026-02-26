const app = require("./app");
const { port } = require("./config/env");
const pool = require('./config/database');

const PORT = 3000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

pool.connect()
  .then(() => {
    console.log('Banco conectado com sucesso');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar no banco', err);
  });