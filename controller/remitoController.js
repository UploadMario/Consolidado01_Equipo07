const Remito = require("../models/Remito");

exports.registrarRemito = async (req, res) => {
    const { numero_remito, destino, observaciones, documentos } = req.body;

    try {
        if (!numero_remito || !destino) {
            return res.status(400).json({ error: "Número de remito y destino son obligatorios" });
        }

        const existente = await Remito.buscarPorNumero(numero_remito.trim());
        if (existente) {
            return res.status(409).json({ error: "Ya existe un remito con ese número" });
        }

        const documentosIds = Array.isArray(documentos)
            ? documentos.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
            : [];

        const remito = await Remito.crearConDocumentos({
            numero_remito: numero_remito.trim(),
            destino: destino.trim(),
            observaciones: observaciones?.trim() || null,
            id_usuario: req.session.usuario.id_usuario,
            documentos: documentosIds,
        });

        res.status(201).json({
            message: "Remito registrado con éxito",
            id_remito: remito.id_remito,
        });
    } catch (error) {
        console.error("Error al registrar remito:", error);
        res.status(500).json({ error: "Error al registrar el remito" });
    }
};

exports.listarRemitos = async (_req, res) => {
    try {
        const remitos = await Remito.listar();
        res.json(remitos);
    } catch (error) {
        console.error("Error al listar remitos:", error);
        res.status(500).json({ error: "Error al listar los remitos" });
    }
};

exports.enviarRemito = async (req, res) => {
    const { id } = req.params;

    try {
        const actualizado = await Remito.actualizarEstado(id, "Enviado");
        if (!actualizado) {
            return res.status(404).json({ error: "Remito no encontrado" });
        }
        res.json({ message: "Remito enviado con éxito" });
    } catch (error) {
        console.error("Error al enviar remito:", error);
        res.status(500).json({ error: "Error al enviar el remito" });
    }
};
