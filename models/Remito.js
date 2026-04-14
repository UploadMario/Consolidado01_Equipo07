const db = require("../config/db");

const Remito = {
  listar: async () => {
    const [rows] = await db.query(
      `SELECT r.*, u.nombre AS usuario_registro,
              COUNT(dr.id_documento) AS cantidad_documentos
       FROM remitos r
       LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
       LEFT JOIN detalle_remito dr ON r.id_remito = dr.id_remito
       GROUP BY r.id_remito
       ORDER BY r.id_remito DESC`
    );
    return rows;
  },

  buscarPorNumero: async (numero_remito) => {
    const [rows] = await db.query(
      "SELECT * FROM remitos WHERE numero_remito = ?",
      [numero_remito]
    );
    return rows[0];
  },

  crearConDocumentos: async ({ numero_remito, destino, observaciones, id_usuario, documentos }) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO remitos
        (numero_remito, destino, observaciones, id_usuario)
        VALUES (?, ?, ?, ?)`,
        [numero_remito, destino, observaciones, id_usuario]
      );

      const id_remito = result.insertId;

      for (const id_documento of documentos) {
        const [rows] = await connection.query(
          "SELECT id_documento FROM documentos WHERE id_documento = ?",
          [id_documento]
        );

        if (rows.length === 0) {
          throw new Error(`El documento con ID ${id_documento} no existe`);
        }

        await connection.query(
          "INSERT INTO detalle_remito (id_remito, id_documento) VALUES (?, ?)",
          [id_remito, id_documento]
        );
      }

      await connection.commit();
      return { id_remito };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  actualizarEstado: async (id_remito, estado) => {
    const [result] = await db.query(
      "UPDATE remitos SET estado = ? WHERE id_remito = ?",
      [estado, id_remito]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Remito;
