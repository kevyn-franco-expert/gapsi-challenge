# Examen Práctico FullStack — Angular, Python y GCP

Solución completa para el examen práctico de Gapsi.

## Requisitos cumplidos

### Frontend
- [x] Angular 20+ con Standalone Components
- [x] Routing y Lazy Loading
- [x] Reactive Forms
- [x] HttpClient + Interceptors
- [x] Strict typing

### Backend
- [x] FastAPI (Python 3.12+)
- [x] Contraseñas hasheadas con bcrypt
- [x] JWT para autenticación
- [x] Documentación de usuarios de prueba

### Funcionalidades
- [x] Login / Logout
- [x] Visualizar incidencias
- [x] Crear incidencias (título, descripción, prioridad)
- [x] Actualizar estado y prioridad
- [x] Filtrar por estado o prioridad
- [x] Resumen KPI (total + por estado)

### No funcionales
- [x] Firestore como base de datos (con fallback mock para local)
- [x] Dockerfile para backend
- [x] READMEs documentados
- [x] Colección Postman incluida

## Estructura del repositorio

```
.
├── backend/          # FastAPI + Firestore
├── frontend/         # Angular + Tailwind CSS
├── postman/          # Colección Postman
└── README.md         # Este archivo
```

## Usuarios de prueba

| Usuario | Contraseña |
|---------|------------|
| admin   | admin123   |
| user    | user123    |

## Iniciar el proyecto localmente

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
USE_MOCK_DB=true uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

Abrir http://localhost:4200 e iniciar sesión con las credenciales de prueba.

## URLs de Producción (GCP)

- **Frontend**: https://issue-tracker-web-356627546610.us-central1.run.app
- **Backend API**: https://issue-tracker-api-356627546610.us-central1.run.app
- **Swagger UI**: https://issue-tracker-api-356627546610.us-central1.run.app/docs

## Postman

Importar `postman/issues-tracker-api.json` y configurar las variables:
- `base_url`: `https://issue-tracker-api-356627546610.us-central1.run.app`
- `access_token`: obtener vía endpoint `/auth/login`

## Despliegue GCP

- **Frontend**: Cloud Run (desplegado)
- **Backend**: Cloud Run (desplegado)
- **Base de datos**: Firestore (configurado)

## Contacto

Repositorio preparado para entrega del examen práctico FullStack.
