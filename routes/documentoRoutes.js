const express = require("express");
const router = express.Router();
const documentoController = require("../controller/documentoController");

router.post("/", documentoController.registrarDocumento);
router.get("/", documentoController.listarDocumentos);
router.get("/:id", documentoController.buscarDocumentoPorId);
router.get(
  "/destino/:destino",
  documentoController.filtrarDocumentosPorDestino,
);
router.put("/:id/estado", documentoController.actualizarEstadoDocumento);

module.exports = router;
