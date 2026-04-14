const express = require("express");
const router = express.Router();
const usuarioController = require("../controller/usuarioController");

router.post("/", usuarioController.registrarUsuario);
router.get("/", usuarioController.listarUsuarios);
router.delete("/:id", usuarioController.eliminarUsuario);

module.exports = router;