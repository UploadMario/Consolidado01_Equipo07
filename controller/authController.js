const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuario");

function sanitizarUsuario(usuario) {
  if (!usuario) {
    return null;
  }

  const { contrasena, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
}

exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  try {
    const usuario = await Usuario.buscarPorCorreo(correo.trim().toLowerCase());

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const credencialesValidas = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!credencialesValidas) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuarioSeguro = sanitizarUsuario(usuario);
    req.session.usuario = usuarioSeguro;

    return res.json({ message: "Login exitoso", usuario: usuarioSeguro });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

exports.obtenerSesion = (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: "Sesión no iniciada" });
  }

  return res.json({ usuario: req.session.usuario });
};

exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error al cerrar sesión:", error);
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }

    res.clearCookie("connect.sid");
    return res.json({ message: "Sesión cerrada correctamente" });
  });
};
