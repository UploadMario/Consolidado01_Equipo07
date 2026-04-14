const Remito = require("../models/Remito");

exports.registrarRemito = async (req, res) => {
    const { cantidad_documentos, descripcion, fecha_emision, despacho_destino } = req.body;
    try {
        const remitoId = await Remito.crear(cantidad_documentos, descripcion, fecha_emision, despacho_destino);
        res.status(201).json({ message: "Remito registrado con éxito", id: remitoId });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el remito" });
    }
};

exports.listarRemitos = async (req, res) => {
    try {
        const remitos = await Remito.listar();
        res.json(remitos);
    } catch (error) {
        res.status(500).json({ error: "Error al listar los remitos" });
    }
};
exports.enviarRemito = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await db.getConnection();
        await connection.query("UPDATE remito SET estado = 'Enviado' WHERE id = ?", [id]);
        connection.release();
        res.json({ message: "Remito enviado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al enviar el remito" });
    }
};