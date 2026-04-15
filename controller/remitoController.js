const Remito = require("../models/Remito");

const DESTINOS_VALIDOS = ["Finanzas", "Legal", "Archivos", "Marketing"];

function esTextoValido(valor, minimo = 1, maximo = 255) {
  return typeof valor === "string" && valor.trim().length >= minimo && valor.trim().length <= maximo;
}

exports.registrarRemito = async (req, res) => {
  const { despacho_destino, destinatario, descripcion, documentos } = req.body;
  const id_usuario = req.session.usuario?.id_usuario;

  if (!id_usuario) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }

  if (!DESTINOS_VALIDOS.includes(despacho_destino)) {
    return res.status(400).json({ error: "El destino del remito no es válido" });
  }

  if (!esTextoValido(destinatario, 3, 120)) {
    return res.status(400).json({ error: "Debes indicar a quién se envía el remito" });
  }

  if (!esTextoValido(descripcion, 5, 255)) {
    return res.status(400).json({ error: "La descripción del remito debe tener entre 5 y 255 caracteres" });
  }

  if (!Array.isArray(documentos) || documentos.length === 0) {
    return res.status(400).json({ error: "Debes seleccionar al menos un documento" });
  }

  try {
    const remito = await Remito.crear({
      despacho_destino,
      destinatario: destinatario.trim(),
      descripcion: descripcion.trim(),
      documentos,
      id_usuario,
    });

    return res.status(201).json({
      message: "Remito registrado con éxito",
      remito,
    });
  } catch (error) {
    console.error("Error al registrar el remito:", error);
    return res.status(400).json({ error: error.message || "Error al registrar el remito" });
  }
};

exports.listarRemitos = async (_req, res) => {
  try {
    const remitos = await Remito.listar();
    return res.json(remitos);
  } catch (error) {
    console.error("Error al listar los remitos:", error);
    return res.status(500).json({ error: "Error al listar los remitos" });
  }
};
