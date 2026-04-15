# Sistema de Gestión de Documentos

Este proyecto implementa un sistema web para la gestión y control de documentos, desarrollado con Node.js, Express y MySQL, siguiendo una arquitectura MVC (Model - View - Controller).

---

## Estructura del Proyecto

/config Configuración de conexión a base de datos  
/model Modelos (acceso a datos)  
/controller Lógica del sistema  
/view Interfaz (HTML, CSS, JS)  
/routes Rutas del servidor  
/database Script SQL de la base de datos  
server.js Punto de inicio del servidor

---

## Base de Datos

La base de datos debe crearse manualmente con el siguiente nombre:

sistema_documentos

Luego, se debe ejecutar el archivo:

database/sistema_documentos.sql

Este archivo contiene la creación completa de las tablas del sistema:

- usuarios
- documentos
- remitos
- detalle_remito

---

## Configuración del Proyecto

1. Crear la base de datos en MySQL:

CREATE DATABASE sistema_documentos;

2. Ejecutar el script SQL:

database/sistema_documentos.sql

3. Verificar la configuración en:

config/db.js

Debe contener:

database: 'sistema_documentos'

4. Instalar dependencias:

npm install

5. Ejecutar el servidor:

node server.js

---

## Pruebas

Se pueden realizar pruebas mediante:

- scripts de prueba (test.js)
- herramientas como Postman
- integración con el frontend

---

## Notas

- Asegurarse de que MySQL esté en ejecución (por ejemplo, mediante XAMPP).
- No modificar la estructura de la base de datos sin coordinación con el equipo.
- El archivo sistema_documentos.sql es la referencia oficial para la creación de las tablas.

---

## Equipo

Proyecto desarrollado como parte de práctica de Ingeniería Web.
Castro Verastegui Juan Alejandro
Miranda Ponce Jorge Mario
Quispe Medina Willy Alexander

---

## Link de video demostrativo

https://drive.google.com/file/d/1pOmwrBuTMp0Rd3AkL78C76ZmEcv5Mgfz/view?usp=sharing
