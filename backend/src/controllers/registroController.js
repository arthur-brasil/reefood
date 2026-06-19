const RegistroModel = require('../models/Registro');
const AlimentoModel = require('../models/Alimento');

const RegistroController = {
  async criar(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      const { alimento_id, alimento_nome, alimento_categoria, tipo, preco_estimado } = req.body;

      if (!alimento_nome || !tipo) {
        return res.status(400).json({ sucesso: false, mensagem: 'nome e tipo são obrigatórios' });
      }
      if (!['consumido', 'descartado'].includes(tipo)) {
        return res.status(400).json({ sucesso: false, mensagem: 'tipo deve ser consumido ou descartado' });
      }

      const registro = await RegistroModel.criar({
        usuario_id, alimento_id, alimento_nome, alimento_categoria, tipo, preco_estimado,
      });

      // Remove o alimento do estoque após registrar
      if (alimento_id) {
        await AlimentoModel.excluir(alimento_id, usuario_id);
      }

      return res.status(201).json({ sucesso: true, dados: registro });
    } catch (err) {
      console.error('Erro ao criar registro:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async listar(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      const dias = parseInt(req.query.dias) || 30;
      const registros = await RegistroModel.listarPorUsuario(usuario_id, { dias });
      return res.status(200).json({ sucesso: true, dados: registros });
    } catch (err) {
      console.error('Erro ao listar registros:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async resumo(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      const dias = parseInt(req.query.dias) || 30;
      const dados = await RegistroModel.resumoPorPeriodo(usuario_id, dias);
      return res.status(200).json({ sucesso: true, dados });
    } catch (err) {
      console.error('Erro ao buscar resumo:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },
};

module.exports = RegistroController;
