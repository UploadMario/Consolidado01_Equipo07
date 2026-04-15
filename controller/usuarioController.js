const Usuario = require("../models/Usuario");

const ROLES_VALIDOS = ["admin", "Operador", "Firmante"];

function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function contrasenaSegura(contrasena) {
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(contrasena);
}

exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  if (typeof nombre !== "string" || nombre.trim().length < 3 || nombre.trim().length > 100) {
    return res.status(400).json({ error: "El nombre debe tener entre 3 y 100 caracteres" });
  }

  const correoNormalizado = typeof correo === "string" ? correo.trim().toLowerCase() : "";
  if (!esCorreoValido(correoNormalizado)) {
    return res.status(400).json({ error: "El correo no es válido" });
  }

  if (typeof contrasena !== "string" || !contrasenaSegura(contrasena)) {
    return res.status(400).json({
      error: "La contraseña debe tener al menos 6 caracteres, incluyendo una letra y un número",
    });
  }

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: "El rol seleccionado no es válido" });
  }

  try {
    const usuarioExistente = await Usuario.buscarPorCorreo(correoNormalizado);
    if (usuarioExistente) {
      return res.status(409).json({ error: "Ya existe un usuario registrado con ese correo" });
    }

    const idUsuario = await Usuario.crear(
      nombre.trim(),
      correoNormalizado,
      contrasena,
      rol,
    );

    const nuevoUsuario = await Usuario.buscarPorId(idUsuario);
    return res.status(201).json({
      message: "Usuario registrado con éxito",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

exports.listarUsuarios = async (_req, res) => {
  try {
    const usuarios = await Usuario.listar();
    return res.json(usuarios);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return res.status(500).json({ error: "Error al listar usuarios" });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const usuarioSesion = req.session.usuario;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El ID del usuario no es válido" });
  }

  if (usuarioSesion?.id_usuario === id) {
    return res.status(400).json({ error: "No puedes eliminar tu propio usuario en sesión" });
  }

  try {
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (usuario.rol === "admin") {
      const totalAdmins = await Usuario.contarAdmins();
      if (totalAdmins <= 1) {
        return res.status(400).json({ error: "Debe existir al menos un usuario administrador" });
      }
    }

    await Usuario.eliminar(id);
    return res.json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};
