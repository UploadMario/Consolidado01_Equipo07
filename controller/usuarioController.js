const Usuario = require("../models/Usuario");

exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  try {
    const usuarioId = await Usuario.crear(nombre, correo, contrasena, rol);
    res
      .status(201)
      .json({ message: "Usuario registrado con éxito", id: usuarioId });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.listar();
    res.json(usuarios);
  } catch (error) {
    console.error("Error al listar los usuarios:", error);
    res.status(500).json({ error: "Error al listar los usuarios" });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await Usuario.eliminar(id);
    res.json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};
