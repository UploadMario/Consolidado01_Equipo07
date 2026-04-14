const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const usuario = await Usuario.buscarPorCorreo(correo);
        if (!usuario) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        req.session.usuario = usuario;
        res.json({ message: "Login exitoso", usuario });
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};