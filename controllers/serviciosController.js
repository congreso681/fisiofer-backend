const { pool } = require('../config/database');

/**
 * GET /api/servicios
 * Devuelve todos los servicios activos.
 */
async function getAll(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, nombre, descripcion, duracion_min, precio
      FROM servicios
      WHERE activo = true
      ORDER BY id
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/servicios/:id
 * Devuelve un servicio por su ID.
 */
async function getById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT id, nombre, descripcion, duracion_min, precio
      FROM servicios
      WHERE id = $1 AND activo = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener servicio:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { getAll, getById };
