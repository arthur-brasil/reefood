const express = require('express');
const router = express.Router();
const ListaComprasController = require('../controllers/listaComprasController');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

router.get('/',                         ListaComprasController.listar);
router.post('/',                        ListaComprasController.criar);
router.patch('/:id/toggle',             ListaComprasController.toggle);
router.delete('/comprados',             ListaComprasController.limparComprados);
router.delete('/:id',                   ListaComprasController.excluir);

module.exports = router;
