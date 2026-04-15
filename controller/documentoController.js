const Documento = require("../models/Documento");

const DESTINOS_VALIDOS = ["Finanzas", "Legal", "Archivos", "Marketing"];
const ESTADOS_VALIDOS = [
  "Pendiente de entrega",
  "Cargo de envío",
  "Cargo devuelto entregado",
  "No recepcionado (notificado)",
];

function esTextoValido(valor, minimo = 1, maximo = 255) {
  return typeof valor === "string" && valor.trim().length >= minimo && valor.trim().length <= maximo;
}

function esFechaValida(fecha) {
  if (!fecha || typeof fecha !== "string") {
    return false;
  }

  const fechaDocumento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(fechaDocumento.getTime())) {
    return false;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaDocumento <= hoy;
}

exports.registrarDocumento = async (req, res) => {
  const { tipo, fecha_recepcion, remitente, destino, observaciones } = req.body;
  const id_usuario = req.session.usuario?.id_usuario;

  if (!id_usuario) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }

  if (!esTextoValido(tipo, 3, 100)) {
    return res.status(400).json({ error: "El tipo de documento debe tener entre 3 y 100 caracteres" });
  }

  if (!esFechaValida(fecha_recepcion)) {
    return res.status(400).json({ error: "La fecha de recepción es obligatoria y no puede ser futura" });
  }

  if (!esTextoValido(remitente, 3, 150)) {
    return res.status(400).json({ error: "El remitente debe tener entre 3 y 150 caracteres" });
  }

  if (!DESTINOS_VALIDOS.includes(destino)) {
    return res.status(400).json({ error: "El despacho destino seleccionado no es válido" });
  }

  if (typeof observaciones === "string" && observaciones.trim().length > 255) {
    return res.status(400).json({ error: "Las observaciones no pueden superar los 255 caracteres" });
  }

  try {
    const documento = await Documento.crear({
      tipo: tipo.trim(),
      fecha_recepcion,
      remitente: remitente.trim(),
      destino,
      observaciones: typeof observaciones === "string" ? observaciones.trim() : "",
      id_usuario,
    });

    return res.status(201).json({
      message: "Documento registrado con éxito",
      documento,
    });
  } catch (error) {
    console.error("Error al registrar el documento:", error);
    return res.status(500).json({ error: "Error al registrar el documento" });
  }
};

exports.listarDocumentos = async (req, res) => {
  const { codigo = "", destino = "", estado = "" } = req.query;

  if (destino && !DESTINOS_VALIDOS.includes(destino)) {
    return res.status(400).json({ error: "El destino seleccionado no es válido" });
  }

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: "El estado seleccionado no es válido" });
  }

  try {
    const documentos = await Documento.listar({
      codigo: typeof codigo === "string" ? codigo.trim() : "",
      destino,
      estado,
    });
    return res.json(documentos);
  } catch (error) {
    console.error("Error al listar los documentos:", error);
    return res.status(500).json({ error: "Error al listar los documentos" });
  }
};

exports.buscarDocumentoPorId = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El ID del documento no es válido" });
  }

  try {
    const documento = await Documento.buscarPorId(id);
    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    return res.json(documento);
  } catch (error) {
    console.error("Error al buscar el documento:", error);
    return res.status(500).json({ error: "Error al buscar el documento" });
  }
};

exports.buscarDocumentoPorCodigo = async (req, res) => {
  const codigo = typeof req.params.codigo === "string" ? req.params.codigo.trim() : "";

  if (!codigo || codigo.length < 3) {
    return res.status(400).json({ error: "El código del documento no es válido" });
  }

  try {
    const documento = await Documento.buscarPorCodigo(codigo);
    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    return res.json(documento);
  } catch (error) {
    console.error("Error al buscar el documento por código:", error);
    return res.status(500).json({ error: "Error al buscar el documento" });
  }
};

exports.filtrarDocumentosPorDestino = async (req, res) => {
  const { destino } = req.params;

  if (!DESTINOS_VALIDOS.includes(destino)) {
    return res.status(400).json({ error: "El destino seleccionado no es válido" });
  }

  try {
    const documentos = await Documento.filtrarPorDestino(destino);
    return res.json(documentos);
  } catch (error) {
    console.error("Error al filtrar los documentos:", error);
    return res.status(500).json({ error: "Error al filtrar los documentos" });
  }
};

exports.actualizarEstadoDocumento = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { estado } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El ID del documento no es válido" });
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: "El estado solicitado no es válido" });
  }

  try {
    const documento = await Documento.buscarPorId(id);
    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const transicionesPermitidas = {
      "Pendiente de entrega": ["Cargo de envío"],
      "Cargo de envío": ["Cargo devuelto entregado", "No recepcionado (notificado)"],
      "Cargo devuelto entregado": [],
      "No recepcionado (notificado)": [],
    };

    if (!transicionesPermitidas[documento.estado]?.includes(estado)) {
      return res.status(400).json({
        error: `No se puede cambiar de '${documento.estado}' a '${estado}'`,
      });
    }

    await Documento.actualizarEstado(id, estado);
    return res.json({ message: "Estado del documento actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el estado del documento:", error);
    return res.status(500).json({ error: "Error al actualizar el estado del documento" });
  }
};
