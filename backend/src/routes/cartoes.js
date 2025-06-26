const express = require("express");
const router = express.Router();
const cartaoController = require('../controllers/cartaoController');

// Rotas CRUD para Cartões
router.get('/', cartaoController.listarCartoes);
router.get('/:id', cartaoController.obterCartaoPorId);
router.post('/', cartaoController.criarCartao);
router.put('/:id', cartaoController.atualizarCartao);
router.delete('/:id', cartaoController.excluirCartao);

module.exports = router;
