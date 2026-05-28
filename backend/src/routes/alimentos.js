const express = require('express');
const router = express.Router();
const AlimentoController = require('../controllers/alimentoController');
const { validarAlimento } = require('../middleware/validarAlimento');

router.post('/', validarAlimento, AlimentoController.criar);
router.get('/', AlimentoController.listar);

router.put('/:id', AlimentoController.atualizar);
router.delete('/:id', AlimentoController.excluir);
module.exports = router;