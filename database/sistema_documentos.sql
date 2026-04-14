USE sistema_documentos;

-- TABLA: usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador') NOT NULL DEFAULT 'operador',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABLA: documentos
CREATE TABLE documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(100) NOT NULL,
    fecha_recepcion DATE NOT NULL,
    remitente VARCHAR(150) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    estado ENUM(
        'Pendiente de entrega',
        'Cargo de envío',
        'Cargo devuelto entregado',
        'No recepcionado'
    ) NOT NULL DEFAULT 'Pendiente de entrega',
    observaciones VARCHAR(255),
    id_usuario INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_documentos_codigo ON documentos(codigo);
CREATE INDEX idx_documentos_estado ON documentos(estado);

-- TABLA: remitos
CREATE TABLE remitos (
    id_remito INT AUTO_INCREMENT PRIMARY KEY,
    numero_remito VARCHAR(20) NOT NULL UNIQUE,
    destino VARCHAR(100) NOT NULL,
    fecha_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'Enviado', 'Recepcionado', 'Observado') NOT NULL DEFAULT 'Pendiente',
    observaciones VARCHAR(255),
    id_usuario INT,
    CONSTRAINT fk_remito_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_remitos_numero ON remitos(numero_remito);

-- TABLA: detalle_remito
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

-- TABLA: seguimiento
CREATE TABLE seguimiento (
    id_seguimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    estado_anterior VARCHAR(100),
    estado_nuevo VARCHAR(100) NOT NULL,
    detalle VARCHAR(255),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seguimiento_documento
        FOREIGN KEY (id_documento) REFERENCES documentos(id_documento)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- DATOS INICIALES
INSERT INTO usuarios (nombre, correo, contrasena, rol)
VALUES ('Administrador', 'admin@sistema.com', '123456', 'admin');