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
                localStorage.setItem("usuario", JSON.stringify(data.usuario));
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
    document.getElementById("form-documento").addEventListener("submit", async function(event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo").value.trim();
        const tipo = document.getElementById("tipo").value.trim();
        const fecha_recepcion = document.getElementById("fecha_recepcion").value;
        const remitente = document.getElementById("remitente").value.trim();
        const destino = document.getElementById("destino").value.trim();
        const observaciones = document.getElementById("observaciones").value.trim();
        const estado = document.getElementById("estado").value;

        try {
            const response = await fetch("http://localhost:3000/api/documentos", {
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
                    estado
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "No se pudo registrar el documento");
                return;
            }

            alert(`Documento registrado con éxito. ID: ${data.id_documento}`);
            document.getElementById("form-documento").reset();
            document.getElementById("estado").value = "Pendiente de entrega";
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión con el servidor");
        }
    });
}

// =======================
// AÑADIR A REMITO
// =======================
if (document.getElementById("btn-agregar-remito")) {
    document.getElementById("btn-agregar-remito").addEventListener("click", function() {
        const codigo = document.getElementById("codigo").value.trim();
        const tipo = document.getElementById("tipo").value.trim();
        const fecha_recepcion = document.getElementById("fecha_recepcion").value;
        const remitente = document.getElementById("remitente").value.trim();
        const destino = document.getElementById("destino").value.trim();

        if (!codigo || !tipo || !fecha_recepcion || !remitente || !destino) {
            alert("Completa los campos obligatorios antes de añadir al remito");
            return;
        }

        alert(`Documento ${codigo} listo para asociarse a un remito con destino ${destino}`);
    });
}

// =======================
// LISTA DE DOCUMENTOS
// =======================
if (document.getElementById("tabla-documentos")) {
    cargarDocumentos();

    const buscarInput = document.getElementById("buscar-documento");
    const filtrarInput = document.getElementById("filtrar-destino");

    if (buscarInput) {
        buscarInput.addEventListener("input", function() {
            const id = this.value.trim();
            if (id) {
                buscarDocumentoPorId(id);
            } else if (!filtrarInput.value.trim()) {
                cargarDocumentos();
            }
        });
    }

    if (filtrarInput) {
        filtrarInput.addEventListener("input", function() {
            const destino = this.value.trim();
            if (destino) {
                filtrarDocumentosPorDestino(destino);
            } else if (!buscarInput.value.trim()) {
                cargarDocumentos();
            }
        });
    }
}

function formatearFecha(fecha) {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) {
        return fecha;
    }
    return fechaObj.toLocaleDateString();
}

function renderizarTablaDocumentos(data) {
    const tabla = document.getElementById("tabla-documentos").getElementsByTagName("tbody")[0];
    tabla.innerHTML = "";

    const documentos = Array.isArray(data) ? data : [data];

    if (documentos.length === 0 || !documentos[0]) {
        const fila = tabla.insertRow();
        const celda = fila.insertCell(0);
        celda.colSpan = 8;
        celda.textContent = "No se encontraron documentos";
        return;
    }

    documentos.forEach(documento => {
        const fila = tabla.insertRow();
        fila.insertCell(0).textContent = documento.id_documento;
        fila.insertCell(1).textContent = documento.codigo;
        fila.insertCell(2).textContent = documento.tipo;
        fila.insertCell(3).textContent = formatearFecha(documento.fecha_recepcion);
        fila.insertCell(4).textContent = documento.remitente;
        fila.insertCell(5).textContent = documento.destino;
        fila.insertCell(6).textContent = documento.estado;
        fila.insertCell(7).textContent = documento.observaciones || "";
    });
}

function cargarDocumentos() {
    fetch("http://localhost:3000/api/documentos")
        .then(response => response.json())
        .then(data => renderizarTablaDocumentos(data))
        .catch(error => {
            console.error("Error:", error);
            renderizarTablaDocumentos([]);
        });
}

function buscarDocumentoPorId(id) {
    fetch(`http://localhost:3000/api/documentos/${id}`)
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Documento no encontrado");
            }
            return data;
        })
        .then(data => renderizarTablaDocumentos(data))
        .catch(error => {
            console.error("Error:", error);
            renderizarTablaDocumentos([]);
        });
}

function filtrarDocumentosPorDestino(destino) {
    fetch(`http://localhost:3000/api/documentos/destino/${encodeURIComponent(destino)}`)
        .then(response => response.json())
        .then(data => renderizarTablaDocumentos(data))
        .catch(error => {
            console.error("Error:", error);
            renderizarTablaDocumentos([]);
        });
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
