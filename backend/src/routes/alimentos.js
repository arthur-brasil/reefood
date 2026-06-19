const express = require('express');
const router = express.Router();
const AlimentoController = require('../controllers/alimentoController');
const { validarAlimento } = require('../middleware/validarAlimento');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

router.post('/',    validarAlimento, AlimentoController.criar);
router.get('/',     AlimentoController.listar);
router.put('/:id',  AlimentoController.atualizar);
router.delete('/:id', AlimentoController.excluir);

module.exports = router;
