const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initializeDatabase } = require('./models/init');
const turnosController = require('./controllers/turnosController');

// ─── Inicialización ───────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ──────────────────────────────────────────────────
app.use(cors());                           // Permitir requests desde cualquier origen
app.use(express.json());                   // Parsear body JSON
app.use(morgan('dev'));                    // Logging de requests en consola

// ─── Rutas ────────────────────────────────────────────────────────
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/profesionales', require('./routes/profesionales'));
app.use('/api/turnos', require('./routes/turnos'));

// Ruta de disponibilidad como alias de conveniencia
app.get('/api/disponibilidad', turnosController.getDisponibilidad);

// ─── Ruta raíz (info del API) ─────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    nombre: 'FisioCenter API',
    version: '1.0.0',
    descripcion: 'API REST para el sistema de turnos de FisioCenter',
    proyecto: 'Ingeniería de Requerimientos — Proyecto Académico',
    endpoints: {
      servicios: {
        'GET /api/servicios': 'Listar todos los servicios',
        'GET /api/servicios/:id': 'Obtener un servicio por ID'
      },
      profesionales: {
        'GET /api/profesionales': 'Listar todos los profesionales',
        'GET /api/profesionales/:id': 'Obtener un profesional (con horarios)'
      },
      turnos: {
        'GET /api/turnos': 'Listar turnos (filtros: ?fecha=&estado=&profesional_id=)',
        'GET /api/turnos/:id': 'Obtener un turno por ID',
        'POST /api/turnos': 'Crear un nuevo turno',
        'PATCH /api/turnos/:id': 'Actualizar estado de un turno',
        'DELETE /api/turnos/:id': 'Cancelar un turno'
      },
      disponibilidad: {
        'GET /api/disponibilidad': 'Consultar horarios disponibles (?fecha=&servicio_id=&profesional_id=)'
      }
    }
  });
});

// ─── 404 — Ruta no encontrada ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    ayuda: 'Visitá GET / para ver los endpoints disponibles'
  });
});

// ─── Error handler global ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Error no manejado:', err.message);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// ─── Iniciar servidor ─────────────────────────────────────────────
(async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║                                              ║');
      console.log('║   🏥  FisioCenter API — Servidor activo      ║');
      console.log(`║   🌐  http://localhost:${PORT}                  ║`);
      console.log('║   📋  Proyecto: Ingeniería de Requerimientos ║');
      console.log('║                                              ║');
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar servidor:', error.message);
    process.exit(1);
  }
})();
