# E-commerce dockerizado: Next.js + Laravel + MySQL

## Descripción general

Ecosistema de e-commerce desarrollado durante el bootcamp y preparado para producción con Docker:

| Servicio | Tecnología | Función |
|---|---|---|
| `frontend` | Next.js 16 (App Router) | Tienda: catálogo, carrito, checkout e historial de órdenes |
| `nginx` | Nginx (stable-alpine) | Proxy inverso que recibe las peticiones HTTP de la API |
| `api` | Laravel 12 + PHP-FPM 8.4 | API REST con autenticación por tokens (Sanctum) |
| `db` | MySQL 8.0 | Persistencia de usuarios, productos, órdenes y pagos |

Los Dockerfiles usan builds multi-stage para separar la construcción de la ejecución, reducir el tamaño de las imágenes, minimizar la superficie de ataque y aprovechar la caché de capas.

## Arquitectura de contenedores

```
                 Host
   ┌──────────────┴───────────────┐
   │ :3000                  :8000 │
┌──▼───────┐  http://nginx/api  ┌──▼─────┐  FastCGI :9000  ┌───────┐  TCP :3306  ┌──────┐
│ frontend │ ─────────────────► │ nginx  │ ──────────────► │  api  │ ──────────► │  db  │
└──────────┘                    └────────┘                 └───────┘             └──┬───┘
 red: public                 redes: public + internal     red: internal         red: internal
                                                                                    │
                                                                         volumen db_data
                                                                         (/var/lib/mysql)
```

- **Red `public`:** `frontend` y `nginx`. Son los únicos servicios con puertos publicados (3000 y 8000).
- **Red `internal`** (`internal: true`): `nginx`, `api` y `db`. No tiene salida a internet, y el frontend no puede alcanzar la base de datos.
- **MySQL** no publica el 3306 en el host. Sus datos persisten en el volumen `db_data`.
- El **frontend** llama a la API desde el servidor de Next.js (Server Components y Server Actions). El navegador nunca habla directo con Laravel, y el token viaja en una cookie httpOnly.
- **Orden de arranque** con healthchecks: `db` (healthy) → `api` (migraciones + php-fpm) → `nginx` (`/up`) → `frontend`.

## Estructura del repositorio

```
.
├── frontend/                 # Código Next.js + Dockerfile
├── backend/                  # Código Laravel + Dockerfile (targets api y nginx)
│   └── docker/
│       ├── nginx/default.conf
│       └── php/{entrypoint.sh, opcache.ini}
├── mysql/init/01-init.sql    # Script de inicialización de MySQL
├── docker-compose.yml
└── .env.example
```

## Cómo ejecutar el ecosistema

Requisitos: Docker Desktop (o Docker Engine con Compose v2).

```bash
# 1. Clonar
git clone https://github.com/<usuario>/ecommerce-docker.git
cd ecommerce-docker

# 2. Variables de entorno
cp .env.example .env
# Generar APP_KEY y pegarla en .env
docker run --rm php:8.4-cli-alpine php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"

# 3. Construir y levantar todo con un solo comando
docker compose up -d --build

# 4. Cargar datos de ejemplo (solo la primera vez)
docker compose exec api php artisan db:seed --force
```

| URL | Qué es |
|---|---|
| http://localhost:3000 | Tienda (frontend) |
| http://localhost:8000/api/products | API (catálogo en JSON) |
| http://localhost:8000/up | Health check de Laravel |

Usuario de prueba del seeder: `test@example.com` / `password`.

Otros comandos útiles:

```bash
docker compose ps              # estado y salud de los servicios
docker compose logs -f api     # logs de la API
docker compose down            # detener (conserva los datos)
docker compose down -v         # detener y borrar el volumen de MySQL
```

## Decisiones técnicas

### Frontend (`frontend/Dockerfile`)

| Decisión | Motivo |
|---|---|
| `node:20-alpine` | Imagen base pequeña; cumple el requisito de Next 16 (Node ≥ 20.9) |
| 4 etapas: `base → deps → builder → runner` | Las devDependencies (TypeScript, Tailwind, ESLint) y el código fuente se quedan en las etapas de build |
| Se copian `package.json` y `package-lock.json` antes que el código | `npm ci` queda en caché y solo se repite si cambian las dependencias |
| `--mount=type=cache` para npm | Reutiliza los paquetes descargados entre builds |
| `output: "standalone"` | `next build` genera un servidor mínimo con solo los módulos usados; `node server.js` es el equivalente optimizado de `next start` |
| La imagen final copia solo `.next/standalone`, `.next/static` y `public` | Sin código fuente ni herramientas de build |
| Usuario `nextjs` (uid 1001) | El proceso no corre como root |
| `API_BASE_URL` se define en runtime | La misma imagen sirve para cualquier entorno (consistencia entre entornos) |
| `HEALTHCHECK` y `.dockerignore` | Detecta si la app responde y reduce el contexto de build (excluye `node_modules`, `.next`, `docs`…) |

### Backend (`backend/Dockerfile`)

| Decisión | Motivo |
|---|---|
| `php:8.4-fpm-alpine` | El `composer.lock` incluye componentes de Symfony 8.1 que exigen PHP ≥ 8.4.1. Cumple el requisito "PHP 8.2+" |
| Extensiones | `pdo_mysql` y `opcache` se instalan con `docker-php-ext-install`. `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype` y `json` ya vienen en la imagen oficial; el build falla si falta alguna |
| Etapa `vendor` | Composer, git y unzip solo existen en esta etapa: `composer install --no-dev` con caché y autoloader optimizado |
| La imagen final copia únicamente `vendor/` desde la etapa de build | Sin Composer ni herramientas de compilación en producción |
| `composer.json` y `composer.lock` se copian antes que el código | La capa de dependencias queda en caché |
| `php.ini-production` + OPcache (`validate_timestamps=0`) | Mejor rendimiento en producción |
| Target `nginx` en el mismo Dockerfile | Nginx solo recibe `public/` y reenvía `index.php` a `api:9000`; oculta la versión y bloquea archivos ocultos |
| `entrypoint.sh` | Cachea la configuración y las rutas con las variables del entorno, y corre `migrate --force` al arrancar |
| Workers de PHP-FPM como `www-data` | Los procesos que atienden peticiones no tienen privilegios de root |
| Logs a `stderr` | Se ven con `docker compose logs` |

### Base de datos (imagen oficial `mysql:8.0`)

| Decisión | Motivo |
|---|---|
| Imagen oficial sin Dockerfile propio | No requiere personalización; se configura con variables de entorno |
| `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | Laravel usa un usuario sin privilegios de root |
| Volumen `db_data:/var/lib/mysql` | Los datos sobreviven a `docker compose down` |
| `./mysql/init` montado en `/docker-entrypoint-initdb.d` | Script SQL que se ejecuta solo en el primer arranque |
| Sin `ports` | El 3306 solo es accesible desde la red interna |
| Healthcheck `mysqladmin ping` | La API espera a que MySQL esté listo antes de migrar |


