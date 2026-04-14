const Documento = require("../models/Documento");

exports.registrarDocumento = async (req, res) => {
    const { tipo_documento, fecha_recepcion, remitente, despacho_destino } = req.body;

    try {
        const usuario = req.session.usuario; // 👈 importante

        if (!usuario) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const nuevoDocumento = {
            codigo: "DOC-" + Date.now(), // 👈 generar código automático
            tipo: tipo_documento,
            fecha_recepcion,
            remitente,
            destino: despacho_destino,
            observaciones: "", // opcional
            id_usuario: usuario.id // 👈 clave
        };

        const result = await Documento.crear(nuevoDocumento);

        res.status(201).json({
            message: "Documento registrado con éxito",
            id: result.insertId
        });

    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ error: "Error al registrar el documento" });
    }
};

exports.listarDocumentos = async (req, res) => {
    try {
        const documentos = await Documento.listar();
        res.json(documentos);
    } catch (error) {
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
        res.status(500).json({ error: "Error al buscar el documento" });
    }
};

exports.filtrarDocumentosPorDespacho = async (req, res) => {
    const { despacho } = req.params;
    try {
        const documentos = await Documento.filtrarPorDespacho(despacho);
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: "Error al filtrar los documentos" });
    }
};

exports.actualizarEstadoDocumento = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await Documento.actualizarEstado(id, estado);
        res.json({ message: "Estado del documento actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el estado del documento" });
    }
};