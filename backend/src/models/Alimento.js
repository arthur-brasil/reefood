const pool = require('../config/database');

const AlimentoModel = {
  async criar({ nome, categoria, quantidade, unidade, data_validade }) {
    const { rows } = await pool.query(
      `INSERT INTO alimentos (nome, categoria, quantidade, unidade, data_validade)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, categoria, quantidade, unidade, data_validade]
    );
    return rows[0];
  },

  async listarTodos({ categoria } = {}) {
    let query = `SELECT * FROM alimentos`;
    const params = [];
    if (categoria) {
      params.push(categoria);
      query += ` WHERE categoria = $1`;
    }
    query += ` ORDER BY data_validade ASC`;
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(
      `SELECT * FROM alimentos WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },
  async atualizar(id, { nome, categoria, quantidade, unidade, data_validade }) {
  const { rows } = await pool.query(
    `UPDATE alimentos SET nome=$2, categoria=$3, quantidade=$4, unidade=$5, data_validade=$6
     WHERE id=$1 RETURNING *`,
    [id, nome, categoria, quantidade, unidade, data_validade]
  );
  return rows[0];
},

async excluir(id) {
  await pool.query(`DELETE FROM alimentos WHERE id=$1`, [id]);
},
};
module.exports = AlimentoModel;
