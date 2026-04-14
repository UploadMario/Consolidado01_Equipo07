const Usuario = require("../models/Usuario");

exports.registrarUsuario = async (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;

    try {
        if (!nombre || !correo || !contrasena || !rol) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const usuarioExistente = await Usuario.buscarPorCorreo(correo.trim());
        if (usuarioExistente) {
            return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
        }

        const result = await Usuario.crear({
            nombre: nombre.trim(),
            correo: correo.trim(),
            contrasena: contrasena.trim(),
            rol,
        });

        res.status(201).json({
            message: "Usuario registrado con éxito",
            id_usuario: result.insertId,
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

exports.listarUsuarios = async (_req, res) => {
    try {
        const usuarios = await Usuario.listar();
        res.json(usuarios);
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ error: "Error al listar los usuarios" });
    }
};

exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        if (Number(id) === req.session.usuario.id_usuario) {
            return res.status(400).json({ error: "No puedes eliminar tu propio usuario mientras estás conectado" });
        }

        const eliminado = await Usuario.eliminar(id);
        if (!eliminado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
};
