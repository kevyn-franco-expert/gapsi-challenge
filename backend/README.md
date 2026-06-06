# Issue Tracker API

Backend del examen práctico FullStack — Angular, Python y GCP.

## Stack

- **Python 3.12+**
- **FastAPI**
- **JWT** (python-jose)
- **bcrypt** (hash de contraseñas)
- **Google Cloud Firestore** (con fallback a mock en memoria para desarrollo local)

## Usuarios de prueba

| Usuario | Contraseña | Rol   |
|---------|------------|-------|
| admin   | admin123   | Admin |
| user    | user123    | User  |

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

```env
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
FIRESTORE_PROJECT_ID=your-gcp-project-id
```

Para desarrollo local sin GCP, usa:

```bash
export USE_MOCK_DB=true
```

## URL de Producción

- **API**: https://issue-tracker-api-356627546610.us-central1.run.app
- **Swagger UI**: https://issue-tracker-api-356627546610.us-central1.run.app/docs
- **ReDoc**: https://issue-tracker-api-356627546610.us-central1.run.app/redoc

## Ejecutar localmente

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Documentación interactiva (local)

- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## Despliegue en GCP

### Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/issue-tracker-api
gcloud run deploy issue-tracker-api \
  --image gcr.io/PROJECT_ID/issue-tracker-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SECRET_KEY=...,FIRESTORE_PROJECT_ID=...
```

### App Engine

Incluye `app.yaml` con el runtime `python312` y ejecuta:

```bash
gcloud app deploy
```

## Endpoints principales

- `POST /auth/login` — OAuth2PasswordBearer login
- `GET /auth/me` — Perfil del usuario autenticado
- `POST /issues` — Crear incidencia
- `GET /issues` — Listar incidencias (filtros: `status`, `priority`)
- `GET /issues/summary` — Resumen de KPIs
- `GET /issues/{id}` — Obtener incidencia
- `PATCH /issues/{id}` — Actualizar incidencia
- `DELETE /issues/{id}` — Eliminar incidencia
