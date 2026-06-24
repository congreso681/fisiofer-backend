const express = require('express');
const router = express.Router();
const profesionalesController = require('../controllers/profesionalesController');

// GET /api/profesionales — Listar todos los profesionales activos
router.get('/', profesionalesController.getAll);

// GET /api/profesionales/:id — Obtener un profesional por ID (con horarios)
router.get('/:id', profesionalesController.getById);

module.exports = router;
