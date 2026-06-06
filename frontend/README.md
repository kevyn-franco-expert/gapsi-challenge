# Issue Tracker Frontend

Frontend del examen práctico FullStack — Angular, Python y GCP.

## Stack

- **Angular 20+** (Standalone Components)
- **TypeScript 5.8+**
- **Tailwind CSS 3**
- **Reactive Forms**
- **HttpClient + Interceptors**
- **Lazy Loading**

## Diseño

Implementación visual basada en el **Design System** proporcionado:
- Paleta de marca: `#e9202f` (primary), `#2e2e2e` (dark), `#000000` (sidebar)
- Tipografía: Helvetica Neue
- Layout: Sidebar fijo 260px (negro), Header 64px (blanco), contenido principal `bg-gray-50`
- Componentes: Stat Cards, Badges, Tables, Forms con estilos consistentes

## URL de Producción

- **App**: https://issue-tracker-web-356627546610.us-central1.run.app

## Ejecutar localmente

Requiere Node.js 22 LTS+.

```bash
npm install
ng serve
```

La aplicación se sirve en `http://localhost:4200`.

## Build de producción

```bash
ng build --configuration production
```

El output se genera en `dist/frontend`.

## Despliegue

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Cloud Run (con nginx)

Construir la imagen Docker con el build de producción y desplegar en Cloud Run.

## Estructura de carpetas

```
src/app/
  core/              — Auth, Guards, Interceptors, Models, Services
  features/
    auth/            — Login
    dashboard/       — Home con KPIs e incidencias recientes
    issues/          — Lista, Crear, Editar (lazy loaded)
  layout/            — Shell, Sidebar, Header
  shared/            — StatCard, Badge, etc.
```

## Funcionalidades

- Login / Logout con JWT
- Dashboard con resumen de incidencias por estado
- CRUD completo de incidencias
- Filtros por estado y prioridad
- Diseño responsive con menú móvil
