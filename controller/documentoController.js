const Documento = require("../models/Documento");

exports.registrarDocumento = async (req, res) => {
  const { codigo, tipo, fecha_recepcion, remitente, destino, observaciones } =
    req.body;
  const id_usuario = req.session.usuario
    ? req.session.usuario.id_usuario
    : null;
  try {
    const documentoId = await Documento.crear(
      codigo,
      tipo,
      fecha_recepcion,
      remitente,
      destino,
      observaciones,
      id_usuario,
    );
    res
      .status(201)
      .json({ message: "Documento registrado con éxito", id: documentoId });
  } catch (error) {
    console.error("Error al registrar el documento:", error);
    res.status(500).json({ error: "Error al registrar el documento" });
  }
};

exports.listarDocumentos = async (req, res) => {
  try {
    const documentos = await Documento.listar();
    res.json(documentos);
  } catch (error) {
    console.error("Error al listar los documentos:", error);
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
    console.error("Error al buscar el documento:", error);
    res.status(500).json({ error: "Error al buscar el documento" });
  }
};

exports.filtrarDocumentosPorDestino = async (req, res) => {
  const { destino } = req.params;
  try {
    const documentos = await Documento.filtrarPorDestino(destino);
    res.json(documentos);
  } catch (error) {
    console.error("Error al filtrar los documentos:", error);
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
    console.error("Error al actualizar el estado del documento:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el estado del documento" });
  }
};
