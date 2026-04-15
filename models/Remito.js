const pool = require("../config/db");

class Remito {
  static async crear(codigo, despacho_destino, descripcion, documentos) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Crear el remito
      const [remitoResult] = await connection.query(
        "INSERT INTO remitos (codigo, despacho_destino, descripcion) VALUES (?, ?, ?)",
        [codigo, despacho_destino, descripcion],
      );
      const id_remito = remitoResult.insertId;

      // Asociar los documentos al remito
      for (const id_documento of documentos) {
        await connection.query(
          "INSERT INTO detalle_remito (id_remito, id_documento) VALUES (?, ?)",
          [id_remito, id_documento],
        );
      }

      await connection.commit();
      connection.release();
      return id_remito;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async listar() {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
            SELECT r.*, COUNT(dr.id_documento) AS cantidad_documentos
            FROM remitos r
            LEFT JOIN detalle_remito dr ON r.id_remito = dr.id_remito
            GROUP BY r.id_remito
        `);
    connection.release();
    return rows;
  }
}

module.exports = Remito;
