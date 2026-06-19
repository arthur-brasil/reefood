const AlimentoModel = require('../models/Alimento');
const { validationResult } = require('express-validator');

const AlimentoController = {
  async criar(req, res) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ sucesso: false, erros: erros.array() });
    try {
      const usuario_id = req.usuario.uid;
      const alimento = await AlimentoModel.criar({ ...req.body, usuario_id });
      return res.status(201).json({ sucesso: true, dados: alimento });
    } catch (err) {
      console.error('Erro ao criar alimento:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async listar(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      const { categoria } = req.query;
      const alimentos = await AlimentoModel.listarPorUsuario(usuario_id, { categoria });
      return res.status(200).json({ sucesso: true, dados: alimentos });
    } catch (err) {
      console.error('Erro ao listar:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async atualizar(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      const alimento = await AlimentoModel.atualizar(req.params.id, usuario_id, req.body);
      if (!alimento) return res.status(404).json({ sucesso: false, mensagem: 'Alimento não encontrado' });
      return res.status(200).json({ sucesso: true, dados: alimento });
    } catch (err) {
      console.error('Erro ao atualizar:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async excluir(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      await AlimentoModel.excluir(req.params.id, usuario_id);
      return res.status(200).json({ sucesso: true, mensagem: 'Alimento removido' });
    } catch (err) {
      console.error('Erro ao excluir:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },
};

module.exports = AlimentoController;
