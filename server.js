const express = require("express");
const session = require("express-session");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const documentoRoutes = require("./routes/documentoRoutes");
const remitoRoutes = require("./routes/remitoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "secreto",
    resave: false,
    saveUninitialized: false,
}));

// Solo recursos estáticos
app.use("/css", express.static(path.join(__dirname, "view", "css")));
app.use("/js", express.static(path.join(__dirname, "view", "js")));
app.use("/img", express.static(path.join(__dirname, "view", "img")));

const requireAuth = (req, res, next) => {
    if (req.session.usuario) {
        return next();
    }
    return res.redirect("/login");
};

const requireAdmin = (req, res, next) => {
    if (req.session.usuario?.rol === "admin") {
        return next();
    }
    return res.status(403).send("Acceso denegado");
};

// APIs
app.use("/api/auth", authRoutes);
app.use("/api/documentos", requireAuth, documentoRoutes);
app.use("/api/remitos", requireAuth, remitoRoutes);
app.use("/api/usuarios", requireAuth, requireAdmin, usuarioRoutes);

// Rutas principales
app.get("/", (req, res) => {
    if (req.session.usuario) {
        return res.redirect("/inicio");
    }
    return res.redirect("/login");
});

app.get("/login", (req, res) => {
    if (req.session.usuario) {
        return res.redirect("/inicio");
    }
    return res.sendFile(path.join(__dirname, "view", "auth", "login.html"));
});

app.get("/inicio", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "index.html"));
});

// Documentos
app.get("/documentos", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "documentos", "documento.html"));
});

app.get("/documentos/documento", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "documentos", "documento.html"));
});

app.get("/documentos/documento.html", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "documentos", "documento.html"));
});

app.get("/documentos/lista", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "documentos", "lista.html"));
});

app.get("/documentos/lista.html", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "documentos", "lista.html"));
});

// Remitos
app.get("/remitos", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "remitos", "remito.html"));
});

app.get("/remitos/remito", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "remitos", "remito.html"));
});

app.get("/remitos/remito.html", requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "remitos", "remito.html"));
});

// Usuarios
app.get("/usuarios", requireAuth, requireAdmin, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "usuarios", "usuario.html"));
});

app.get("/usuarios/usuario", requireAuth, requireAdmin, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "usuarios", "usuario.html"));
});

app.get("/usuarios/usuario.html", requireAuth, requireAdmin, (req, res) => {
    return res.sendFile(path.join(__dirname, "view", "usuarios", "usuario.html"));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});