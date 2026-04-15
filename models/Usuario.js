const bcrypt = require("bcrypt");
const pool = require("../config/db");

class Usuario {
  static async crear(nombre, correo, contrasena, rol) {
    const connection = await pool.getConnection();

    try {
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      const [result] = await connection.query(
        "INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)",
        [nombre, correo, contrasenaHash, rol],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async buscarPorCorreo(correo) {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(
        "SELECT * FROM usuarios WHERE correo = ?",
        [correo],
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async buscarPorId(id) {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(
        "SELECT id_usuario, nombre, correo, rol, fecha_creacion FROM usuarios WHERE id_usuario = ?",
        [id],
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async listar() {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT id_usuario, nombre, correo, rol, fecha_creacion
         FROM usuarios
         ORDER BY id_usuario DESC`,
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async contarAdmins() {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query(
        "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin'",
      );
      return rows[0].total;
    } finally {
      connection.release();
    }
  }

  static async eliminar(id) {
    const connection = await pool.getConnection();

    try {
      await connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    } finally {
      connection.release();
    }
  }
}

module.exports = Usuario;
