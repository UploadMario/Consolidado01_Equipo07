const Remito = require("../models/Remito");

exports.registrarRemito = async (req, res) => {
  const { codigo, despacho_destino, descripcion, documentos } = req.body;
  try {
    const remitoId = await Remito.crear(
      codigo,
      despacho_destino,
      descripcion,
      documentos,
    );
    res
      .status(201)
      .json({ message: "Remito registrado con éxito", id: remitoId });
  } catch (error) {
    console.error("Error al registrar el remito:", error);
    res.status(500).json({ error: "Error al registrar el remito" });
  }
};

exports.listarRemitos = async (req, res) => {
  try {
    const remitos = await Remito.listar();
    res.json(remitos);
  } catch (error) {
    console.error("Error al listar los remitos:", error);
    res.status(500).json({ error: "Error al listar los remitos" });
  }
};
