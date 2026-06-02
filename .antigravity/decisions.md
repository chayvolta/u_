# Decisiones Técnicas

## 2026-06-02 — Inicialización del Proyecto
- Contexto: El repositorio fue inicializado desde cero con un archivo Excel (`Listado de Tiendas_Augusto.xlsx`).
- Decisión: Se crea la carpeta `.antigravity` con el contexto base y reglas para preservar el enfoque a largo plazo del agente.
- Razón: Evitar la pérdida de contexto entre sesiones y mantener un estándar de codificación disciplinado sin inventar datos.
- Impacto: Define la base sobre la que todas las siguientes iteraciones se construirán. Se restringen tecnologías como VPS a favor de Supabase.

## 2026-06-02 — Modelo de Tiendas Unificado
- Contexto: El Excel contiene dos hojas separadas (CHEDRAUI y LA COMER) con estructuras de columnas ligeramente distintas.
- Decisión: CHEDRAUI y LA COMER se unifican en la tabla `stores`.
- Razón: Facilita enormemente el renderizado y filtrado en el mapa desde una única fuente de verdad.
- Impacto: Requiere un script o lógica de parsing que homogenice ambos orígenes hacia el `data_contract` común.

## 2026-06-02 — Restricciones Geográficas
- Contexto: Faltan datos geográficos granulares (municipio, localidad, CP).
- Decisión: Municipio, localidad y código postal quedan como campos nulos futuros. Nunca inventarlos ni usar APIs de geocodificación reversa a menos que se solicite explícitamente.
- Razón: Preservar la integridad de la fuente de datos.
- Impacto: Los filtros iniciales se limitarán a nivel de Estado, Cadena y Formato.
