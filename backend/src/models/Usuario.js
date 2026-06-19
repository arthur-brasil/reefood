const pool = require('../config/database');

const UsuarioModel = {
  async criar({ id, nome, email, quantidade_pessoas, tipo_residencia, restricoes, dias_antecedencia }) {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (id, nome, email, quantidade_pessoas, tipo_residencia, restricoes, dias_antecedencia)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, nome, email, quantidade_pessoas, tipo_residencia, restricoes, dias_antecedencia || 3]
    );
    return rows[0];
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(`SELECT * FROM usuarios WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async atualizar(id, { nome, dias_antecedencia, alertas_ativados, notificacoes_ativadas, expo_push_token }) {
    const { rows } = await pool.query(
      `UPDATE usuarios SET
        nome                 = COALESCE($2,  nome),
        dias_antecedencia    = COALESCE($3,  dias_antecedencia),
        alertas_ativados     = COALESCE($4,  alertas_ativados),
        notificacoes_ativadas= COALESCE($5,  notificacoes_ativadas),
        expo_push_token      = COALESCE($6,  expo_push_token)
       WHERE id = $1 RETURNING *`,
      [id, nome, dias_antecedencia, alertas_ativados, notificacoes_ativadas, expo_push_token]
    );
    return rows[0];
  },

  async listarComNotificacao() {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios
       WHERE alertas_ativados = TRUE
         AND notificacoes_ativadas = TRUE
         AND expo_push_token IS NOT NULL`
    );
    return rows;
  },
};

module.exports = UsuarioModel;
