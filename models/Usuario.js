const pool = require("../config/db");

class Usuario {
  static async crear(nombre, correo, contrasena, rol) {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)",
      [nombre, correo, contrasena, rol],
    );
    connection.release();
    return result.insertId;
  }

  static async buscarPorCorreo(correo) {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
    );
    connection.release();
    return rows[0];
  }

  static async listar() {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM usuarios");
    connection.release();
    return rows;
  }

  static async eliminar(id) {
    const connection = await pool.getConnection();
    await connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    connection.release();
  }
}

module.exports = Usuario;
