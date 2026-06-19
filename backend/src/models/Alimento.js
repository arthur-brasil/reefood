const pool = require('../config/database');

const AlimentoModel = {
  async criar({ usuario_id, nome, categoria, quantidade, unidade, data_validade, dias_antecedencia }) {
    const { rows } = await pool.query(
      `INSERT INTO alimentos (usuario_id, nome, categoria, quantidade, unidade, data_validade, dias_antecedencia)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [usuario_id, nome, categoria, quantidade, unidade, data_validade, dias_antecedencia || 3]
    );
    return rows[0];
  },

  async listarPorUsuario(usuario_id, { categoria } = {}) {
    const params = [usuario_id];
    let filtro = '';
    if (categoria) {
      params.push(categoria);
      filtro = `AND categoria = $2`;
    }
    const { rows } = await pool.query(
      `SELECT * FROM alimentos WHERE usuario_id = $1 ${filtro} ORDER BY data_validade ASC`,
      params
    );
    return rows;
  },

  async buscarPorId(id, usuario_id) {
    const { rows } = await pool.query(
      `SELECT * FROM alimentos WHERE id = $1 AND usuario_id = $2`,
      [id, usuario_id]
    );
    return rows[0] || null;
  },

  async atualizar(id, usuario_id, { nome, categoria, quantidade, unidade, data_validade, dias_antecedencia }) {
    const { rows } = await pool.query(
      `UPDATE alimentos
       SET nome=$3, categoria=$4, quantidade=$5, unidade=$6, data_validade=$7, dias_antecedencia=$8
       WHERE id=$1 AND usuario_id=$2 RETURNING *`,
      [id, usuario_id, nome, categoria, quantidade, unidade, data_validade, dias_antecedencia]
    );
    return rows[0];
  },

  async excluir(id, usuario_id) {
    await pool.query(`DELETE FROM alimentos WHERE id=$1 AND usuario_id=$2`, [id, usuario_id]);
  },

  async proximosVencimento(usuario_id, dias) {
    const { rows } = await pool.query(
      `SELECT * FROM alimentos
       WHERE usuario_id = $1
         AND data_validade <= CURRENT_DATE + ($2 || ' days')::INTERVAL
         AND data_validade >= CURRENT_DATE
       ORDER BY data_validade ASC`,
      [usuario_id, dias]
    );
    return rows;
  },
};

module.exports = AlimentoModel;
