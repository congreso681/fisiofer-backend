const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController');

// GET /api/turnos — Listar turnos (filtros opcionales: ?fecha=&estado=&profesional_id=)
router.get('/', turnosController.getAll);

// GET /api/disponibilidad — Consultar horarios disponibles (?fecha=&servicio_id=&profesional_id=)
router.get('/disponibilidad', turnosController.getDisponibilidad);

// GET /api/turnos/:id — Obtener un turno por ID
router.get('/:id', turnosController.getById);

// POST /api/turnos — Crear un nuevo turno
router.post('/', turnosController.create);

// PATCH /api/turnos/:id — Actualizar estado de un turno
router.patch('/:id', turnosController.updateEstado);

// DELETE /api/turnos/:id — Cancelar un turno
router.delete('/:id', turnosController.cancel);

module.exports = router;
