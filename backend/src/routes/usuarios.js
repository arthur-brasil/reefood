const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const { body } = require('express-validator');

const validarUsuario = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('quantidade_pessoas').isInt({ min: 1 }).withMessage('Quantidade inválida'),
  body('tipo_residencia').notEmpty().withMessage('Tipo de residência é obrigatório'),
  body('dias_antecedencia').isInt({ min: 1, max: 7 }).withMessage('Dias inválido'),
];

router.post('/', validarUsuario, UsuarioController.criar);
router.get('/:id', UsuarioController.buscar);
router.patch('/:id', UsuarioController.atualizar);

module.exports = router;