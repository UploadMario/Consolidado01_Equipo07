const Usuario = require("../models/Usuario");

exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
        }

        const usuario = await Usuario.buscarPorCorreo(correo);
        if (!usuario || contrasena !== usuario.contrasena) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
        };

        res.json({
            message: "Login exitoso",
            usuario: req.session.usuario,
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};

exports.logout = async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ error: "No se pudo cerrar sesión" });
        }
        res.clearCookie("connect.sid");
        return res.json({ message: "Sesión cerrada" });
    });
};

exports.me = async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ autenticado: false });
    }

    return res.json({
        autenticado: true,
        usuario: req.session.usuario,
    });
};
