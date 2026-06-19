const ListaComprasModel = require('../models/ListaCompras');

const ListaComprasController = {
  async listar(req, res) {
    try {
      const itens = await ListaComprasModel.listarPorUsuario(req.usuario.uid);
      return res.status(200).json({ sucesso: true, dados: itens });
    } catch (err) {
      console.error('Erro ao listar lista:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async criar(req, res) {
    try {
      const { nome, quantidade, unidade } = req.body;
      if (!nome?.trim()) {
        return res.status(400).json({ sucesso: false, mensagem: 'Nome é obrigatório' });
      }
      const item = await ListaComprasModel.criar({
        usuario_id: req.usuario.uid, nome, quantidade, unidade,
      });
      return res.status(201).json({ sucesso: true, dados: item });
    } catch (err) {
      console.error('Erro ao criar item:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async toggle(req, res) {
    try {
      const item = await ListaComprasModel.toggleComprado(req.params.id, req.usuario.uid);
      if (!item) return res.status(404).json({ sucesso: false, mensagem: 'Item não encontrado' });
      return res.status(200).json({ sucesso: true, dados: item });
    } catch (err) {
      console.error('Erro ao toggle:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async excluir(req, res) {
    try {
      await ListaComprasModel.excluir(req.params.id, req.usuario.uid);
      return res.status(200).json({ sucesso: true, mensagem: 'Item removido' });
    } catch (err) {
      console.error('Erro ao excluir item:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },

  async limparComprados(req, res) {
    try {
      await ListaComprasModel.limparComprados(req.usuario.uid);
      return res.status(200).json({ sucesso: true, mensagem: 'Itens comprados removidos' });
    } catch (err) {
      console.error('Erro ao limpar:', err.message);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
  },
};

module.exports = ListaComprasController;
