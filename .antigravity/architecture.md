# Arquitectura: Geoportal Eurocervezas

## Arquitectura Frontend
Se utiliza React con Vite para el empaquetado, siguiendo una arquitectura orientada a características (Feature-Sliced Design / Feature-based structure). El estado de la aplicación se gestiona mediante hooks personalizados para evitar lógica compleja en componentes visuales.

## Estructura de Carpetas
```
src/
  app/              # Punto de entrada y enrutamiento
  features/         # Módulos funcionales de la aplicación
    map/            # Componentes, hooks y utilidades del mapa
    filters/        # Controles y lógica de filtrado
    stores/         # UI y servicios para el manejo de tiendas
    dashboard/      # Paneles de KPIs y resúmenes
    catalog/        # (Futuro) Catálogo de cervezas
    admin/          # (Futuro) Paneles de importación y edición
  shared/           # Elementos reutilizables en toda la aplicación
    components/     # Botones, modales, componentes UI base
    services/       # Clientes externos (e.g. Supabase)
    utils/          # Constantes, formateadores, validadores
  data/             # Mocks iniciales o datos estáticos
  styles/           # Archivos CSS globales (Tailwind)
  scripts/          # Scripts de utilidades (e.g. parseo de Excel)
  supabase/         # Definiciones de base de datos y migraciones
```

## Patrones de Componentes
- **Separación de Responsabilidades**: Los componentes visuales (UI) solo se encargan de renderizar. Los custom hooks proveen datos y estado.
- **Componentes Pequeños**: Fragmentar interfaces complejas en piezas pequeñas y reutilizables.
- **Mock First**: Mientras Supabase no esté conectado, los datos se obtendrán de mocks en `src/data/`.

## Flujo Frontend -> Supabase
- Las interacciones de UI ejecutan funciones en los hooks.
- Los hooks delegan a los servicios de datos (`storesService.js`).
- Los servicios interactúan con Supabase REST API mediante `supabaseClient.js`.

## Servicios de Datos
Se encapsulará toda la interacción con orígenes de datos dentro de `services`. Durante la Beta, se usarán datos en memoria pre-parseados del Excel. Eventualmente se conectará a las tablas y RPCs de Supabase.

## Decisiones sobre Mapas
- **Librería**: Leaflet o MapLibre GL JS (pendiente confirmación definitiva basada en necesidades 3D/vectoriales; empezaremos con Leaflet o MapLibre si se requieren tiles vectoriales).
- **Marcadores**: Se agruparán usando clustering si la densidad es muy alta (`MarkerCluster`).

## Criterios de Escalabilidad
- Todas las capas de acceso a datos deben estar desacopladas del mapa para poder cambiar o ampliar la capa de visualización sin reescribir lógica de negocio.
- Uso de variables de entorno para las credenciales de Supabase.
