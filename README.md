# Agiles-grupo8-2026

## Ejecutar con Docker Compose

Requiere Docker Desktop. Desde la raíz del repositorio:

```bash
docker compose up --build
```

La aplicación web queda disponible en `http://localhost:3000` y la API en
`http://localhost:8080`. Prometheus queda disponible en `http://localhost:9090`
y Grafana en `http://localhost:3001` (usuario y contraseña predeterminados:
`admin`/`admin`). Compose crea PostgreSQL, espera a que esté disponible,
ejecuta las migraciones y luego inicia la API, el frontend y el monitoreo.

La API expone sus métricas en `http://localhost:8080/metrics`. Grafana se
configura automáticamente con Prometheus como datasource y muestra el
dashboard `Histodle API`, con requests por segundo, latencia p95, códigos HTTP
y errores 5xx.

Los valores por defecto de la base son `histodle` para usuario, contraseña y
nombre. Se pueden sobrescribir mediante un archivo `.env` en la raíz:

```env
DB_USER=histodle
DB_PASSWORD=histodle
DB_NAME=histodle
DB_PORT=5432
API_PORT=8080
WEB_PORT=3000
VITE_API_URL=http://localhost:8080
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

Para detener los servicios:

```bash
docker compose down
```

Para detenerlos y eliminar también los datos persistidos de PostgreSQL:

```bash
docker compose down -v
```