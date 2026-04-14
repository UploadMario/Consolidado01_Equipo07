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
app.use(express.static(path.join(__dirname, "views")));
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true,
}));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/remitos", remitoRoutes);
app.use("/api/usuarios", usuarioRoutes);

// Rutas para servir archivos HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "auth", "login.html"));
});

app.get("/registro", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "auth", "registro.html"));
});

app.get("/documentos", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "documentos", "documento.html"));
});

app.get("/remitos", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "remitos", "remito.html"));
});

app.get("/usuarios", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "usuarios", "usuario.html"));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});