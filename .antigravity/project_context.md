# Contexto del Proyecto: Geoportal Eurocervezas

## Qué se está construyendo
Un geoportal web interactivo para visualizar las tiendas de cadenas comerciales donde existen productos catalogados de Eurocervezas.

## Objetivo general
Proporcionar una herramienta visual y analítica para conocer la cobertura territorial, filtrar por cadena y formatos, y entender la profundidad de catálogo en cada tienda (productos catalogados).

## Stack técnico
- React
- Vite
- Tailwind CSS
- Leaflet / MapLibre GL JS
- Supabase (Postgres, PostGIS, REST API, Storage, Auth)
- Despliegue en Vercel, Netlify o Cloudflare Pages

## Alcance de la beta
Visualizar tiendas de CHEDRAUI y LA COMER extraídas de `Listado de Tiendas_Augusto.xlsx`.
Funcionalidades principales:
- Mapa interactivo con puntos de tiendas.
- Filtros por cadena, formato, estado, y profundidad de catálogo.
- Detección visual de tiendas sin coordenadas o con coordenadas sospechosas.
- Panel lateral o pop-up con detalles de cada tienda.
- Panel de KPIs básicos.

## Alcance futuro
- Catálogo detallado de cervezas por tienda.
- Visualización de inventario real (availability).
- Módulo de eventos y catas.
- Panel administrativo completo para gestionar tiendas y catálogos.

## Restricciones principales
- No usar servidor dedicado, VPS, cPanel, EC2, ni DigitalOcean. Usar Supabase.
- No inventar datos faltantes (municipio, localidad, código postal, dirección, inventario detallado).
- Preservar los valores originales del Excel en columnas "raw".

## Estado actual del desarrollo
- Inicialización del proyecto y definición de reglas de contexto.
