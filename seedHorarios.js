// seedHorarios.js
const { pool } = require('./config/database');

async function seedHorarios() {
  try {
    // Horarios para cada profesional (de Lunes a Sábado)
    const horarios = [
      // Profesional 1 - Lic. Carolina Méndez
      { profesional_id: 1, dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 1, dia_semana: 2, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 1, dia_semana: 3, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 1, dia_semana: 4, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 1, dia_semana: 5, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 1, dia_semana: 6, hora_inicio: '09:00', hora_fin: '13:00' },
      
      // Profesional 2 - Lic. Martín Suárez
      { profesional_id: 2, dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 2, dia_semana: 2, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 2, dia_semana: 3, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 2, dia_semana: 4, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 2, dia_semana: 5, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 2, dia_semana: 6, hora_inicio: '09:00', hora_fin: '13:00' },
      
      // Profesional 3 - Lic. Valeria Ríos
      { profesional_id: 3, dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 3, dia_semana: 2, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 3, dia_semana: 3, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 3, dia_semana: 4, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 3, dia_semana: 5, hora_inicio: '09:00', hora_fin: '18:00' },
      { profesional_id: 3, dia_semana: 6, hora_inicio: '09:00', hora_fin: '13:00' },
    ];

    console.log('🔄 Insertando/actualizando horarios disponibles...');

    // Eliminar horarios existentes
    await pool.query('DELETE FROM horarios_disponibles');

    // Insertar nuevos horarios
    for (const h of horarios) {
      try {
        await pool.query(
          'INSERT INTO horarios_disponibles (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)',
          [h.profesional_id, h.dia_semana, h.hora_inicio, h.hora_fin]
        );
      } catch (error) {
        console.error(`❌ Error insertando horario para profesional ${h.profesional_id}:`, error.message);
      }
    }

    console.log(`✅ ${horarios.length} horarios insertados correctamente.`);
  } catch (error) {
    console.error('❌ Error en seedHorarios:', error.message);
    process.exit(1);
  }
}

// Ejecutar
seedHorarios().then(() => {
  console.log('✅ Seed completado.');
  process.exit(0);
});