const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/login", authController.login);
router.get("/me", authController.obtenerSesion);
router.post("/logout", authController.logout);

module.exports = router;
