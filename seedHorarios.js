// seedHorarios.js
const { getDatabase } = require('./config/database');

function seedHorarios() {
  const db = getDatabase();

  // Horarios para cada profesional (de Lunes a Sábado)
  const horarios = [
    // Profesional 1 - Lic. Nelly Fernández
    { profesional_id: 1, dia_semana: 1, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 1, dia_semana: 2, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 1, dia_semana: 3, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 1, dia_semana: 4, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 1, dia_semana: 5, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 1, dia_semana: 6, hora_inicio: '08:00', hora_fin: '14:00' },
    
    // Profesional 2 - Lic. Fidel Villca
    { profesional_id: 2, dia_semana: 1, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 2, dia_semana: 2, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 2, dia_semana: 3, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 2, dia_semana: 4, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 2, dia_semana: 5, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 2, dia_semana: 6, hora_inicio: '08:00', hora_fin: '14:00' },
    
    // Profesional 3 - Lic. Roxana Ramos
    { profesional_id: 3, dia_semana: 1, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 3, dia_semana: 2, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 3, dia_semana: 3, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 3, dia_semana: 4, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 3, dia_semana: 5, hora_inicio: '08:00', hora_fin: '18:00' },
    { profesional_id: 3, dia_semana: 6, hora_inicio: '08:00', hora_fin: '14:00' },
    
    // Profesional 4 - Helen Quispe
    { profesional_id: 4, dia_semana: 1, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 4, dia_semana: 2, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 4, dia_semana: 3, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 4, dia_semana: 4, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 4, dia_semana: 5, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 4, dia_semana: 6, hora_inicio: '09:00', hora_fin: '15:00' },
    
    // Profesional 5 - Paula Romero
    { profesional_id: 5, dia_semana: 1, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 5, dia_semana: 2, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 5, dia_semana: 3, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 5, dia_semana: 4, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 5, dia_semana: 5, hora_inicio: '09:00', hora_fin: '19:00' },
    { profesional_id: 5, dia_semana: 6, hora_inicio: '09:00', hora_fin: '15:00' },
  ];

  console.log('🔄 Insertando horarios disponibles...');

  // Eliminar horarios existentes
  db.prepare('DELETE FROM horarios_disponibles').run();

  // Insertar nuevos horarios
  const insertStmt = db.prepare(`
    INSERT INTO horarios_disponibles (profesional_id, dia_semana, hora_inicio, hora_fin)
    VALUES (?, ?, ?, ?)
  `);

  let inserted = 0;
  for (const h of horarios) {
    try {
      insertStmt.run(h.profesional_id, h.dia_semana, h.hora_inicio, h.hora_fin);
      inserted++;
    } catch (error) {
      console.error(`❌ Error insertando horario para profesional ${h.profesional_id}:`, error.message);
    }
  }

  console.log(`✅ ${inserted} horarios insertados correctamente.`);
}

// Ejecutar
seedHorarios();
console.log('✅ Seed completado.');