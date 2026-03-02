module.exports = (error, req, res, next) => {
  console.error('Erro capturado:', error);

  const status = error.statusCode || 500;

  res.status(status).json({
    error: error.message || 'Erro interno do servidor'
  });
};