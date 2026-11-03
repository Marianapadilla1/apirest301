# API REST de productos

API sencilla construida con Node.js, Express y `mysql2` para administrar productos en la tabla `tb_productos` de `db_tienda_mariana`.

## Requisitos

- Node.js 18 o posterior
- MySQL

## Instalación y configuración

```bash
npm install
cp .env.example .env
```

Configura en `.env` el host, puerto, usuario, contraseña y nombre de tu base de datos. Para crear la base y la tabla, ejecuta el contenido de `sql/schema.sql` en MySQL.

## Iniciar

```bash
npm start
```

En desarrollo, `npm run dev` inicia el servidor con reinicio automático. La API estará disponible en `http://localhost:3000/api`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista todos los productos |
| GET | `/api/productos/:id` | Consulta un producto |
| POST | `/api/productos` | Crea un producto |
| PUT | `/api/productos/:id` | Reemplaza los datos de un producto |
| PATCH | `/api/productos/:id` | Actualiza uno o más campos |
| DELETE | `/api/productos/:id` | Elimina un producto |

Ejemplo de cuerpo para crear o reemplazar un producto:

```json
{
  "nombre": "Café",
  "descripcion": "Café molido",
  "precio": 35.5,
  "stock": 10,
  "activo": true,
  "fk_clave_cat": null
}
```

`nombre` y `precio` son obligatorios al crear o reemplazar. `descripcion`, `stock`, `activo` y `fk_clave_cat` son opcionales; por omisión se guardan como `null`, `0`, `1` y `null`, respectivamente. Los errores se devuelven como JSON con la propiedad `error`; una consulta de un producto inexistente responde `404`.

## Pruebas

```bash
npm test
```

Las pruebas usan una base de datos simulada; para iniciar el servidor normal sí se requiere una conexión MySQL disponible.