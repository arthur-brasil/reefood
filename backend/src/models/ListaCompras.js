const pool = require('../config/database');

const ListaComprasModel = {
  async criar({ usuario_id, nome, quantidade, unidade }) {
    const { rows } = await pool.query(
      `INSERT INTO lista_compras (usuario_id, nome, quantidade, unidade)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuario_id, nome, quantidade || null, unidade || null]
    );
    return rows[0];
  },

  async listarPorUsuario(usuario_id) {
    const { rows } = await pool.query(
      `SELECT * FROM lista_compras WHERE usuario_id = $1 ORDER BY comprado ASC, criado_em DESC`,
      [usuario_id]
    );
    return rows;
  },

  async toggleComprado(id, usuario_id) {
    const { rows } = await pool.query(
      `UPDATE lista_compras SET comprado = NOT comprado
       WHERE id = $1 AND usuario_id = $2 RETURNING *`,
      [id, usuario_id]
    );
    return rows[0];
  },

  async excluir(id, usuario_id) {
    await pool.query(
      `DELETE FROM lista_compras WHERE id = $1 AND usuario_id = $2`,
      [id, usuario_id]
    );
  },

  async limparComprados(usuario_id) {
    await pool.query(
      `DELETE FROM lista_compras WHERE usuario_id = $1 AND comprado = TRUE`,
      [usuario_id]
    );
  },
};

module.exports = ListaComprasModel;
