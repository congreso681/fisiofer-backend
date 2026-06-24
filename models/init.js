const { pool } = require('../config/database');

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

    // ─── Verificar si hay profesionales ────────────────────────────
    const result = await pool.query('SELECT COUNT(*) as count FROM profesionales');
    const profesionalesCount = parseInt(result.rows[0].count, 10);

    if (profesionalesCount === 0) {
      console.log('🌱 Insertando datos de prueba de Fisiofer SPA...');

      // ── Profesionales ──
      await pool.query(`
        INSERT INTO profesionales (nombre, especialidad, email) VALUES
        ('Lic. Nelly Fernández', 'Fisioterapeuta · Propietaria', 'nelly.fernandez@fisiofer.com'),
        ('Lic. Fidel Villca', 'Fisioterapeuta · Propietario', 'fidel.villca@fisiofer.com'),
        ('Lic. Roxana Ramos', 'Fisioterapeuta', 'roxana.ramos@fisiofer.com'),
        ('Helen Quispe', 'Masajista Terapeuta', 'helen.quispe@fisiofer.com'),
        ('Paula Romero', 'Masajista Terapeuta / Esteticista', 'paula.romero@fisiofer.com')
      `);

      // ── Servicios ──
      await pool.query(`
        INSERT INTO servicios (nombre, descripcion, duracion_min, precio) VALUES
        ('Evaluación Diagnóstica', 'Evaluación completa para diagnóstico kinésico y plan de tratamiento', 30, 0),
        ('Kinesiología', 'Evaluación y tratamiento del movimiento corporal', 45, 85),
        ('Terapia Manual', 'Técnicas manuales avanzadas para aliviar el dolor y mejorar movilidad', 60, 100),
        ('Rehabilitación Deportiva', 'Programas de recuperación para deportistas con lesiones', 60, 120),
        ('Punción Seca', 'Tratamiento de puntos gatillo miofasciales con agujas', 30, 75),
        ('Electroterapia', 'Corrientes eléctricas terapéuticas para reducir inflamación', 30, 60),
        ('Acupuntura', 'Técnica de agujas para alivio del dolor y equilibrio energético', 30, 70),
        ('Ventosas (Cupping)', 'Técnica de succión para promover circulación sanguínea', 30, 50),
        ('Cavitación', 'Eliminación de grasa localizada por ultrasonido de baja frecuencia', 30, 25),
        ('Lipoláser', 'Reducción de grasa localizada mediante láser de baja potencia', 30, 30),
        ('Maderoterapia', 'Moldeamiento corporal con técnicas de madera', 30, 25),
        ('Radiofrecuencia', 'Tratamiento para flacidez y arrugas con ondas de radiofrecuencia', 30, 30),
        ('Ondas Rusas / Electroestimulación', 'Estimulación muscular para tonificación y levantamiento de glúteos', 30, 25),
        ('Levantamiento de Glúteos', 'Técnica específica para tonificar y levantar glúteos', 30, 35),
        ('Masaje Relajante (40 min)', 'Alivio de tensión y estrés con movimientos suaves', 40, 25),
        ('Masaje Relajante (60 min)', 'Alivio de tensión y estrés con movimientos suaves', 60, 35),
        ('Masaje Descontracturante (40 min)', 'Liberación de nudos musculares y tensiones profundas', 40, 25),
        ('Masaje Descontracturante (60 min)', 'Liberación de nudos musculares y tensiones profundas', 60, 35),
        ('Masaje con Piedras Calientes', 'Terapia relajante con piedras volcánicas calientes', 45, 35),
        ('Drenaje Linfático', 'Técnica manual para activar el sistema linfático y eliminar toxinas', 45, 30)
      `);

      // ── Horarios disponibles ──
      const horarios = [];
      for (let profId = 1; profId <= 5; profId++) {
        for (let dia = 1; dia <= 5; dia++) {
          horarios.push([profId, dia, '08:00', '18:00']);
        }
        // Sábado (6): 8:00 a 14:00
        horarios.push([profId, 6, '08:00', '14:00']);
      }

      for (const [profId, dia, inicio, fin] of horarios) {
        await pool.query(
          'INSERT INTO horarios_disponibles (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)',
          [profId, dia, inicio, fin]
        );
      }

      console.log('✅ Datos de prueba de Fisiofer SPA insertados correctamente.');
    } else {
      console.log(`ℹ️  ${profesionalesCount} profesionales existentes. Seed omitido.`);
    }
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error.message);
    throw error;
  }
}

module.exports = { initializeDatabase };