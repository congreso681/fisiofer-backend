const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');

// GET /api/servicios — Listar todos los servicios activos
router.get('/', serviciosController.getAll);

// GET /api/servicios/:id — Obtener un servicio por ID
router.get('/:id', serviciosController.getById);

module.exports = router;
