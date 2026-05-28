const { body } = require('express-validator');

const CATEGORIAS = ['Frutas', 'Legumes', 'Carnes', 'Laticínios', 'Grãos', 'Bebidas', 'Congelados', 'Outros'];
const UNIDADES   = ['kg', 'g', 'L', 'ml', 'un', 'cx', 'pct'];

const validarAlimento = [
  body('nome')
    .trim().notEmpty().withMessage('O nome é obrigatório')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('categoria')
    .trim().notEmpty().withMessage('A categoria é obrigatória')
    .isIn(CATEGORIAS).withMessage('Categoria inválida'),

  body('quantidade')
    .notEmpty().withMessage('A quantidade é obrigatória')
    .isFloat({ gt: 0 }).withMessage('Deve ser maior que zero'),

  body('unidade')
    .trim().notEmpty().withMessage('A unidade é obrigatória')
    .isIn(UNIDADES).withMessage('Unidade inválida'),

  body('data_validade')
    .notEmpty().withMessage('A data de validade é obrigatória')
    .isISO8601().withMessage('Use o formato YYYY-MM-DD')
    .custom((valor) => {
      if (new Date(valor) < new Date()) throw new Error('Data não pode ser no passado');
      return true;
    }),
];

module.exports = { validarAlimento };