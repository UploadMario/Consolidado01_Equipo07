-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS sistema_documentos;
USE sistema_documentos;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'Operador', 'Firmante') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(100) NOT NULL,
    fecha_recepcion DATE NOT NULL,
    remitente VARCHAR(150) NOT NULL,
    destino ENUM('Finanzas', 'Legal', 'Archivos', 'Marketing') NOT NULL,
    estado ENUM('Pendiente', 'Enviado', 'Aprobado', 'Rechazado') NOT NULL DEFAULT 'Pendiente',
    observaciones VARCHAR(255),
    id_usuario INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla de remitos
CREATE TABLE IF NOT EXISTS remitos (
    id_remito INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    despacho_destino ENUM('Finanzas', 'Legal', 'Archivos', 'Marketing') NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de detalle_remito (relación entre remitos y documentos)
CREATE TABLE IF NOT EXISTS detalle_remito (
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

-- Insertar datos de ejemplo para usuarios
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Administrador', 'admin@sistema.com', '123456', 'admin'),
('Operador 1', 'operador1@sistema.com', '123456', 'Operador'),
('Firmante 1', 'firmante1@sistema.com', '123456', 'Firmante');