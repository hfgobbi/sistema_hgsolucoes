const express = require("express");
const router = express.Router();
const lancamentoController = require('../controllers/lancamentoController');

// Rotas CRUD para Lançamentos
router.get('/', lancamentoController.listarLancamentos);
router.get('/:id', lancamentoController.obterLancamentoPorId);
router.post('/', lancamentoController.criarLancamento);
router.put('/:id', lancamentoController.atualizarLancamento);
router.delete('/:id', lancamentoController.excluirLancamento);

// Rotas de relatórios e resumos
router.get('/resumo/categorias', lancamentoController.obterResumoCategorias);
router.get('/extrato/diario', lancamentoController.obterExtratoDiario);
router.get('/balancete', lancamentoController.obterBalancete);
router.post('/lote', lancamentoController.criarLancamentosEmLote);

module.exports = router;
