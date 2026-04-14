const Documento = require("../models/Documento");

exports.registrarDocumento = async (req, res) => {
    const {
        codigo,
        tipo,
        fecha_recepcion,
        remitente,
        destino,
        observaciones,
        estado
    } = req.body;

    try {
        if (!codigo || !tipo || !fecha_recepcion || !remitente || !destino) {
            return res.status(400).json({
                error: "Los campos código, tipo, fecha de recepción, remitente y destino son obligatorios"
            });
        }

        const documentoExistente = await Documento.buscarPorCodigo(codigo);
        if (documentoExistente) {
            return res.status(409).json({ error: "Ya existe un documento con ese código" });
        }

        const id_usuario = req.session?.usuario?.id_usuario || null;

        const resultado = await Documento.crear({
            codigo,
            tipo,
            fecha_recepcion,
            remitente,
            destino,
            observaciones: observaciones || null,
            estado: estado || "Pendiente de entrega",
            id_usuario
        });

        res.status(201).json({
            message: "Documento registrado con éxito",
            id_documento: resultado.insertId
        });
    } catch (error) {
        console.error("Error al registrar documento:", error);
        res.status(500).json({ error: "Error al registrar el documento" });
    }
};

exports.listarDocumentos = async (req, res) => {
    try {
        const documentos = await Documento.listar();
        res.json(documentos);
    } catch (error) {
        console.error("Error al listar documentos:", error);
        res.status(500).json({ error: "Error al listar los documentos" });
    }
};

exports.buscarDocumentoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const documento = await Documento.buscarPorId(id);
        if (!documento) {
            return res.status(404).json({ error: "Documento no encontrado" });
        }

        res.json(documento);
    } catch (error) {
        console.error("Error al buscar documento:", error);
        res.status(500).json({ error: "Error al buscar el documento" });
    }
};

exports.filtrarDocumentosPorDestino = async (req, res) => {
    const { destino } = req.params;

    try {
        const documentos = await Documento.filtrarPorDestino(destino);
        res.json(documentos);
    } catch (error) {
        console.error("Error al filtrar documentos:", error);
        res.status(500).json({ error: "Error al filtrar los documentos" });
    }
};

exports.actualizarEstadoDocumento = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        if (!estado) {
            return res.status(400).json({ error: "El estado es obligatorio" });
        }

        await Documento.actualizarEstado(id, estado);
        res.json({ message: "Estado del documento actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar estado del documento:", error);
        res.status(500).json({ error: "Error al actualizar el estado del documento" });
    }
};
