const express = require("express");
const router = express.Router();
const usuarioController = require("../controller/usuarioController");

function requireAdmin(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }

  if (req.session.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Solo el administrador puede gestionar usuarios" });
  }

  return next();
}

router.use(requireAdmin);
router.post("/", usuarioController.registrarUsuario);
router.get("/", usuarioController.listarUsuarios);
router.delete("/:id", usuarioController.eliminarUsuario);

module.exports = router;
