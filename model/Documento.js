const db = require('../config/db');

const Documento = {
  listar: async () => {
    const [rows] = await db.query(
      'SELECT * FROM documentos ORDER BY id_documento DESC'
    );
    return rows;
  },

  buscarPorCodigo: async (codigo) => {
    const [rows] = await db.query(
      'SELECT * FROM documentos WHERE codigo = ?',
      [codigo]
    );
    return rows[0];
  },

  crear: async (data) => {
    const {
      codigo,
      tipo,
      fecha_recepcion,
      remitente,
      destino,
      observaciones,
      id_usuario
    } = data;

    const [result] = await db.query(
      `INSERT INTO documentos
      (codigo, tipo, fecha_recepcion, remitente, destino, observaciones, id_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        tipo,
        fecha_recepcion,
        remitente,
        destino,
        observaciones,
        id_usuario
      ]
    );

    return result;
  },

  actualizarEstado: async (id, estado) => {
    const [result] = await db.query(
      'UPDATE documentos SET estado = ? WHERE id_documento = ?',
      [estado, id]
    );
    return result;
  }
};

module.exports = Documento;