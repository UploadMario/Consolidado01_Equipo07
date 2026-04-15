DROP DATABASE IF EXISTS sistema_documentos;
CREATE DATABASE sistema_documentos;
USE sistema_documentos;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'Operador', 'Firmante') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(100) NOT NULL,
    fecha_recepcion DATE NOT NULL,
    remitente VARCHAR(150) NOT NULL,
    destino ENUM('Finanzas', 'Legal', 'Archivos', 'Marketing') NOT NULL,
    estado ENUM('Pendiente de entrega', 'Cargo de envío', 'Cargo devuelto entregado', 'No recepcionado (notificado)') NOT NULL DEFAULT 'Pendiente de entrega',
    observaciones VARCHAR(255),
    id_usuario INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE remitos (
    id_remito INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    despacho_destino ENUM('Finanzas', 'Legal', 'Archivos', 'Marketing') NOT NULL,
    destinatario VARCHAR(120) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    id_usuario INT,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_remito_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE detalle_remito (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_remito INT NOT NULL,
    id_documento INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_detalle_remito
        FOREIGN KEY (id_remito) REFERENCES remitos(id_remito)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_documento
        FOREIGN KEY (id_documento) REFERENCES documentos(id_documento)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT uq_remito_documento UNIQUE (id_remito, id_documento)
) ENGINE=InnoDB;

INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Administrador', 'admin@sistema.com', '$2b$10$d.FzRMaSsOax41hYTRpXH.Of41iezevLwlbPikAOW0.G0zKV.24hO', 'admin'),
('Operador 1', 'operador1@sistema.com', '$2b$10$uqlzNXMwoCY1DAY0c.tka.DMlsvMKi1mEaRv2Ty25XiE59o/wCBgO', 'Operador'),
('Firmante 1', 'firmante1@sistema.com', '$2b$10$7WbG7ypKmLD9c3QYa4upguZkTEW0J6zaIEMUcZ8w/6Lm3LIH11lqK', 'Firmante');

INSERT INTO documentos (codigo, tipo, fecha_recepcion, remitente, destino, estado) VALUES
('DOC001', 'Oficio', '2026-04-15', 'Municipalidad de Huancayo', 'Legal', 'Pendiente de entrega'),
('DOC002', 'Informe', '2026-04-15', 'SUNAT', 'Legal', 'Pendiente de entrega'),
('DOC003', 'Carta', '2026-04-15', 'Ministerio de Salud', 'Legal', 'Pendiente de entrega'),

('DOC004', 'Memorando', '2026-04-15', 'Gerencia General', 'Finanzas', 'Pendiente de entrega'),
('DOC005', 'Solicitud', '2026-04-15', 'Proveedor XYZ', 'Finanzas', 'Pendiente de entrega'),

('DOC006', 'Reporte', '2026-04-15', 'Área de Sistemas', 'Marketing', 'Pendiente de entrega'),
('DOC007', 'Acta', '2026-04-15', 'Recursos Humanos', 'Archivos', 'Pendiente de entrega');