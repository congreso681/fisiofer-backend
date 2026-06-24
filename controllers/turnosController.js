const { pool } = require('../config/database');

// ─── Helpers ──────────────────────────────────────────────────────

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString + 'T12:00:00');
  return !isNaN(date.getTime());
}

function isValidTime(timeString) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeString);
}

// ─── Controllers ──────────────────────────────────────────────────

/**
 * GET /api/turnos
 */
async function getAll(req, res) {
  try {
    const { fecha, estado, profesional_id } = req.query;

    let query = `
      SELECT t.id, t.paciente_nombre, t.paciente_telefono, t.paciente_email,
             t.fecha, t.hora, t.estado, t.notas, t.created_at,
             s.nombre AS servicio_nombre, s.duracion_min,
             p.nombre AS profesional_nombre
      FROM turnos t
      JOIN servicios s ON t.servicio_id = s.id
      JOIN profesionales p ON t.profesional_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += ' AND t.fecha = $' + (params.length + 1);
      params.push(fecha);
    }
    if (estado) {
      query += ' AND t.estado = $' + (params.length + 1);
      params.push(estado);
    }
    if (profesional_id) {
      query += ' AND t.profesional_id = $' + (params.length + 1);
      params.push(profesional_id);
    }

    query += ' ORDER BY t.fecha ASC, t.hora ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener turnos:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/turnos/:id
 */
async function getById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT t.id, t.paciente_nombre, t.paciente_telefono, t.paciente_email,
             t.fecha, t.hora, t.estado, t.notas, t.created_at,
             s.id AS servicio_id, s.nombre AS servicio_nombre, s.duracion_min, s.precio,
             p.id AS profesional_id, p.nombre AS profesional_nombre, p.especialidad
      FROM turnos t
      JOIN servicios s ON t.servicio_id = s.id
      JOIN profesionales p ON t.profesional_id = p.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Turno no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener turno:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * POST /api/turnos
 */
async function create(req, res) {
  try {
    const { paciente_nombre, paciente_telefono, paciente_email, servicio_id, profesional_id, fecha, hora, notas } = req.body;

    // ── Validaciones ──
    const errores = [];

    if (!paciente_nombre || paciente_nombre.trim().length < 2) {
      errores.push('El nombre del paciente es obligatorio (mínimo 2 caracteres)');
    }
    if (!paciente_telefono || paciente_telefono.trim().length < 6) {
      errores.push('El teléfono del paciente es obligatorio (mínimo 6 caracteres)');
    }
    if (!servicio_id) {
      errores.push('El servicio es obligatorio');
    }
    if (!profesional_id) {
      errores.push('El profesional es obligatorio');
    }
    if (!fecha || !isValidDate(fecha)) {
      errores.push('La fecha es obligatoria y debe tener formato YYYY-MM-DD');
    }
    if (!hora || !isValidTime(hora)) {
      errores.push('La hora es obligatoria y debe tener formato HH:MM');
    }

    if (errores.length > 0) {
      return res.status(400).json({ success: false, errores });
    }

    // Verificar que el servicio existe
    const servicioResult = await pool.query(
      'SELECT id, duracion_min FROM servicios WHERE id = $1 AND activo = true',
      [servicio_id]
    );
    if (servicioResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'El servicio seleccionado no existe o no está activo' });
    }
    const servicio = servicioResult.rows[0];

    // Verificar que el profesional existe
    const profResult = await pool.query(
      'SELECT id FROM profesionales WHERE id = $1 AND activo = true',
      [profesional_id]
    );
    if (profResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'El profesional seleccionado no existe o no está activo' });
    }

    // Verificar que la fecha no es pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaTurno = new Date(fecha + 'T12:00:00');
    if (fechaTurno < hoy) {
      return res.status(400).json({ success: false, error: 'No se pueden agendar turnos en fechas pasadas' });
    }

    // ── Insertar turno ──
    const result = await pool.query(`
      INSERT INTO turnos (paciente_nombre, paciente_telefono, paciente_email, servicio_id, profesional_id, fecha, hora, estado, notas)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmado', $8)
      RETURNING id
    `, [
      paciente_nombre.trim(),
      paciente_telefono.trim(),
      paciente_email ? paciente_email.trim() : null,
      servicio_id,
      profesional_id,
      fecha,
      hora,
      notas || null
    ]);

    const turnoId = result.rows[0].id;

    // Obtener el turno recién creado
    const turnoCreadoResult = await pool.query(`
      SELECT t.id, t.paciente_nombre, t.paciente_telefono, t.paciente_email,
             t.fecha, t.hora, t.estado, t.notas, t.created_at,
             s.nombre AS servicio_nombre, s.duracion_min, s.precio,
             p.nombre AS profesional_nombre
      FROM turnos t
      JOIN servicios s ON t.servicio_id = s.id
      JOIN profesionales p ON t.profesional_id = p.id
      WHERE t.id = $1
    `, [turnoId]);

    console.log(`📅 Nuevo turno #${turnoId}: ${paciente_nombre} - ${fecha} ${hora}`);

    res.status(201).json({
      success: true,
      message: '✅ Turno confirmado exitosamente',
      data: turnoCreadoResult.rows[0]
    });
  } catch (error) {
    console.error('Error al crear turno:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * PATCH /api/turnos/:id
 */
async function updateEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'confirmado', 'cancelado', 'completado'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido. Valores aceptados: ${estadosValidos.join(', ')}`
      });
    }

    const turnoResult = await pool.query('SELECT id FROM turnos WHERE id = $1', [id]);
    if (turnoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Turno no encontrado' });
    }

    await pool.query('UPDATE turnos SET estado = $1 WHERE id = $2', [estado, id]);

    const turnoActualizadoResult = await pool.query(`
      SELECT t.id, t.paciente_nombre, t.fecha, t.hora, t.estado,
             s.nombre AS servicio_nombre,
             p.nombre AS profesional_nombre
      FROM turnos t
      JOIN servicios s ON t.servicio_id = s.id
      JOIN profesionales p ON t.profesional_id = p.id
      WHERE t.id = $1
    `, [id]);

    console.log(`🔄 Turno #${id} actualizado a: ${estado}`);

    res.json({
      success: true,
      message: `Turno actualizado a "${estado}"`,
      data: turnoActualizadoResult.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar turno:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * DELETE /api/turnos/:id
 */
async function cancel(req, res) {
  try {
    const { id } = req.params;

    const turnoResult = await pool.query('SELECT id, estado FROM turnos WHERE id = $1', [id]);
    if (turnoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Turno no encontrado' });
    }

    if (turnoResult.rows[0].estado === 'cancelado') {
      return res.status(400).json({ success: false, error: 'El turno ya está cancelado' });
    }

    await pool.query("UPDATE turnos SET estado = 'cancelado' WHERE id = $1", [id]);

    console.log(`❌ Turno #${id} cancelado.`);

    res.json({
      success: true,
      message: 'Turno cancelado exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar turno:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/disponibilidad
 */
async function getDisponibilidad(req, res) {
  try {
    const { fecha, servicio_id, profesional_id } = req.query;

    if (!fecha || !isValidDate(fecha)) {
      return res.status(400).json({ success: false, error: 'Parámetro "fecha" obligatorio con formato YYYY-MM-DD' });
    }

    if (!servicio_id) {
      return res.status(400).json({ success: false, error: 'Parámetro "servicio_id" obligatorio' });
    }

    const servicioResult = await pool.query(
      'SELECT id, nombre, duracion_min FROM servicios WHERE id = $1 AND activo = true',
      [servicio_id]
    );
    if (servicioResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }
    const servicio = servicioResult.rows[0];

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dateObj = new Date(fecha + 'T12:00:00');
    const diaNombre = diasSemana[dateObj.getDay()];

    // Obtener horarios disponibles
    const horariosResult = await pool.query(`
      SELECT h.profesional_id, p.nombre as profesional_nombre, h.hora_inicio, h.hora_fin
      FROM horarios_disponibles h
      JOIN profesionales p ON h.profesional_id = p.id
      WHERE h.dia_semana = $1 AND p.activo = true
      ORDER BY h.profesional_id
    `, [dateObj.getDay()]);

    if (horariosResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          fecha,
          dia: diaNombre,
          servicio: servicio.nombre,
          duracion_min: servicio.duracion_min,
          profesionales: [],
          total_profesionales_disponibles: 0
        }
      });
    }

    // Generar slots para cada profesional
    const profesionalesDisponibles = [];
    for (const horario of horariosResult.rows) {
      // Obtener turnos ocupados
      const turnosResult = await pool.query(`
        SELECT t.hora
        FROM turnos t
        WHERE t.profesional_id = $1 AND t.fecha = $2 AND t.estado IN ('pendiente', 'confirmado')
      `, [horario.profesional_id, fecha]);

      const turnosOcupados = turnosResult.rows.map(t => t.hora);

      // Generar slots cada 30 minutos
      const slots = [];
      const [inicioH, inicioM] = horario.hora_inicio.split(':').map(Number);
      const [finH, finM] = horario.hora_fin.split(':').map(Number);

      let currentMinutes = inicioH * 60 + inicioM;
      const endMinutes = finH * 60 + finM;

      while (currentMinutes + servicio.duracion_min <= endMinutes) {
        const slotHora = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;

        // Verificar si el slot está ocupado
        const ocupado = turnosOcupados.includes(slotHora);

        if (!ocupado) {
          slots.push(slotHora);
        }

        currentMinutes += 30;
      }

      if (slots.length > 0) {
        profesionalesDisponibles.push({
          profesional_id: horario.profesional_id,
          profesional_nombre: horario.profesional_nombre,
          slots_disponibles: slots,
          total_slots: slots.length
        });
      }
    }

    res.json({
      success: true,
      data: {
        fecha,
        dia: diaNombre,
        servicio: servicio.nombre,
        duracion_min: servicio.duracion_min,
        profesionales: profesionalesDisponibles,
        total_profesionales_disponibles: profesionalesDisponibles.length
      }
    });
  } catch (error) {
    console.error('Error al consultar disponibilidad:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { getAll, getById, create, updateEstado, cancel, getDisponibilidad };