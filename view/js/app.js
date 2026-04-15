// =======================
// LOGIN
// =======================
if (document.getElementById("form-login")) {
  document
    .getElementById("form-login")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const correo = document.getElementById("correo").value;
      const contrasena = document.getElementById("contrasena").value;

      fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            document.getElementById("error-login").textContent = data.error;
          } else {
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
            window.location.href = "../index.html"; // Redirigir a index.html tras el login
          }
        })
        .catch((error) => console.error("Error:", error));
    });
}

// =======================
// REGISTRAR DOCUMENTO
// =======================
if (document.getElementById("form-documento")) {
  document
    .getElementById("form-documento")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      // Obtener el último número de documento para generar el código automáticamente
      fetch("http://localhost:3000/api/documentos")
        .then((response) => response.json())
        .then((data) => {
          const documentos = data.filter(
            (doc) => doc.codigo && doc.codigo.startsWith("doc"),
          );
          const ultimoDoc =
            documentos.length > 0
              ? documentos.sort((a, b) => b.id_documento - a.id_documento)[0]
              : null;
          const ultimoNumero = ultimoDoc
            ? parseInt(ultimoDoc.codigo.split("doc")[1])
            : 0;
          const codigo = `doc${(ultimoNumero + 1).toString().padStart(3, "0")}`;

          const tipo = document.getElementById("tipo").value;
          const fecha_recepcion =
            document.getElementById("fecha_recepcion").value;
          const remitente = document.getElementById("remitente").value;
          const destino = document.getElementById("destino").value;
          const observaciones = document.getElementById("observaciones").value;

          fetch("http://localhost:3000/api/documentos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              codigo,
              tipo,
              fecha_recepcion,
              remitente,
              destino,
              observaciones,
              id_usuario: usuario.id_usuario,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              alert("Documento registrado con éxito");
              document.getElementById("form-documento").reset();
            })
            .catch((error) => console.error("Error:", error));
        })
        .catch((error) => console.error("Error:", error));
    });
}

// =======================
// LISTA DE DOCUMENTOS
// =======================
if (document.getElementById("tabla-documentos")) {
  cargarDocumentos();

  document
    .getElementById("buscar-documento")
    .addEventListener("input", function () {
      const id = this.value;
      if (id) {
        buscarDocumentoPorId(id);
      } else {
        cargarDocumentos();
      }
    });

  document
    .getElementById("filtrar-destino")
    .addEventListener("input", function () {
      const destino = this.value;
      if (destino) {
        filtrarDocumentosPorDestino(destino);
      } else {
        cargarDocumentos();
      }
    });
}

function cargarDocumentos() {
  fetch("http://localhost:3000/api/documentos")
    .then((response) => response.json())
    .then((data) => {
      const tabla = document
        .getElementById("tabla-documentos")
        .getElementsByTagName("tbody")[0];
      tabla.innerHTML = "";

      data.forEach((documento) => {
        const fila = tabla.insertRow();

        fila.insertCell(0).textContent = documento.id_documento;
        fila.insertCell(1).textContent = documento.codigo;
        fila.insertCell(2).textContent = documento.tipo;
        fila.insertCell(3).textContent = new Date(
          documento.fecha_recepcion,
        ).toLocaleString();
        fila.insertCell(4).textContent = documento.remitente;
        fila.insertCell(5).textContent = documento.destino;
        fila.insertCell(6).textContent = documento.estado;

        const celdaAcciones = fila.insertCell(7);
        const usuario = JSON.parse(localStorage.getItem("usuario"));

        if (
          usuario &&
          usuario.rol === "Firmante" &&
          documento.estado === "Enviado"
        ) {
          const botonAprobar = document.createElement("button");
          botonAprobar.textContent = "Aprobar";
          botonAprobar.className = "aprobar";
          botonAprobar.onclick = () =>
            actualizarEstadoDocumento(documento.id_documento, "Aprobado");

          const botonRechazar = document.createElement("button");
          botonRechazar.textContent = "Rechazar";
          botonRechazar.className = "rechazar";
          botonRechazar.onclick = () =>
            actualizarEstadoDocumento(documento.id_documento, "Rechazado");

          celdaAcciones.appendChild(botonAprobar);
          celdaAcciones.appendChild(botonRechazar);
        }
      });

      verificarDocumentosRechazados();
    })
    .catch((error) => console.error("Error:", error));
}

function buscarDocumentoPorId(id) {
  fetch(`http://localhost:3000/api/documentos/${id}`)
    .then((response) => response.json())
    .then((data) => {
      const tabla = document
        .getElementById("tabla-documentos")
        .getElementsByTagName("tbody")[0];
      tabla.innerHTML = "";

      const fila = tabla.insertRow();
      fila.insertCell(0).textContent = data.id_documento;
      fila.insertCell(1).textContent = data.codigo;
      fila.insertCell(2).textContent = data.tipo;
      fila.insertCell(3).textContent = new Date(
        data.fecha_recepcion,
      ).toLocaleString();
      fila.insertCell(4).textContent = data.remitente;
      fila.insertCell(5).textContent = data.destino;
      fila.insertCell(6).textContent = data.estado;
    })
    .catch((error) => console.error("Error:", error));
}

function filtrarDocumentosPorDestino(destino) {
  fetch(`http://localhost:3000/api/documentos/destino/${destino}`)
    .then((response) => response.json())
    .then((data) => {
      const tabla = document
        .getElementById("tabla-documentos")
        .getElementsByTagName("tbody")[0];
      tabla.innerHTML = "";

      data.forEach((documento) => {
        const fila = tabla.insertRow();
        fila.insertCell(0).textContent = documento.id_documento;
        fila.insertCell(1).textContent = documento.codigo;
        fila.insertCell(2).textContent = documento.tipo;
        fila.insertCell(3).textContent = new Date(
          documento.fecha_recepcion,
        ).toLocaleString();
        fila.insertCell(4).textContent = documento.remitente;
        fila.insertCell(5).textContent = documento.destino;
        fila.insertCell(6).textContent = documento.estado;
      });
    })
    .catch((error) => console.error("Error:", error));
}

function actualizarEstadoDocumento(id, estado) {
  fetch(`http://localhost:3000/api/documentos/${id}/estado`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estado }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(`Documento ${estado.toLowerCase()}`);
      cargarDocumentos();
    })
    .catch((error) => console.error("Error:", error));
}

function verificarDocumentosRechazados() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario && usuario.rol === "Operador") {
    fetch("http://localhost:3000/api/documentos")
      .then((response) => response.json())
      .then((data) => {
        const documentosRechazados = data.filter(
          (doc) =>
            doc.estado === "Rechazado" && doc.id_usuario === usuario.id_usuario,
        );
        if (documentosRechazados.length > 0) {
          alert(`Tienes ${documentosRechazados.length} documentos rechazados.`);
        }
      })
      .catch((error) => console.error("Error:", error));
  }
}

// =======================
// DOCUMENTOS POR DESTINO (REMITOS)
// =======================
if (document.getElementById("documentos-por-destino")) {
  cargarDocumentosPorDestino();
}

function cargarDocumentosPorDestino() {
  fetch("http://localhost:3000/api/documentos")
    .then((response) => response.json())
    .then((data) => {
      const documentosPendientes = data.filter(
        (doc) => doc.estado === "Pendiente",
      );

      const documentosPorDestino = documentosPendientes.reduce(
        (grupos, documento) => {
          const destino = documento.destino;
          if (!grupos[destino]) {
            grupos[destino] = [];
          }
          grupos[destino].push(documento);
          return grupos;
        },
        {},
      );

      const contenedor = document.getElementById("documentos-por-destino");
      contenedor.innerHTML = "";

      for (const destino in documentosPorDestino) {
        const grupo = document.createElement("div");
        grupo.className = "destino-group";

        const titulo = document.createElement("h3");
        titulo.textContent = `Destino: ${destino}`;

        const tabla = document.createElement("table");
        tabla.innerHTML = `
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Tipo</th>
                            <th>Remitente</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${documentosPorDestino[destino]
                          .map(
                            (doc) => `
                            <tr>
                                <td>${doc.id_documento}</td>
                                <td>${doc.codigo}</td>
                                <td>${doc.tipo}</td>
                                <td>${doc.remitente}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                `;

        const botonEnviarTodo = document.createElement("button");
        botonEnviarTodo.textContent = "Enviar Todo";
        botonEnviarTodo.onclick = () =>
          enviarRemito(
            documentosPorDestino[destino].map((doc) => doc.id_documento),
            destino,
          );

        grupo.appendChild(titulo);
        grupo.appendChild(tabla);
        grupo.appendChild(botonEnviarTodo);
        contenedor.appendChild(grupo);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function enviarRemito(documentosIds, destino) {
  // Generar código de remito automáticamente
  fetch("http://localhost:3000/api/remitos")
    .then((response) => response.json())
    .then((data) => {
      const remitos = data.filter(
        (rem) => rem.codigo && rem.codigo.startsWith("rem"),
      );
      const ultimoRem =
        remitos.length > 0
          ? remitos.sort((a, b) => b.id_remito - a.id_remito)[0]
          : null;
      const ultimoNumero = ultimoRem
        ? parseInt(ultimoRem.codigo.split("rem")[1])
        : 0;
      const codigoRemito = `rem${(ultimoNumero + 1).toString().padStart(3, "0")}`;

      fetch("http://localhost:3000/api/remitos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoRemito,
          despacho_destino: destino,
          descripcion: `Se adjuntan documentos para el área de ${destino}`,
          documentos: documentosIds,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert("Remito enviado con éxito");
          cargarDocumentosPorDestino();
          actualizarEstadoDocumentos(documentosIds, "Enviado");
        })
        .catch((error) => console.error("Error:", error));
    })
    .catch((error) => console.error("Error:", error));
}

function actualizarEstadoDocumentos(ids, estado) {
  ids.forEach((id) => {
    fetch(`http://localhost:3000/api/documentos/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
    }).catch((error) => console.error("Error:", error));
  });
}

// =======================
// USUARIOS
// =======================
if (document.getElementById("form-usuario")) {
  document
    .getElementById("form-usuario")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const nombre = document.getElementById("nombre").value;
      const correo = document.getElementById("correo").value;
      const contrasena = document.getElementById("contrasena").value;
      const rol = document.getElementById("rol").value;

      fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, correo, contrasena, rol }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert("Usuario registrado con éxito");
          document.getElementById("form-usuario").reset();
          cargarUsuarios();
        })
        .catch((error) => console.error("Error:", error));
    });
}

if (document.getElementById("tabla-usuarios")) {
  cargarUsuarios();
}

function cargarUsuarios() {
  fetch("http://localhost:3000/api/usuarios")
    .then((response) => response.json())
    .then((data) => {
      const tabla = document
        .getElementById("tabla-usuarios")
        .getElementsByTagName("tbody")[0];
      tabla.innerHTML = "";

      data.forEach((usuario) => {
        const fila = tabla.insertRow();

        fila.insertCell(0).textContent = usuario.id_usuario;
        fila.insertCell(1).textContent = usuario.nombre;
        fila.insertCell(2).textContent = usuario.correo;
        fila.insertCell(3).textContent = usuario.rol;

        const celdaAcciones = fila.insertCell(4);

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.onclick = () => eliminarUsuario(usuario.id_usuario);

        celdaAcciones.appendChild(botonEliminar);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function eliminarUsuario(usuarioId) {
  fetch(`http://localhost:3000/api/usuarios/${usuarioId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Usuario eliminado con éxito");
      cargarUsuarios();
    })
    .catch((error) => console.error("Error:", error));
}

// =======================
// CONTROL DE SESIÓN
// =======================
const usuario = JSON.parse(localStorage.getItem("usuario"));

// Bloquear acceso a cualquier página que no sea login si no hay sesión
//if (!usuario && !window.location.pathname.includes("login.html")) {
//  window.location.href = "/view/auth/login.html";
//}

// Ocultar gestión de usuarios si no es admin
if (document.getElementById("btn-usuarios")) {
  if (!usuario || usuario.rol !== "admin") {
    document.getElementById("btn-usuarios").style.display = "none";
  }
}

// Logout
function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "auth/login.html";
}
