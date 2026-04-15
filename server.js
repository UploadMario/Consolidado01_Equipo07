const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const documentoRoutes = require("./routes/documentoRoutes");
const remitoRoutes = require("./routes/remitoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sistema_documentos_secret_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use(express.static(path.join(__dirname, "view")));

app.use("/api/auth", authRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/remitos", remitoRoutes);
app.use("/api/usuarios", usuarioRoutes);

app.get("/", (_req, res) => {
  res.redirect("/auth/login.html");
});

app.get("/login", (_req, res) => {
  res.sendFile(path.join(__dirname, "view", "auth", "login.html"));
});

app.get("/index", (_req, res) => {
  res.sendFile(path.join(__dirname, "view", "index.html"));
});

app.get("/documentos", (_req, res) => {
  res.sendFile(path.join(__dirname, "view", "documentos", "documento.html"));
});

app.get("/lista", (_req, res) => {
  res.sendFile(path.join(__dirname, "view", "documentos", "lista.html"));
});

app.get("/remitos", (_req, res) => {
  res.sendFile(path.join(__dirname, "view", "remitos", "remito.html"));
});

app.get("/usuarios", (_req, res) => {
  res.sendFile(path.join(__dirname, "view", "usuarios", "usuario.html"));
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Recurso no encontrado" });
  }

  return res.status(404).sendFile(path.join(__dirname, "view", "auth", "login.html"));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
