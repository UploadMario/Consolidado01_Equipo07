const express = require("express");
const router = express.Router();
const remitoController = require("../controller/remitoController");

router.post("/", remitoController.registrarRemito);
router.get("/", remitoController.listarRemitos);
router.put("/:id/enviar", remitoController.enviarRemito);

module.exports = router;