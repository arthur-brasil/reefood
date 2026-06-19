const pool = require('../config/database');

const RegistroModel = {
  async criar({ usuario_id, alimento_id, alimento_nome, alimento_categoria, tipo, preco_estimado }) {
    const { rows } = await pool.query(
      `INSERT INTO registros (usuario_id, alimento_id, alimento_nome, alimento_categoria, tipo, preco_estimado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [usuario_id, alimento_id || null, alimento_nome, alimento_categoria, tipo, preco_estimado || 0]
    );
    return rows[0];
  },

  async listarPorUsuario(usuario_id, { dias } = {}) {
    const params = [usuario_id];
    let filtroData = '';
    if (dias) {
      params.push(dias);
      filtroData = `AND criado_em >= NOW() - INTERVAL '1 day' * $2`;
    }
    const { rows } = await pool.query(
      `SELECT * FROM registros WHERE usuario_id = $1 ${filtroData} ORDER BY criado_em DESC`,
      params
    );
    return rows;
  },

  async resumoPorPeriodo(usuario_id, dias) {
    const { rows } = await pool.query(
      `SELECT
         tipo,
         COUNT(*)                             AS total,
         SUM(preco_estimado)                  AS valor_total,
         alimento_categoria
       FROM registros
       WHERE usuario_id = $1
         AND criado_em >= NOW() - INTERVAL '1 day' * $2
       GROUP BY tipo, alimento_categoria`,
      [usuario_id, dias]
    );
    return rows;
  },
};

module.exports = RegistroModel;
