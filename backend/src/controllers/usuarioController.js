const UsuarioModel = require('../models/Usuario');
const { validationResult } = require('express-validator');

const UsuarioController = {
  async criar(req, res) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ sucesso: false, erros: erros.array() });
    try {
      const usuario = await UsuarioModel.criar(req.body);
      return res.status(201).json({ sucesso: true, dados: usuario });
    } catch (err) {
      console.error('Erro ao criar usuário:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async buscar(req, res) {
    try {
      const usuario = await UsuarioModel.buscarPorId(req.params.id);
      if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
      return res.status(200).json({ sucesso: true, dados: usuario });
    } catch (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async atualizar(req, res) {
    try {
      const usuario = await UsuarioModel.atualizar(req.params.id, req.body);
      return res.status(200).json({ sucesso: true, dados: usuario });
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },
};

module.exports = UsuarioController;