const pool = require("../config/db");

function generarCodigoRemito(idRemito) {
  return `GUIA-${String(idRemito).padStart(4, "0")}`;
}

class Remito {
  static async crear({ despacho_destino, destinatario, descripcion, documentos, id_usuario }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const idsDocumentos = [
        ...new Set(
          documentos
            .map((id) => Number.parseInt(id, 10))
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      if (idsDocumentos.length === 0) {
        throw new Error("La lista de documentos no es válida");
      }

      const placeholders = idsDocumentos.map(() => "?").join(",");
      const [documentosRows] = await connection.query(
        `SELECT id_documento, destino, estado
         FROM documentos
         WHERE id_documento IN (${placeholders})
         FOR UPDATE`,
        idsDocumentos,
      );

      if (documentosRows.length !== idsDocumentos.length) {
        throw new Error("Uno o más documentos no existen");
      }

      const documentosInvalidos = documentosRows.filter(
        (documento) =>
          documento.estado !== "Pendiente de entrega" || documento.destino !== despacho_destino,
      );

      if (documentosInvalidos.length > 0) {
        throw new Error(
          "Todos los documentos deben estar pendientes de entrega y pertenecer al despacho seleccionado",
        );
      }

      const codigoTemporal = `TMP-REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const [remitoResult] = await connection.query(
        `INSERT INTO remitos (codigo, despacho_destino, destinatario, descripcion, id_usuario)
         VALUES (?, ?, ?, ?, ?)`,
        [codigoTemporal, despacho_destino, destinatario, descripcion, id_usuario],
      );

      const codigoFinal = generarCodigoRemito(remitoResult.insertId);
      await connection.query("UPDATE remitos SET codigo = ? WHERE id_remito = ?", [
        codigoFinal,
        remitoResult.insertId,
      ]);

      for (const idDocumento of idsDocumentos) {
        await connection.query(
          "INSERT INTO detalle_remito (id_remito, id_documento) VALUES (?, ?)",
          [remitoResult.insertId, idDocumento],
        );
      }

      await connection.query(
        `UPDATE documentos
         SET estado = 'Cargo de envío'
         WHERE id_documento IN (${placeholders})`,
        idsDocumentos,
      );

      await connection.commit();

      const [rows] = await connection.query(
        `SELECT r.*, COUNT(dr.id_documento) AS cantidad_documentos, u.nombre AS usuario_generador
         FROM remitos r
         LEFT JOIN detalle_remito dr ON r.id_remito = dr.id_remito
         LEFT JOIN usuarios u ON u.id_usuario = r.id_usuario
         WHERE r.id_remito = ?
         GROUP BY r.id_remito`,
        [remitoResult.insertId],
      );

      return rows[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async listar() {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(`
        SELECT r.*, COUNT(dr.id_documento) AS cantidad_documentos, u.nombre AS usuario_generador
        FROM remitos r
        LEFT JOIN detalle_remito dr ON r.id_remito = dr.id_remito
        LEFT JOIN usuarios u ON u.id_usuario = r.id_usuario
        GROUP BY r.id_remito
        ORDER BY r.id_remito DESC
      `);
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Remito;
