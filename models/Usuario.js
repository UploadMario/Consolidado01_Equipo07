const db = require('../config/db');

const Usuario = {
  listar: async () => {
    const [rows] = await db.query(
      'SELECT id_usuario, nombre, correo, rol, fecha_creacion FROM usuarios ORDER BY id_usuario DESC'
    );
    return rows;
  },

  buscarPorCorreo: async (correo) => {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    return rows[0];
  },

  crear: async (data) => {
    const {
      nombre,
      correo,
      contrasena,
      rol
    } = data;

    const [result] = await db.query(
      `INSERT INTO usuarios
      (nombre, correo, contrasena, rol)
      VALUES (?, ?, ?, ?)`,
      [nombre, correo, contrasena, rol]
    );

    return result;
  }
};

module.exports = Usuario;