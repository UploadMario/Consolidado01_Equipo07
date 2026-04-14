const db = require('../config/db');

const Documento = {
  listar: async () => {
    const [rows] = await db.query(
      `SELECT d.*, u.nombre AS usuario_registro
       FROM documentos d
       LEFT JOIN usuarios u ON d.id_usuario = u.id_usuario
       ORDER BY d.id_documento DESC`
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

  buscarPorId: async (id) => {
    const [rows] = await db.query(
      `SELECT d.*, u.nombre AS usuario_registro
       FROM documentos d
       LEFT JOIN usuarios u ON d.id_usuario = u.id_usuario
       WHERE d.id_documento = ?`,
      [id]
    );
    return rows[0];
  },

  filtrarPorDestino: async (destino) => {
    const [rows] = await db.query(
      `SELECT d.*, u.nombre AS usuario_registro
       FROM documentos d
       LEFT JOIN usuarios u ON d.id_usuario = u.id_usuario
       WHERE d.destino LIKE ?
       ORDER BY d.id_documento DESC`,
      [`%${destino}%`]
    );
    return rows;
  },

  crear: async (data) => {
    const {
      codigo,
      tipo,
      fecha_recepcion,
      remitente,
      destino,
      observaciones,
      estado,
      id_usuario
    } = data;

    const [result] = await db.query(
      `INSERT INTO documentos
      (codigo, tipo, fecha_recepcion, remitente, destino, estado, observaciones, id_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        tipo,
        fecha_recepcion,
        remitente,
        destino,
        estado,
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
