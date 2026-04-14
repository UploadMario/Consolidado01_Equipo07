const db = require('../config/db');

const Remito = {
  listar: async () => {
    const [rows] = await db.query(
      'SELECT * FROM remitos ORDER BY id_remito DESC'
    );
    return rows;
  },

  crear: async (data) => {
    const {
      numero_remito,
      destino,
      observaciones,
      id_usuario
    } = data;

    const [result] = await db.query(
      `INSERT INTO remitos
      (numero_remito, destino, observaciones, id_usuario)
      VALUES (?, ?, ?, ?)`,
      [numero_remito, destino, observaciones, id_usuario]
    );

    return result;
  },

  agregarDocumento: async (id_remito, id_documento) => {
    const [result] = await db.query(
      'INSERT INTO detalle_remito (id_remito, id_documento) VALUES (?, ?)',
      [id_remito, id_documento]
    );
    return result;
  },

  obtenerDetalle: async (id_remito) => {
    const [rows] = await db.query(
      `SELECT d.*
       FROM detalle_remito dr
       INNER JOIN documentos d ON dr.id_documento = d.id_documento
       WHERE dr.id_remito = ?`,
      [id_remito]
    );
    return rows;
  }
};

module.exports = Remito;