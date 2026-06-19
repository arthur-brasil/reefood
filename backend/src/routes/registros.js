const express = require('express');
const router = express.Router();
const RegistroController = require('../controllers/registroController');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

router.post('/',        RegistroController.criar);
router.get('/',         RegistroController.listar);
router.get('/resumo',   RegistroController.resumo);

module.exports = router;
