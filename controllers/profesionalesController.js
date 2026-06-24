const { pool } = require('../config/database');

/**
 * GET /api/profesionales
 * Devuelve todos los profesionales activos.
 */
async function getAll(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, nombre, especialidad, email
      FROM profesionales
      WHERE activo = true
      ORDER BY id
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener profesionales:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/profesionales/:id
 * Devuelve un profesional por su ID con sus horarios disponibles.
 */
async function getById(req, res) {
  try {
    const { id } = req.params;

    const profesionalResult = await pool.query(`
      SELECT id, nombre, especialidad, email
      FROM profesionales
      WHERE id = $1 AND activo = true
    `, [id]);

    if (profesionalResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profesional no encontrado' });
    }

    const profesional = profesionalResult.rows[0];

    // Incluir horarios disponibles del profesional
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horariosResult = await pool.query(`
      SELECT dia_semana, hora_inicio, hora_fin
      FROM horarios_disponibles
      WHERE profesional_id = $1
      ORDER BY dia_semana
    `, [id]);

    profesional.horarios = horariosResult.rows.map(h => ({
      dia: diasSemana[h.dia_semana],
      dia_numero: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin
    }));

    res.json({ success: true, data: profesional });
  } catch (error) {
    console.error('Error al obtener profesional:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { getAll, getById };
