const Documento = require("../models/Documento");

exports.registrarDocumento = async (req, res) => {
<<<<<<< HEAD
    const {
        codigo,
        tipo,
        fecha_recepcion,
        remitente,
        destino,
        observaciones,
        estado,
    } = req.body;

    try {
        if (!codigo || !tipo || !fecha_recepcion || !remitente || !destino) {
            return res.status(400).json({
                error: "Los campos código, tipo, fecha de recepción, remitente y destino son obligatorios",
            });
        }

        const documentoExistente = await Documento.buscarPorCodigo(codigo.trim());
        if (documentoExistente) {
            return res.status(409).json({ error: "Ya existe un documento con ese código" });
        }

        const resultado = await Documento.crear({
            codigo: codigo.trim(),
            tipo: tipo.trim(),
            fecha_recepcion,
            remitente: remitente.trim(),
            destino: destino.trim(),
            observaciones: observaciones?.trim() || null,
            estado: estado || "Pendiente de entrega",
            id_usuario: req.session.usuario.id_usuario,
        });

        res.status(201).json({
            message: "Documento registrado con éxito",
            id_documento: resultado.insertId,
        });
    } catch (error) {
        console.error("Error al registrar documento:", error);
=======
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
>>>>>>> 1950aed26938d00186874f3b69d5fd8eda3f0c6e
        res.status(500).json({ error: "Error al registrar el documento" });
    }
};

exports.listarDocumentos = async (_req, res) => {
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

        const actualizado = await Documento.actualizarEstado(id, estado);
        if (!actualizado) {
            return res.status(404).json({ error: "Documento no encontrado" });
        }

        res.json({ message: "Estado del documento actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar estado del documento:", error);
        res.status(500).json({ error: "Error al actualizar el estado del documento" });
    }
};
