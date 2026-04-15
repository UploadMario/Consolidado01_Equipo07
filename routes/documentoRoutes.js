const express = require("express");
const router = express.Router();
const documentoController = require("../controller/documentoController");

function requireAuth(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }
  return next();
}

function requireRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session.usuario) {
      return res.status(401).json({ error: "Debes iniciar sesión" });
    }

    if (!rolesPermitidos.includes(req.session.usuario.rol)) {
      return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
    }

    return next();
  };
}

router.use(requireAuth);
router.post("/", requireRoles("admin", "Operador"), documentoController.registrarDocumento);
router.get("/", documentoController.listarDocumentos);
router.get("/codigo/:codigo", documentoController.buscarDocumentoPorCodigo);
router.get("/destino/:destino", documentoController.filtrarDocumentosPorDestino);
router.get("/:id", documentoController.buscarDocumentoPorId);
router.put("/:id/estado", requireRoles("admin", "Firmante"), documentoController.actualizarEstadoDocumento);

module.exports = router;
