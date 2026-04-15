const express = require("express");
const router = express.Router();
const remitoController = require("../controller/remitoController");

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
router.post("/", requireRoles("admin", "Operador"), remitoController.registrarRemito);
router.get("/", remitoController.listarRemitos);

module.exports = router;
