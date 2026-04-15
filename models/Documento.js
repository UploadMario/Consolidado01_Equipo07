const pool = require("../config/db");

function generarCodigoDocumento(idDocumento) {
  return `DOC${String(idDocumento).padStart(5, "0")}`;
}

class Documento {
  static async crear({ tipo, fecha_recepcion, remitente, destino, observaciones, id_usuario }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const codigoTemporal = `TMP-DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const [result] = await connection.query(
        `INSERT INTO documentos
          (codigo, tipo, fecha_recepcion, remitente, destino, observaciones, id_usuario)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          codigoTemporal,
          tipo,
          fecha_recepcion,
          remitente,
          destino,
          observaciones || null,
          id_usuario,
        ],
      );

      const codigoFinal = generarCodigoDocumento(result.insertId);
      await connection.query(
        "UPDATE documentos SET codigo = ? WHERE id_documento = ?",
        [codigoFinal, result.insertId],
      );

      await connection.commit();
      return this.buscarPorId(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async listar({ codigo = "", destino = "", estado = "" } = {}) {
    const connection = await pool.getConnection();

    try {
      const filtros = [];
      const params = [];

      if (codigo) {
        filtros.push("UPPER(d.codigo) LIKE ?");
        params.push(`%${codigo.toUpperCase()}%`);
      }

      if (destino) {
        filtros.push("d.destino = ?");
        params.push(destino);
      }

      if (estado) {
        filtros.push("d.estado = ?");
        params.push(estado);
      }

      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      const [rows] = await connection.query(
        `SELECT d.*, u.nombre AS usuario_registro
         FROM documentos d
         LEFT JOIN usuarios u ON u.id_usuario = d.id_usuario
         ${where}
         ORDER BY d.id_documento DESC`,
        params,
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async buscarPorId(id) {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT d.*, u.nombre AS usuario_registro
         FROM documentos d
         LEFT JOIN usuarios u ON u.id_usuario = d.id_usuario
         WHERE d.id_documento = ?`,
        [id],
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async buscarPorCodigo(codigo) {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT d.*, u.nombre AS usuario_registro
         FROM documentos d
         LEFT JOIN usuarios u ON u.id_usuario = d.id_usuario
         WHERE UPPER(d.codigo) = ?`,
        [codigo.toUpperCase()],
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async filtrarPorDestino(destino) {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT d.*, u.nombre AS usuario_registro
         FROM documentos d
         LEFT JOIN usuarios u ON u.id_usuario = d.id_usuario
         WHERE d.destino = ?
         ORDER BY d.id_documento DESC`,
        [destino],
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async actualizarEstado(id, estado) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        "UPDATE documentos SET estado = ? WHERE id_documento = ?",
        [estado, id],
      );
      return result.affectedRows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Documento;
