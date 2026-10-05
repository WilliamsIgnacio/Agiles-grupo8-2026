# Migraciones

El esquema de PostgreSQL se administra con archivos SQL versionados y la CLI de `golang-migrate`. La API no modifica el esquema al iniciar.

## Instalar la CLI en Windows

La forma más simple y portable es instalarla con Go:

```powershell
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

Luego verificar:

```powershell
migrate -version
```

Si el comando no es encontrado, podés agregar el directorio de Go al `PATH` manualmente:

```powershell
$env:Path += ";$env:USERPROFILE\go\bin"
```

> Esto evita depender de `scoop`, que no siempre está instalado en la máquina del equipo.

## Configurar la conexión

Desde `histodle-api`, crear o completar el archivo `.env` con las variables requeridas:

```env
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=histodle
DB_SSLMODE=disable
DATABASE_URL=postgres://postgres:tu_password@localhost:5432/histodle?sslmode=disable
```

Si no usás el script [histodle-api/migrate.ps1](histodle-api/migrate.ps1), entonces en PowerShell hay que setear los valores reales antes de ejecutar la migración:

```powershell
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "tu_password"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "histodle"
$env:DB_SSLMODE = "disable"

$env:DATABASE_URL = "postgres://$env:DB_USER`:$env:DB_PASSWORD@$env:DB_HOST`:$env:DB_PORT/$env:DB_NAME?sslmode=$env:DB_SSLMODE"
```

> Si ya cargaste las variables desde el archivo `.env` con el script, no hace falta repetir este bloque.

## Forma recomendada: usar el script

En la carpeta `histodle-api` existe un script [histodle-api/migrate.ps1](histodle-api/migrate.ps1) que lee el `.env`, arma la URL y ejecuta las migraciones.

Ejecutarlo:

```powershell
cd \histodle-api
.\migrate.ps1
```

El script hace esto automáticamente:

- valida que exista `.env`
- lee las variables `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME` y `DB_SSLMODE`
- arma `DATABASE_URL`
- ejecuta `migrate -path migrations -database $env:DATABASE_URL up`

Esto evita que cada compañero tenga que memorizar la URL o depender de variables de shell manuales.

## Comandos manuales (solo fallback)

Si por algún motivo no querés usar el script, podés hacerlo a mano:

```powershell
migrate -path migrations -database $env:DATABASE_URL up
```

Revertir la última migración:

```powershell
migrate -path migrations -database $env:DATABASE_URL down 1
```

Ver la versión aplicada:

```powershell
migrate -path migrations -database $env:DATABASE_URL version
```

Crear una migración nueva:

```powershell
migrate create -ext sql -dir migrations -seq nombre_del_cambio
```

> La forma normal de uso del equipo debe ser el script. Los comandos manuales quedan como alternativa para debugging o ejecución directa.

## Recomendación

Mantener migraciones en SQL es la opción correcta para este proyecto. La API no crea el esquema al iniciar, por lo que el cambio de base de datos debe aplicarse mediante migraciones versionadas y reproducibles.
