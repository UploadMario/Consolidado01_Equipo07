const pool = require("../config/db");

class Documento {
  static async crear(
    codigo,
    tipo,
    fecha_recepcion,
    remitente,
    destino,
    observaciones,
    id_usuario,
  ) {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO documentos (codigo, tipo, fecha_recepcion, remitente, destino, observaciones, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        codigo,
        tipo,
        fecha_recepcion,
        remitente,
        destino,
        observaciones,
        id_usuario,
      ],
    );
    connection.release();
    return result.insertId;
  }

  static async listar() {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM documentos");
    connection.release();
    return rows;
  }

  static async buscarPorId(id) {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM documentos WHERE id_documento = ?",
      [id],
    );
    connection.release();
    return rows[0];
  }

  static async filtrarPorDestino(destino) {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM documentos WHERE destino = ?",
      [destino],
    );
    connection.release();
    return rows;
  }

  static async actualizarEstado(id, estado) {
    const connection = await pool.getConnection();
    await connection.query(
      "UPDATE documentos SET estado = ? WHERE id_documento = ?",
      [estado, id],
    );
    connection.release();
  }
}

module.exports = Documento;
