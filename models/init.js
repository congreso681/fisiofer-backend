const { pool } = require('../config/database');

/**
 * Inicializa las tablas de la base de datos y carga datos de prueba.
 * Solo inserta seed data si las tablas están vacías.
 */
async function initializeDatabase() {
  try {
    // ─── Crear tablas ───────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profesionales (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        especialidad TEXT NOT NULL,
        email TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        duracion_min INTEGER NOT NULL DEFAULT 45,
        precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS horarios_disponibles (
        id SERIAL PRIMARY KEY,
        profesional_id INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
        dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
        hora_inicio TEXT NOT NULL,
        hora_fin TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS turnos (
        id SERIAL PRIMARY KEY,
        paciente_nombre TEXT NOT NULL,
        paciente_telefono TEXT NOT NULL,
        paciente_email TEXT,
        servicio_id INTEGER NOT NULL REFERENCES servicios(id),
        profesional_id INTEGER NOT NULL REFERENCES profesionales(id),
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'confirmado', 'cancelado', 'completado')),
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
      CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
      CREATE INDEX IF NOT EXISTS idx_turnos_profesional ON turnos(profesional_id, fecha);
    `);

    console.log('📋 Tablas creadas/verificadas correctamente.');

    // ─── Verificar si hay datos ────────────────────────────────────
    const result = await pool.query('SELECT COUNT(*) as count FROM profesionales');
    const profesionalesCount = parseInt(result.rows[0].count, 10);

    if (profesionalesCount === 0) {
      console.log('🌱 Insertando datos de prueba...');

      // ── Profesionales ──
      await pool.query(`
        INSERT INTO profesionales (nombre, especialidad, email) VALUES
        ('Lic. Carolina Méndez', 'Kinesiología / Terapia Manual', 'carolina.mendez@fisiocenter.com'),
        ('Lic. Martín Suárez', 'Rehabilitación Deportiva / Punción Seca', 'martin.suarez@fisiocenter.com'),
        ('Lic. Valeria Ríos', 'Electroterapia / Kinesiología', 'valeria.rios@fisiocenter.com')
      `);

      // ── Servicios ──
      await pool.query(`
        INSERT INTO servicios (nombre, descripcion, duracion_min, precio) VALUES
        ('Kinesiología', 'Evaluación y tratamiento del movimiento corporal para restaurar la funcionalidad física y mejorar tu calidad de vida mediante técnicas especializadas.', 45, 8500),
        ('Terapia Manual', 'Técnicas manuales avanzadas para aliviar el dolor, reducir tensiones musculares y mejorar la movilidad articular de forma natural y efectiva.', 60, 10000),
        ('Rehabilitación Deportiva', 'Programas de recuperación diseñados para deportistas. Volvé a tu actividad con seguridad, previniendo futuras lesiones y optimizando tu rendimiento.', 60, 12000),
        ('Punción Seca', 'Tratamiento de puntos gatillo miofasciales mediante agujas de acupuntura para eliminar contracturas y dolores musculares persistentes.', 30, 7500),
        ('Electroterapia', 'Aplicación de corrientes eléctricas terapéuticas para estimular los tejidos, reducir la inflamación y acelerar los procesos de recuperación.', 30, 6000)
      `);

      // ── Horarios disponibles ──
      const horarios = [];
      for (let profId = 1; profId <= 3; profId++) {
        for (let dia = 1; dia <= 5; dia++) {
          horarios.push([profId, dia, '09:00', '18:00']);
        }
        // Sábado (6): 9:00 a 13:00
        horarios.push([profId, 6, '09:00', '13:00']);
      }

      for (const [profId, dia, inicio, fin] of horarios) {
        await pool.query(
          'INSERT INTO horarios_disponibles (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)',
          [profId, dia, inicio, fin]
        );
      }

      console.log('✅ Datos de prueba insertados correctamente.');
    } else {
      console.log('ℹ️  Datos ya existentes, seed omitido.');
    }
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error.message);
    throw error;
  }
}

module.exports = { initializeDatabase };
