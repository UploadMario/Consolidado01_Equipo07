const API_BASE = "http://localhost:3000/api";

<<<<<<< HEAD
async function fetchJSON(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
=======
        const correo = document.getElementById("correo").value;
        const contrasena = document.getElementById("contrasena").value;

        fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // 👈 IMPORTANTE PARA SESSION
            body: JSON.stringify({ correo, contrasena }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert("Login exitoso");

                // guardar usuario
                localStorage.setItem("usuario", JSON.stringify(data.usuario));

                // redirigir a documento
                window.location.href = "../documentos/documento.html";
            }
        })
        .catch(error => console.error("Error:", error));
    });
}

// =======================
// DOCUMENTOS (REGISTRAR) ✅ CORREGIDO
// =======================
if (document.getElementById("form-documento")) {
    document.getElementById("form-documento").addEventListener("submit", function(event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo").value;
        const tipo = document.getElementById("tipo").value;
        const fecha_recepcion = document.getElementById("fecha_recepcion").value;
        const remitente = document.getElementById("remitente").value;
        const destino = document.getElementById("destino").value;

        fetch("http://localhost:3000/api/documentos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // 🔥 IMPORTANTE
            body: JSON.stringify({
                tipo_documento: tipo,
                fecha_recepcion,
                remitente,
                despacho_destino: destino
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

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

                fila.insertCell(0).textContent = documento.id_documento;
                fila.insertCell(1).textContent = documento.codigo;
                fila.insertCell(2).textContent = documento.tipo;
                fila.insertCell(3).textContent = new Date(documento.fecha_recepcion).toLocaleString();
                fila.insertCell(4).textContent = documento.remitente;
                fila.insertCell(5).textContent = documento.destino;
            });
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

                fila.insertCell(0).textContent = documento.id_documento;
                fila.insertCell(1).textContent = documento.codigo;
                fila.insertCell(2).textContent = documento.tipo;
                fila.insertCell(3).textContent = new Date(documento.fecha_recepcion).toLocaleString();
                fila.insertCell(4).textContent = documento.remitente;
                fila.insertCell(5).textContent = documento.destino;
            });
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
>>>>>>> 1950aed26938d00186874f3b69d5fd8eda3f0c6e
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    const text = await response.text();
    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch (_error) {
        data = { raw: text };
    }

    if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error en la solicitud");
    }

    return data;
}

async function obtenerSesion() {
    try {
        const data = await fetchJSON(`${API_BASE}/auth/me`, { method: "GET" });
        return data.usuario;
    } catch (_error) {
        return null;
    }
}

async function protegerVista() {
    const esLogin = !!document.getElementById("form-login");
    const usuario = await obtenerSesion();

    if (esLogin && usuario) {
        window.location.href = "/inicio";
        return null;
    }

    if (!esLogin && !usuario) {
        window.location.href = "/login";
        return null;
    }

    if (usuario) {
        const btnUsuarios = document.getElementById("btn-usuarios");
        if (btnUsuarios && usuario.rol === "admin") {
            btnUsuarios.style.display = "inline-block";
        }

        const bienvenida = document.getElementById("texto-bienvenida");
        if (bienvenida) {
            bienvenida.textContent = `Sesión iniciada como ${usuario.nombre} (${usuario.rol})`;
        }
    }

    return usuario;
}

async function logout() {
    try {
        await fetchJSON(`${API_BASE}/auth/logout`, { method: "POST" });
    } catch (_error) {
        // Ignorar, igual redirigimos.
    }
    window.location.href = "/login";
}
window.logout = logout;

function formatearFecha(fecha) {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleString("es-PE");
}

function formatearFechaSimple(fecha) {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleDateString("es-PE");
}

async function inicializar() {
    const usuario = await protegerVista();
    const esLogin = !!document.getElementById("form-login");

    if (esLogin || !usuario) {
        inicializarLogin();
        return;
    }

    inicializarDocumentos();
    inicializarRemitos();
    inicializarUsuarios(usuario);
}

function inicializarLogin() {
    const formLogin = document.getElementById("form-login");
    if (!formLogin) return;

    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();
        const correo = document.getElementById("correo").value.trim();
        const contrasena = document.getElementById("contrasena").value;
        const errorLogin = document.getElementById("error-login");
        errorLogin.textContent = "";

        try {
            await fetchJSON(`${API_BASE}/auth/login`, {
                method: "POST",
                body: JSON.stringify({ correo, contrasena }),
            });
            window.location.href = "/inicio";
        } catch (error) {
            errorLogin.textContent = error.message;
        }
    });
}

function inicializarDocumentos() {
    const formDocumento = document.getElementById("form-documento");
    if (formDocumento) {
        formDocumento.addEventListener("submit", async (event) => {
            event.preventDefault();

            const payload = {
                codigo: document.getElementById("codigo").value.trim(),
                tipo: document.getElementById("tipo").value.trim(),
                fecha_recepcion: document.getElementById("fecha_recepcion").value,
                remitente: document.getElementById("remitente").value.trim(),
                destino: document.getElementById("destino").value.trim(),
                observaciones: document.getElementById("observaciones").value.trim(),
                estado: document.getElementById("estado").value,
            };

            try {
                const data = await fetchJSON(`${API_BASE}/documentos`, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                alert(`Documento registrado con éxito. ID: ${data.id_documento}`);
                formDocumento.reset();
                document.getElementById("estado").value = "Pendiente de entrega";
            } catch (error) {
                alert(error.message);
            }
        });
    }

    const tablaDocumentos = document.getElementById("tabla-documentos");
    if (tablaDocumentos) {
        cargarDocumentos();

        const buscarInput = document.getElementById("buscar-documento");
        const filtrarInput = document.getElementById("filtrar-destino");

        buscarInput?.addEventListener("input", async function () {
            const id = this.value.trim();
            if (id) {
                await buscarDocumentoPorId(id);
            } else if (!filtrarInput.value.trim()) {
                await cargarDocumentos();
            }
        });

        filtrarInput?.addEventListener("input", async function () {
            const destino = this.value.trim();
            if (destino) {
                await filtrarDocumentosPorDestino(destino);
            } else if (!buscarInput.value.trim()) {
                await cargarDocumentos();
            }
        });
    }
}

function renderizarTablaDocumentos(data) {
    const tbody = document.querySelector("#tabla-documentos tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const documentos = Array.isArray(data) ? data : data ? [data] : [];

    if (documentos.length === 0) {
        const fila = tbody.insertRow();
        const celda = fila.insertCell(0);
        celda.colSpan = 8;
        celda.textContent = "No se encontraron documentos";
        return;
    }

    documentos.forEach((documento) => {
        const fila = tbody.insertRow();
        fila.insertCell(0).textContent = documento.id_documento;
        fila.insertCell(1).textContent = documento.codigo;
        fila.insertCell(2).textContent = documento.tipo;
        fila.insertCell(3).textContent = formatearFechaSimple(documento.fecha_recepcion);
        fila.insertCell(4).textContent = documento.remitente;
        fila.insertCell(5).textContent = documento.destino;
        fila.insertCell(6).textContent = documento.estado;
        fila.insertCell(7).textContent = documento.observaciones || "";
    });
}

async function cargarDocumentos() {
    try {
        const data = await fetchJSON(`${API_BASE}/documentos`, { method: "GET" });
        renderizarTablaDocumentos(data);
    } catch (error) {
        console.error(error);
        renderizarTablaDocumentos([]);
    }
}

async function buscarDocumentoPorId(id) {
    try {
        const data = await fetchJSON(`${API_BASE}/documentos/${id}`, { method: "GET" });
        renderizarTablaDocumentos(data);
    } catch (error) {
        console.error(error);
        renderizarTablaDocumentos([]);
    }
}

async function filtrarDocumentosPorDestino(destino) {
    try {
        const data = await fetchJSON(`${API_BASE}/documentos/destino/${encodeURIComponent(destino)}`, { method: "GET" });
        renderizarTablaDocumentos(data);
    } catch (error) {
        console.error(error);
        renderizarTablaDocumentos([]);
    }
}

function inicializarRemitos() {
    const formRemito = document.getElementById("form-remito");
    if (formRemito) {
        formRemito.addEventListener("submit", async (event) => {
            event.preventDefault();

            const documentos = document
                .getElementById("documentos")
                .value.split(",")
                .map((id) => id.trim())
                .filter(Boolean);

            try {
                await fetchJSON(`${API_BASE}/remitos`, {
                    method: "POST",
                    body: JSON.stringify({
                        numero_remito: document.getElementById("numero_remito").value.trim(),
                        destino: document.getElementById("destino_remito").value.trim(),
                        observaciones: document.getElementById("observaciones_remito").value.trim(),
                        documentos,
                    }),
                });
                alert("Remito creado con éxito");
                formRemito.reset();
                await cargarRemitos();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (document.getElementById("tabla-remitos")) {
        cargarRemitos();
    }
}

async function cargarRemitos() {
    try {
        const data = await fetchJSON(`${API_BASE}/remitos`, { method: "GET" });
        const tbody = document.querySelector("#tabla-remitos tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach((remito) => {
            const fila = tbody.insertRow();
            fila.insertCell(0).textContent = remito.id_remito;
            fila.insertCell(1).textContent = remito.numero_remito;
            fila.insertCell(2).textContent = remito.destino;
            fila.insertCell(3).textContent = formatearFecha(remito.fecha_generacion);
            fila.insertCell(4).textContent = remito.estado;
            fila.insertCell(5).textContent = remito.cantidad_documentos;
            fila.insertCell(6).textContent = remito.observaciones || "";

            const acciones = fila.insertCell(7);
            if (remito.estado === "Pendiente") {
                const boton = document.createElement("button");
                boton.textContent = "Enviar";
                boton.addEventListener("click", async () => {
                    try {
                        await fetchJSON(`${API_BASE}/remitos/${remito.id_remito}/enviar`, {
                            method: "PUT",
                            body: JSON.stringify({}),
                        });
                        alert("Remito enviado con éxito");
                        await cargarRemitos();
                    } catch (error) {
                        alert(error.message);
                    }
                });
                acciones.appendChild(boton);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

function inicializarUsuarios(usuario) {
    const formUsuario = document.getElementById("form-usuario");
    if (formUsuario && usuario.rol === "admin") {
        formUsuario.addEventListener("submit", async (event) => {
            event.preventDefault();
            try {
                await fetchJSON(`${API_BASE}/usuarios`, {
                    method: "POST",
                    body: JSON.stringify({
                        nombre: document.getElementById("nombre").value.trim(),
                        correo: document.getElementById("correo").value.trim(),
                        contrasena: document.getElementById("contrasena").value,
                        rol: document.getElementById("rol").value,
                    }),
                });
                alert("Usuario registrado con éxito");
                formUsuario.reset();
                await cargarUsuarios();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (document.getElementById("tabla-usuarios") && usuario.rol === "admin") {
        cargarUsuarios();
    }
}

async function cargarUsuarios() {
    try {
        const data = await fetchJSON(`${API_BASE}/usuarios`, { method: "GET" });
        const tbody = document.querySelector("#tabla-usuarios tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach((usuario) => {
            const fila = tbody.insertRow();
            fila.insertCell(0).textContent = usuario.id_usuario;
            fila.insertCell(1).textContent = usuario.nombre;
            fila.insertCell(2).textContent = usuario.correo;
            fila.insertCell(3).textContent = usuario.rol;
            fila.insertCell(4).textContent = formatearFecha(usuario.fecha_creacion);

            const acciones = fila.insertCell(5);
            const botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.addEventListener("click", async () => {
                const confirmar = confirm(`¿Eliminar al usuario ${usuario.nombre}?`);
                if (!confirmar) return;
                try {
                    await fetchJSON(`${API_BASE}/usuarios/${usuario.id_usuario}`, {
                        method: "DELETE",
                    });
                    alert("Usuario eliminado con éxito");
                    await cargarUsuarios();
                } catch (error) {
                    alert(error.message);
                }
            });
            acciones.appendChild(botonEliminar);
        });
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", inicializar);
