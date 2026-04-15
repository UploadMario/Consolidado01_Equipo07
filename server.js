const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "view")));
app.use(
  session({
    secret: "secreto",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

// Rutas de la API
const authRoutes = require("./routes/authRoutes");
const documentoRoutes = require("./routes/documentoRoutes");
const remitoRoutes = require("./routes/remitoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/remitos", remitoRoutes);
app.use("/api/usuarios", usuarioRoutes);

// Rutas para servir archivos HTML
app.get("/", (req, res) => {
  res.redirect("/auth/login.html"); // Redirigir la raíz a login.html
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "auth", "login.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "index.html"));
});

app.get("/documentos", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "documentos", "documento.html"));
});

app.get("/lista", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "documentos", "lista.html"));
});

app.get("/remitos", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "remitos", "remito.html"));
});

app.get("/usuarios", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "usuarios", "usuario.html"));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
