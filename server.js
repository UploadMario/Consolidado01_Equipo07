const express = require("express");
const session = require("express-session");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const documentoRoutes = require("./routes/documentoRoutes");
const remitoRoutes = require("./routes/remitoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "view")));
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true,
}));

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
    if (req.session.usuario) {
        return next();
    } else {
        return res.redirect("/login");
    }
};

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/remitos", remitoRoutes);
app.use("/api/usuarios", usuarioRoutes);

// Rutas para servir archivos HTML
app.get("/", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "view", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "auth", "login.html"));
});

app.get("/documentos", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "view", "documentos", "documento.html"));
});

app.get("/remitos", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "view", "remitos", "remito.html"));
});

app.get("/usuarios", requireAuth, (req, res) => {
    // Solo accesible para administradores
    if (req.session.usuario && req.session.usuario.rol === "Administrador") {
        res.sendFile(path.join(__dirname, "view", "usuarios", "usuario.html"));
    } else {
        res.status(403).send("Acceso denegado");
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});