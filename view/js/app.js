const API_BASE = "";
const DESTINOS = ["Finanzas", "Legal", "Archivos", "Marketing"];
const ESTADOS = [
  "Pendiente de entrega",
  "Cargo de envío",
  "Cargo devuelto entregado",
  "No recepcionado (notificado)",
];
let usuarioActual = null;
let cacheDocumentos = [];
let cacheRemitos = [];

async function apiFetch(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data?.error ? data.error : "Ocurrió un error inesperado";
    throw new Error(message);
  }

  return data;
}

function guardarUsuarioLocal(usuario) {
  usuarioActual = usuario;
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function limpiarUsuarioLocal() {
  usuarioActual = null;
  localStorage.removeItem("usuario");
}

function obtenerUsuarioLocal() {
  if (usuarioActual) {
    return usuarioActual;
  }

  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) {
    return null;
  }

  try {
    usuarioActual = JSON.parse(usuarioGuardado);
    return usuarioActual;
  } catch (_error) {
    limpiarUsuarioLocal();
    return null;
  }
}

function mostrarError(elementId, mensaje) {
  const elemento = document.getElementById(elementId);
  if (elemento) {
    elemento.textContent = mensaje;
  } else if (mensaje) {
    alert(mensaje);
  }
}

function limpiarError(elementId) {
  const elemento = document.getElementById(elementId);
  if (elemento) {
    elemento.textContent = "";
  }
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }

  const fechaObjeto = new Date(fecha);
  if (Number.isNaN(fechaObjeto.getTime())) {
    return fecha;
  }

  return fechaObjeto.toLocaleDateString("es-PE");
}

function obtenerRutaLogin() {
  return "/auth/login.html";
}

function redirigirAInicio() {
  window.location.href = "/index.html";
}

function retrocederPagina() {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  redirigirAInicio();
}

async function validarSesionActual() {
  try {
    const data = await apiFetch("/api/auth/me", { method: "GET" });
    guardarUsuarioLocal(data.usuario);
    return data.usuario;
  } catch (_error) {
    limpiarUsuarioLocal();
    return null;
  }
}

function actualizarVisibilidadPorRol() {
  const usuario = obtenerUsuarioLocal();
  const btnUsuarios = document.getElementById("btn-usuarios");

  if (btnUsuarios) {
    btnUsuarios.style.display = usuario && usuario.rol === "admin" ? "block" : "none";
  }
}

function obtenerClaseEstado(estado) {
  switch (estado) {
    case "Pendiente de entrega":
      return "badge badge-pendiente";
    case "Cargo de envío":
      return "badge badge-envio";
    case "Cargo devuelto entregado":
      return "badge badge-entregado";
    case "No recepcionado (notificado)":
      return "badge badge-no-recepcionado";
    default:
      return "badge";
  }
}

function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function esFechaNoFutura(fecha) {
  if (!fecha) {
    return false;
  }

  const valor = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(valor.getTime())) {
    return false;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return valor <= hoy;
}

function escapeHtml(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dibujarFilaDocumento(tablaBody, documento) {
  const fila = tablaBody.insertRow();

  fila.insertCell(0).textContent = documento.id_documento;
  fila.insertCell(1).textContent = documento.codigo;
  fila.insertCell(2).textContent = documento.tipo;
  fila.insertCell(3).textContent = formatearFecha(documento.fecha_recepcion);
  fila.insertCell(4).textContent = documento.remitente;
  fila.insertCell(5).textContent = documento.destino;

  const celdaEstado = fila.insertCell(6);
  const badge = document.createElement("span");
  badge.className = obtenerClaseEstado(documento.estado);
  badge.textContent = documento.estado;
  celdaEstado.appendChild(badge);

  fila.insertCell(7).textContent = documento.usuario_registro || "-";

  const celdaAcciones = fila.insertCell(8);
  const usuario = obtenerUsuarioLocal();

  if (usuario && usuario.rol === "Firmante" && documento.estado === "Cargo de envío") {
    const contenedor = document.createElement("div");
    contenedor.className = "action-group";

    const botonEntregado = document.createElement("button");
    botonEntregado.textContent = "Recepcionado";
    botonEntregado.className = "action-approve";
    botonEntregado.onclick = () => actualizarEstadoDocumento(documento.id_documento, "Cargo devuelto entregado");

    const botonNoRecepcionado = document.createElement("button");
    botonNoRecepcionado.textContent = "No recepcionado";
    botonNoRecepcionado.className = "action-reject";
    botonNoRecepcionado.onclick = () => actualizarEstadoDocumento(documento.id_documento, "No recepcionado (notificado)");

    contenedor.appendChild(botonEntregado);
    contenedor.appendChild(botonNoRecepcionado);
    celdaAcciones.appendChild(contenedor);
  } else {
    celdaAcciones.textContent = "-";
  }
}

async function cargarDocumentos() {
  try {
    const codigo = document.getElementById("buscar-codigo")?.value.trim() || "";
    const destino = document.getElementById("filtrar-destino")?.value || "";
    const estado = document.getElementById("filtrar-estado")?.value || "";
    const query = new URLSearchParams();

    if (codigo) query.set("codigo", codigo);
    if (destino) query.set("destino", destino);
    if (estado) query.set("estado", estado);

    const ruta = query.toString() ? `/api/documentos?${query.toString()}` : "/api/documentos";
    const data = await apiFetch(ruta, { method: "GET" });
    cacheDocumentos = data;

    const tabla = document.getElementById("tabla-documentos")?.getElementsByTagName("tbody")[0];
    if (!tabla) {
      return;
    }

    tabla.innerHTML = "";
    if (data.length === 0) {
      tabla.innerHTML = `<tr><td colspan="9">No se encontraron documentos con los filtros aplicados.</td></tr>`;
      return;
    }

    data.forEach((documento) => dibujarFilaDocumento(tabla, documento));
    verificarDocumentosRequierenAtencion(data);
  } catch (error) {
    mostrarError("error-lista-documentos", error.message);
  }
}

async function actualizarEstadoDocumento(id, estado) {
  try {
    await apiFetch(`/api/documentos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    });
    alert(`Estado actualizado a: ${estado}`);
    await cargarDocumentos();
  } catch (error) {
    alert(error.message);
  }
}

function verificarDocumentosRequierenAtencion(documentos = []) {
  const usuario = obtenerUsuarioLocal();
  const aviso = document.getElementById("aviso-documentos-rechazados");
  if (!aviso) {
    return;
  }

  if (!usuario || usuario.rol !== "Operador") {
    aviso.textContent = "";
    return;
  }

  const observados = documentos.filter(
    (doc) => doc.estado === "No recepcionado (notificado)" && doc.id_usuario === usuario.id_usuario,
  );

  aviso.textContent = observados.length > 0
    ? `Tienes ${observados.length} documento(s) no recepcionado(s) que requieren seguimiento.`
    : "";
}

function renderDocumentosSeleccionables() {
  const contenedor = document.getElementById("documentos-por-destino");
  if (!contenedor) {
    return;
  }

  const destinoSeleccionado = document.getElementById("remito-destino")?.value || "";
  const pendientes = cacheDocumentos.filter((doc) => doc.estado === "Pendiente de entrega");
  const filtrados = destinoSeleccionado
    ? pendientes.filter((doc) => doc.destino === destinoSeleccionado)
    : pendientes;

  if (filtrados.length === 0) {
    contenedor.innerHTML = '<div class="empty-state">No hay documentos pendientes de entrega para el filtro seleccionado.</div>';
    return;
  }

  contenedor.innerHTML = `
    <div class="document-selector">
      ${filtrados
        .map(
          (doc) => `
            <label class="document-option">
              <input type="checkbox" class="documento-check" value="${doc.id_documento}" data-destino="${escapeHtml(doc.destino)}" />
              <div>
                <strong>${escapeHtml(doc.codigo)} · ${escapeHtml(doc.tipo)}</strong>
                <small>Remitente: ${escapeHtml(doc.remitente)}</small>
                <small>Despacho: ${escapeHtml(doc.destino)} · Fecha: ${escapeHtml(formatearFecha(doc.fecha_recepcion))}</small>
              </div>
            </label>`,
        )
        .join("")}
    </div>`;
}

async function cargarRemitos() {
  try {
    cacheDocumentos = await apiFetch("/api/documentos", { method: "GET" });
    renderDocumentosSeleccionables();

    const remitos = await apiFetch("/api/remitos", { method: "GET" });
    cacheRemitos = remitos;
    const tabla = document.getElementById("tabla-remitos")?.getElementsByTagName("tbody")[0];
    if (!tabla) {
      return;
    }

    tabla.innerHTML = "";
    if (remitos.length === 0) {
      tabla.innerHTML = `<tr><td colspan="7">Aún no se han generado remitos.</td></tr>`;
      return;
    }

    remitos.forEach((remito) => {
      const fila = tabla.insertRow();
      fila.insertCell(0).textContent = remito.codigo;
      fila.insertCell(1).textContent = remito.despacho_destino;
      fila.insertCell(2).textContent = remito.destinatario;
      fila.insertCell(3).textContent = remito.descripcion;
      fila.insertCell(4).textContent = remito.cantidad_documentos;
      fila.insertCell(5).textContent = remito.usuario_generador || "-";
      fila.insertCell(6).textContent = formatearFecha(remito.fecha_generacion);
    });
  } catch (error) {
    mostrarError("error-remitos", error.message);
  }
}

function obtenerDocumentosSeleccionados() {
  return Array.from(document.querySelectorAll(".documento-check:checked"))
    .map((elemento) => Number.parseInt(elemento.value, 10))
    .filter((id) => Number.isInteger(id) && id > 0);
}

async function generarRemito() {
  limpiarError("error-remitos");
  const despacho_destino = document.getElementById("remito-destino")?.value || "";
  const destinatario = document.getElementById("remito-destinatario")?.value.trim() || "";
  const descripcion = document.getElementById("remito-descripcion")?.value.trim() || "";
  const documentos = obtenerDocumentosSeleccionados();

  if (!DESTINOS.includes(despacho_destino)) {
    mostrarError("error-remitos", "Selecciona un despacho destino válido.");
    return;
  }

  if (destinatario.length < 3) {
    mostrarError("error-remitos", "Debes indicar a quién se envía el remito.");
    return;
  }

  if (descripcion.length < 5) {
    mostrarError("error-remitos", "La descripción del remito debe tener al menos 5 caracteres.");
    return;
  }

  if (documentos.length === 0) {
    mostrarError("error-remitos", "Debes seleccionar al menos un documento.");
    return;
  }

  try {
    const data = await apiFetch("/api/remitos", {
      method: "POST",
      body: JSON.stringify({ despacho_destino, destinatario, descripcion, documentos }),
    });

    alert(`Remito generado con éxito. Código: ${data.remito.codigo}`);
    document.getElementById("remito-destinatario").value = "";
    document.getElementById("remito-descripcion").value = "";
    await cargarRemitos();
  } catch (error) {
    mostrarError("error-remitos", error.message);
  }
}

async function cargarUsuarios() {
  try {
    const data = await apiFetch("/api/usuarios", { method: "GET" });
    const tabla = document.getElementById("tabla-usuarios")?.getElementsByTagName("tbody")[0];
    if (!tabla) {
      return;
    }

    tabla.innerHTML = "";
    data.forEach((usuario) => {
      const fila = tabla.insertRow();
      fila.insertCell(0).textContent = usuario.id_usuario;
      fila.insertCell(1).textContent = usuario.nombre;
      fila.insertCell(2).textContent = usuario.correo;
      fila.insertCell(3).textContent = usuario.rol;
      fila.insertCell(4).textContent = formatearFecha(usuario.fecha_creacion);

      const celdaAcciones = fila.insertCell(5);
      const botonEliminar = document.createElement("button");
      botonEliminar.textContent = "Eliminar";
      botonEliminar.onclick = () => eliminarUsuario(usuario.id_usuario);
      celdaAcciones.appendChild(botonEliminar);
    });
  } catch (error) {
    mostrarError("error-usuarios", error.message);
  }
}

async function eliminarUsuario(usuarioId) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) {
    return;
  }

  try {
    await apiFetch(`/api/usuarios/${usuarioId}`, { method: "DELETE" });
    alert("Usuario eliminado con éxito");
    await cargarUsuarios();
  } catch (error) {
    alert(error.message);
  }
}

async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (_error) {
    // incluso si el backend ya no tiene sesión, se limpia el estado local
  } finally {
    limpiarUsuarioLocal();
    window.location.href = obtenerRutaLogin();
  }
}

function toggleMenu() {
  document.getElementById("sidebar")?.classList.toggle("active");
  document.getElementById("sidebar-overlay")?.classList.toggle("active");
}

function inicializarLogin() {
  const formLogin = document.getElementById("form-login");
  if (!formLogin) {
    return;
  }

  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();
    limpiarError("error-login");

    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const contrasena = document.getElementById("contrasena").value;

    if (!esCorreoValido(correo)) {
      mostrarError("error-login", "Ingresa un correo válido.");
      return;
    }

    if (contrasena.length < 6) {
      mostrarError("error-login", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ correo, contrasena }),
      });

      guardarUsuarioLocal(data.usuario);
      redirigirAInicio();
    } catch (error) {
      mostrarError("error-login", error.message);
    }
  });
}

function inicializarRegistroDocumento() {
  const formDocumento = document.getElementById("form-documento");
  if (!formDocumento) {
    return;
  }

  const inputFecha = document.getElementById("fecha_recepcion");
  if (inputFecha) {
    inputFecha.max = new Date().toISOString().split("T")[0];
  }

  formDocumento.addEventListener("submit", async (event) => {
    event.preventDefault();
    limpiarError("error-documento");

    const payload = {
      tipo: document.getElementById("tipo").value.trim(),
      fecha_recepcion: document.getElementById("fecha_recepcion").value,
      remitente: document.getElementById("remitente").value.trim(),
      destino: document.getElementById("destino").value,
      observaciones: document.getElementById("observaciones").value.trim(),
    };

    if (payload.tipo.length < 3) {
      mostrarError("error-documento", "El tipo de documento debe tener al menos 3 caracteres.");
      return;
    }

    if (!esFechaNoFutura(payload.fecha_recepcion)) {
      mostrarError("error-documento", "La fecha de recepción no puede ser futura.");
      return;
    }

    if (payload.remitente.length < 3) {
      mostrarError("error-documento", "El remitente debe tener al menos 3 caracteres.");
      return;
    }

    if (!DESTINOS.includes(payload.destino)) {
      mostrarError("error-documento", "Selecciona un despacho válido.");
      return;
    }

    try {
      const data = await apiFetch("/api/documentos", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert(`Documento registrado con éxito. Código generado: ${data.documento.codigo}`);
      formDocumento.reset();
    } catch (error) {
      mostrarError("error-documento", error.message);
    }
  });
}

function inicializarListaDocumentos() {
  if (!document.getElementById("tabla-documentos")) {
    return;
  }

  cargarDocumentos();

  document.getElementById("buscar-codigo")?.addEventListener("input", () => {
    limpiarError("error-lista-documentos");
    cargarDocumentos();
  });

  document.getElementById("filtrar-destino")?.addEventListener("change", () => {
    limpiarError("error-lista-documentos");
    cargarDocumentos();
  });

  document.getElementById("filtrar-estado")?.addEventListener("change", () => {
    limpiarError("error-lista-documentos");
    cargarDocumentos();
  });

  document.getElementById("btn-limpiar-filtros")?.addEventListener("click", () => {
    document.getElementById("buscar-codigo").value = "";
    document.getElementById("filtrar-destino").value = "";
    document.getElementById("filtrar-estado").value = "";
    limpiarError("error-lista-documentos");
    cargarDocumentos();
  });
}

function inicializarRemitos() {
  if (!document.getElementById("documentos-por-destino")) {
    return;
  }

  document.getElementById("remito-destino")?.addEventListener("change", () => {
    limpiarError("error-remitos");
    renderDocumentosSeleccionables();
  });

  document.getElementById("btn-generar-remito")?.addEventListener("click", generarRemito);
  cargarRemitos();
}

function inicializarUsuarios() {
  const formUsuario = document.getElementById("form-usuario");
  if (formUsuario) {
    formUsuario.addEventListener("submit", async (event) => {
      event.preventDefault();
      limpiarError("error-usuarios");

      const payload = {
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim().toLowerCase(),
        contrasena: document.getElementById("contrasena").value,
        rol: document.getElementById("rol").value,
      };

      if (payload.nombre.length < 3) {
        mostrarError("error-usuarios", "El nombre debe tener al menos 3 caracteres.");
        return;
      }

      if (!esCorreoValido(payload.correo)) {
        mostrarError("error-usuarios", "El correo no es válido.");
        return;
      }

      if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(payload.contrasena)) {
        mostrarError("error-usuarios", "La contraseña debe incluir al menos una letra, un número y 6 caracteres.");
        return;
      }

      try {
        await apiFetch("/api/usuarios", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        alert("Usuario registrado con éxito");
        formUsuario.reset();
        await cargarUsuarios();
      } catch (error) {
        mostrarError("error-usuarios", error.message);
      }
    });
  }

  if (document.getElementById("tabla-usuarios")) {
    cargarUsuarios();
  }
}

async function protegerPantallas() {
  const esLogin = Boolean(document.getElementById("form-login"));
  if (esLogin) {
    const usuarioSesion = await validarSesionActual();
    if (usuarioSesion) {
      redirigirAInicio();
    }
    return true;
  }

  const usuarioSesion = await validarSesionActual();
  if (!usuarioSesion) {
    window.location.href = obtenerRutaLogin();
    return false;
  }

  actualizarVisibilidadPorRol();
  return true;
}

window.addEventListener("DOMContentLoaded", async () => {
  const accesoPermitido = await protegerPantallas();
  if (!accesoPermitido) {
    return;
  }

  actualizarVisibilidadPorRol();
  inicializarLogin();
  inicializarRegistroDocumento();
  inicializarListaDocumentos();
  inicializarRemitos();
  inicializarUsuarios();
});
