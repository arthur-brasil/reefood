const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const { body } = require('express-validator');
const autenticar = require('../middleware/autenticar');

const validarUsuario = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('quantidade_pessoas').isInt({ min: 1 }).withMessage('Quantidade inválida'),
  body('tipo_residencia').notEmpty().withMessage('Tipo de residência é obrigatório'),
  body('dias_antecedencia').isInt({ min: 1, max: 7 }).withMessage('Dias inválido'),
];

// POST não exige auth (chamado logo após criar conta no Firebase)
router.post('/', validarUsuario, UsuarioController.criar);

// GET e PATCH exigem auth
router.get('/:id',   autenticar, UsuarioController.buscar);
router.patch('/:id', autenticar, UsuarioController.atualizar);

module.exports = router;
