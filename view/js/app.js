// =======================
// LOGIN
// =======================
if (document.getElementById("form-login")) {
    document.getElementById("form-login").addEventListener("submit", function(event) {
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
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById("error-login").textContent = data.error;
            } else {
                alert("Login exitoso");

                // 🔐 GUARDAR USUARIO
                localStorage.setItem("usuario", JSON.stringify(data.usuario));

                // 🚀 IR A DOCUMENTO (pantalla principal)
                window.location.href = "../documentos/documento.html";
            }
        })
        .catch(error => console.error("Error:", error));
    });
}

// =======================
// DOCUMENTOS (REGISTRAR)
// =======================
if (document.getElementById("form-documento")) {
    document.getElementById("form-documento").addEventListener("submit", function(event) {
        event.preventDefault();

        const tipo_documento = document.getElementById("tipo_documento").value;
        const fecha_recepcion = document.getElementById("fecha_recepcion").value;
        const remitente = document.getElementById("remitente").value;
        const despacho_destino = document.getElementById("despacho_destino").value;
        const estado = document.getElementById("estado").value;

        fetch("http://localhost:3000/api/documentos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tipo_documento, fecha_recepcion, remitente, despacho_destino, estado }),
        })
        .then(response => response.json())
        .then(data => {
            alert("Documento registrado con éxito");
            document.getElementById("form-documento").reset();
        })
        .catch(error => console.error("Error:", error));
    });
}

// =======================
// AÑADIR A REMITO
// =======================
if (document.getElementById("btn-agregar-remito")) {
    document.getElementById("btn-agregar-remito").addEventListener("click", function() {

        const tipo_documento = document.getElementById("tipo_documento").value;
        const fecha_recepcion = document.getElementById("fecha_recepcion").value;
        const remitente = document.getElementById("remitente").value;
        const despacho_destino = document.getElementById("despacho_destino").value;

        if (!tipo_documento || !fecha_recepcion || !remitente || !despacho_destino) {
            alert("Completa todos los campos antes de añadir al remito");
            return;
        }

        alert(`Documento añadido al remito para ${despacho_destino}`);
    });
}

// =======================
// LISTA DE DOCUMENTOS
// =======================
if (document.getElementById("tabla-documentos")) {
    cargarDocumentos();

    document.getElementById("buscar-documento").addEventListener("input", function() {
        const id = this.value;
        if (id) {
            buscarDocumentoPorId(id);
        } else {
            cargarDocumentos();
        }
    });

    document.getElementById("filtrar-despacho").addEventListener("input", function() {
        const despacho = this.value;
        if (despacho) {
            filtrarDocumentosPorDespacho(despacho);
        } else {
            cargarDocumentos();
        }
    });
}

function cargarDocumentos() {
    fetch("http://localhost:3000/api/documentos")
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("tabla-documentos").getElementsByTagName("tbody")[0];
            tabla.innerHTML = "";

            data.forEach(documento => {
                const fila = tabla.insertRow();

                fila.insertCell(0).textContent = documento.id;
                fila.insertCell(1).textContent = documento.tipo_documento;
                fila.insertCell(2).textContent = new Date(documento.fecha_recepcion).toLocaleString();
                fila.insertCell(3).textContent = documento.remitente;
                fila.insertCell(4).textContent = documento.despacho_destino;
                fila.insertCell(5).textContent = documento.estado;
            });
        })
        .catch(error => console.error("Error:", error));
}

function buscarDocumentoPorId(id) {
    fetch(`http://localhost:3000/api/documentos/${id}`)
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("tabla-documentos").getElementsByTagName("tbody")[0];
            tabla.innerHTML = "";

            const fila = tabla.insertRow();
            fila.insertCell(0).textContent = data.id;
            fila.insertCell(1).textContent = data.tipo_documento;
            fila.insertCell(2).textContent = new Date(data.fecha_recepcion).toLocaleString();
            fila.insertCell(3).textContent = data.remitente;
            fila.insertCell(4).textContent = data.despacho_destino;
            fila.insertCell(5).textContent = data.estado;
        })
        .catch(error => console.error("Error:", error));
}

function filtrarDocumentosPorDespacho(despacho) {
    fetch(`http://localhost:3000/api/documentos/despacho/${despacho}`)
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("tabla-documentos").getElementsByTagName("tbody")[0];
            tabla.innerHTML = "";

            data.forEach(documento => {
                const fila = tabla.insertRow();

                fila.insertCell(0).textContent = documento.id;
                fila.insertCell(1).textContent = documento.tipo_documento;
                fila.insertCell(2).textContent = new Date(documento.fecha_recepcion).toLocaleString();
                fila.insertCell(3).textContent = documento.remitente;
                fila.insertCell(4).textContent = documento.despacho_destino;
                fila.insertCell(5).textContent = documento.estado;
            });
        })
        .catch(error => console.error("Error:", error));
}

// =======================
// REMITOS (CREAR)
// =======================
if (document.getElementById("form-remito")) {
    document.getElementById("form-remito").addEventListener("submit", function(event) {
        event.preventDefault();

        const despacho_destino = document.getElementById("despacho_destino").value;
        const descripcion = document.getElementById("descripcion").value;
        const documentosIds = document.getElementById("documentos").value
            .split(",")
            .map(id => id.trim());

        fetch("http://localhost:3000/api/remitos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cantidad_documentos: documentosIds.length,
                descripcion,
                fecha_emision: new Date().toISOString(),
                despacho_destino,
                documentos: documentosIds
            }),
        })
        .then(response => response.json())
        .then(data => {
            alert("Remito creado con éxito");
            document.getElementById("form-remito").reset();
            cargarRemitos();
        })
        .catch(error => console.error("Error:", error));
    });
}

// =======================
// CARGAR REMITOS
// =======================
if (document.getElementById("tabla-remitos")) {
    cargarRemitos();
}

function cargarRemitos() {
    fetch("http://localhost:3000/api/remitos")
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("tabla-remitos").getElementsByTagName("tbody")[0];
            tabla.innerHTML = "";

            data.forEach(remito => {
                const fila = tabla.insertRow();

                fila.insertCell(0).textContent = remito.id;
                fila.insertCell(1).textContent = remito.despacho_destino;
                fila.insertCell(2).textContent = remito.descripcion;
                fila.insertCell(3).textContent = remito.cantidad_documentos;
                fila.insertCell(4).textContent = new Date(remito.fecha_emision).toLocaleString();
                fila.insertCell(5).textContent = remito.estado;

                const celdaAcciones = fila.insertCell(6);

                if (remito.estado === "Pendiente") {
                    const botonEnviar = document.createElement("button");
                    botonEnviar.textContent = "Enviar";
                    botonEnviar.onclick = () => enviarRemito(remito.id);
                    celdaAcciones.appendChild(botonEnviar);
                }
            });
        })
        .catch(error => console.error("Error:", error));
}

// =======================
// ENVIAR REMITO
// =======================
function enviarRemito(remitoId) {
    fetch(`http://localhost:3000/api/remitos/${remitoId}/enviar`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => {
        alert("Remito enviado con éxito");
        cargarRemitos();
    })
    .catch(error => console.error("Error:", error));
}

// =======================
// USUARIOS
// =======================
if (document.getElementById("form-usuario")) {
    document.getElementById("form-usuario").addEventListener("submit", function(event) {
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
        .then(response => response.json())
        .then(data => {
            alert("Usuario registrado con éxito");
            document.getElementById("form-usuario").reset();
            cargarUsuarios();
        })
        .catch(error => console.error("Error:", error));
    });
}

if (document.getElementById("tabla-usuarios")) {
    cargarUsuarios();
}

function cargarUsuarios() {
    fetch("http://localhost:3000/api/usuarios")
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("tabla-usuarios").getElementsByTagName("tbody")[0];
            tabla.innerHTML = "";

            data.forEach(usuario => {
                const fila = tabla.insertRow();

                fila.insertCell(0).textContent = usuario.id;
                fila.insertCell(1).textContent = usuario.nombre;
                fila.insertCell(2).textContent = usuario.correo;
                fila.insertCell(3).textContent = usuario.rol;

                const celdaAcciones = fila.insertCell(4);

                const botonEliminar = document.createElement("button");
                botonEliminar.textContent = "Eliminar";
                botonEliminar.onclick = () => eliminarUsuario(usuario.id);

                celdaAcciones.appendChild(botonEliminar);
            });
        })
        .catch(error => console.error("Error:", error));
}

function eliminarUsuario(usuarioId) {
    fetch(`http://localhost:3000/api/usuarios/${usuarioId}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert("Usuario eliminado con éxito");
        cargarUsuarios();
    })
    .catch(error => console.error("Error:", error));
}

// =======================
// CONTROL DE SESION
// =======================
const usuario = JSON.parse(localStorage.getItem("usuario"));

// 🚫 bloquear acceso si no hay login
if (!usuario && !window.location.pathname.includes("login.html")) {
    window.location.href = "../auth/login.html";
}

// 👤 ocultar gestión de usuarios si no es admin
if (document.getElementById("btn-usuarios")) {
    if (!usuario || usuario.rol !== "admin") {
        document.getElementById("btn-usuarios").style.display = "none";
    }
}

// 🔓 logout
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "../auth/login.html";
}