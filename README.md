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
SESSION_SECRET=cambiar-en-produccion
APP_ENV=development
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google/callback
COOKIE_SECURE=false
```

## Configurar Google OIDC en local

La autenticación con Google utiliza OpenID Connect sobre OAuth 2.0. Para
probarla localmente:

1. Abrir [Google Cloud Console](https://console.cloud.google.com/) y crear o
   seleccionar un proyecto.
2. Ir a **APIs y servicios > Pantalla de consentimiento OAuth**.
3. Configurar la aplicación como **Externa** para desarrollo y agregar las
   cuentas que la van a probar como usuarios de prueba.
4. Ir a **APIs y servicios > Credenciales > Crear credenciales > ID de cliente
   OAuth**.
5. Seleccionar **Aplicación web**.
6. Agregar `http://localhost:3000` en **Orígenes autorizados de JavaScript**.
7. Agregar
   `http://localhost:8080/auth/google/callback` en **URIs de redirección
   autorizados**.
8. Copiar el ID de cliente y el secreto en el archivo `.env` de la raíz del
   repositorio:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google/callback
WEB_URL=http://localhost:3000
COOKIE_SECURE=false
SESSION_SECRET=un-secreto-local-largo
```

No es necesario crear una cuenta de servicio ni contratar infraestructura de
Google Cloud para este flujo. Los scopes utilizados son `openid`, `email` y
`profile`.

Luego iniciar el entorno:

```powershell
docker compose up --build
```

Abrir `http://localhost:3000/auth` y seleccionar **Continuar con Google**.
También se puede crear una cuenta con email y contraseña. Después de iniciar
sesión localmente, la opción **Vincular Google** permite asociar ambos métodos
al mismo usuario.

Si la API se ejecuta directamente con `go run`, el archivo `.env` debe estar
en `histodle-api/.env`; con Docker Compose debe estar en la raíz, porque
Compose es quien inyecta las variables al contenedor de la API.

Para convertir explícitamente un usuario en administrador:

```powershell
docker compose exec db psql -U histodle -d histodle -c "UPDATE users SET role = 'admin' WHERE email = 'tu-email@gmail.com';"
```

Después de cambiar el rol, cerrar sesión y volver a iniciar sesión para crear
una nueva sesión con los permisos actualizados. Solo existen los roles
`user` y `admin`; el registro y el login nunca asignan el rol `admin`
automáticamente.

En producción, establecer `APP_ENV=production`, usar URLs HTTPS en `WEB_URL` y
`GOOGLE_REDIRECT_URL`, y definir un `SESSION_SECRET` propio. La API rechazará
iniciar si las cookies no son seguras o alguna URL no usa HTTPS.

La autenticación admite registro/login con email y contraseña y Google OIDC.
Un mismo usuario puede utilizar ambos métodos: luego de iniciar sesión puede
seleccionar “Vincular Google”; la vinculación es explícita y nunca se realiza
automáticamente por coincidencia de email.
Para Google, crear un cliente OAuth de tipo aplicación web y registrar
`http://localhost:8080/auth/google/callback` como redirect URI. Los usuarios
nuevos reciben el rol `user`; el primer administrador debe asignarse
explícitamente en PostgreSQL, por ejemplo:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Para detener los servicios:

```bash
docker compose down
```

Para detenerlos y eliminar también los datos persistidos de PostgreSQL:

```bash
docker compose down -v
```