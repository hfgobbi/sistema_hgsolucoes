const express = require("express");
const router = express.Router();
const fonteRendaController = require('../controllers/fonteRendaController');

// Rotas CRUD para Fontes de Renda
router.get('/', fonteRendaController.listarFontesRenda);
router.get('/:id', fonteRendaController.obterFonteRendaPorId);
router.post('/', fonteRendaController.criarFonteRenda);
router.put('/:id', fonteRendaController.atualizarFonteRenda);
router.delete('/:id', fonteRendaController.excluirFonteRenda);

module.exports = router;
