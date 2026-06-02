# Contrato de Datos: Geoportal Eurocervezas

## Esquema Principal: `stores`
Esta tabla alojará la información unificada de todas las tiendas.

### Campos de Base de Datos
- `id`: Identificador único (UUID).
- `source_sheet`: Hoja de origen ('CHEDRAUI' o 'LA COMER').
- `chain`: Nombre de la cadena comercial.
- `store_code`: Código único de la tienda (si aplica, derivado de 'Centro').
- `center_name`: Nombre del centro / tienda.
- `store_format`: Formato de la tienda (e.g. Selecto, Mega, Super Chedraui).
- `state_raw`: Estado tal cual viene en el Excel.
- `state_normalized`: Estado normalizado para filtros limpios.
- `municipio`: (Futuro)
- `municipio_normalized`: (Futuro)
- `localidad`: (Futuro)
- `localidad_normalized`: (Futuro)
- `codigo_postal`: (Futuro)
- `colonia`: (Futuro)
- `address_raw`: Dirección cruda (puede contener URLs como en La Comer).
- `address_url`: URL de Google Maps (extraída si aplica).
- `direccion_completa`: (Futuro)
- `latitude`: Latitud validada (numérica).
- `longitude`: Longitud validada (numérica, debe ser negativa en MX).
- `latitude_raw`: Valor crudo del Excel para latitud.
- `longitude_raw`: Valor crudo del Excel para longitud.
- `geom`: (PostGIS Geometry - Punto)
- `participation_percentage`: Porcentaje de participación (`% Part`).
- `cataloged_products_count`: Cantidad de productos catalogados.
- `needs_geocoding`: Booleano, indica si faltan coordenadas.
- `needs_review`: Booleano, indica si los datos son sospechosos.
- `data_quality_notes`: Notas textuales sobre limpieza (e.g. 'Longitud positiva corregida').
- `active`: Booleano (soft delete).
- `created_at`: Timestamp.
- `updated_at`: Timestamp.

## Reglas de Mapeo por Cadena

### CHEDRAUI
- Tienda -> `store_code`
- Centro -> `center_name`
- Formato -> `store_format`
- Estado -> `state_raw`
- % Part -> `participation_percentage`
- Productos catalogados -> `cataloged_products_count`
- Columna G -> `latitude_raw`
- Columna H -> `longitude_raw`

### LA COMER
- Tienda -> `store_code`
- Centro -> `center_name`
- Formato -> `store_format`
- Estado -> `state_raw`
- % Part -> `participation_percentage`
- Productos catalogados -> `cataloged_products_count`
- Direccion -> `address_raw`
- Latitud -> `latitude_raw`
- Longitud -> `longitude_raw`

## Reglas de Limpieza y Validación
- **No inventar**: Municipio, Localidad, Código Postal y Dirección completa quedan vacíos si no vienen en origen.
- **Productos catalogados**: Representan profundidad del catálogo (cuántas etiquetas distintas manejan), NO el inventario disponible.
- **Validación de coordenadas**: Si `longitude_raw` es un número positivo y pertenece a México, marcar como `needs_review = true` (y opcionalmente corregirlo multiplicando por -1 en `longitude` con nota en `data_quality_notes` si la regla se aprueba formalmente).
- **Incompletos**: Si no hay lat/lng válidas, marcar `needs_geocoding = true`.
