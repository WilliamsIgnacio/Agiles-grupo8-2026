$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$envFile = Join-Path $projectRoot ".env"
if (-not (Test-Path $envFile)) {
    throw "No existe el archivo .env en $projectRoot. Crealo con tus variables de PostgreSQL."
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') {
        return
    }

    $parts = $_ -split "=", 2
    if ($parts.Count -eq 2) {
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        Set-Item -Path "Env:$name" -Value $value
    }
}

if (-not $env:DB_USER -or -not $env:DB_PASSWORD -or -not $env:DB_HOST -or -not $env:DB_PORT -or -not $env:DB_NAME) {
    throw "Faltan variables de entorno en .env: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME."
}

if (-not $env:DB_SSLMODE) {
    $env:DB_SSLMODE = "disable"
}

if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = "postgres://$env:DB_USER`:$env:DB_PASSWORD@$env:DB_HOST`:$env:DB_PORT/$env:DB_NAME?sslmode=$env:DB_SSLMODE"
}

Write-Host "Ejecutando migraciones..."
Write-Host "Host: $env:DB_HOST:$env:DB_PORT"
Write-Host "DB: $env:DB_NAME"
Write-Host "SSL mode: $env:DB_SSLMODE"
Write-Host "URL: postgres://$env:DB_USER@<host>:<port>/$env:DB_NAME?sslmode=$env:DB_SSLMODE"

try {
    migrate -path migrations -database $env:DATABASE_URL up
}
catch {
    Write-Host "La conexión falló. Si el servidor exige SSL, prueba con DB_SSLMODE=require o require/enable según tu configuración."
    throw
}
