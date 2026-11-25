// middleware/apiKey.js
const pool = require('../db'); // use o mesmo require que o seu middleware de JWT usa

async function apiKeyAuth(req, res, next) {
  // 1. ler a chave do header
  const apiKey = req.headers['x-api-key'];

  // 2. sem chave -> barrar
  if (!apiKey) {
    return res.status(401).json({ error: 'Chave de API não fornecida' });
  }

  try {
    // 3. procurar o projeto dono da chave (query parametrizada!)
    const result = await pool.query(
      'SELECT id FROM projects WHERE api_key = $1',
      [apiKey]
    );

    // 4. nenhum projeto com essa chave -> barrar
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Chave de API inválida' });
    }

    // 5. guardar o id do projeto para a rota usar
    req.projectId = result.rows[0].id;
    next();
  } catch (err) {
        console.error('Erro interno:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = apiKeyAuth;