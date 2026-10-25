# Ecommerce Frontend (Next.js 16)

Frontend de e-commerce en **Next.js 16 (App Router) + TypeScript + Tailwind CSS** que consume la
API REST de Laravel 12 (Sanctum) del proyecto `basci_e_commerce`. Flujo: catálogo → carrito →
orden → confirmación e historial. El pago es manual en el backend (no hay pasarela online).

## Arquitectura

| Necesidad | Solución |
| --- | --- |
| Lecturas (catálogo, detalle, historial) | **Server Components** con `fetch` en el servidor (`lib/api/*`) |
| Mutaciones (login, registro, crear orden) | **Server Actions** (`app/actions/*`) llamadas desde formularios con `onSubmit` + `React.SubmitEvent` |
| Token de sesión | Cookie **httpOnly** (`token`, `SameSite=Lax`, `Secure` en producción): la crean las Server Actions de login/registro y la eliminan **Route Handlers** (`/api/auth/logout`, `/api/auth/expired`). El navegador nunca ve el token |
| Rutas protegidas | `proxy.ts` (cookie presente) + `requireUser()` en cada página (validez real contra `/auth/me`) |
| Carrito | Estado local (`localStorage`) con `useSyncExternalStore` (`lib/cart-store.ts`) |
| Datos al día tras mutaciones | `updateTag()` / `revalidatePath()` en `app/actions/orders.ts` |
| Carga y errores | `loading.tsx` y `error.tsx` por segmento + `<Suspense>` en catálogo e historial |
| Tipos | Carpeta `types/` (`User`, `Product`, `Order`, `CartItem`, `ApiError`…) |

```
app/
  actions/        auth.ts, orders.ts   (Server Actions)
  checkout/       page, loading, error, success/
  orders/         page, loading, error, [id]/
  products/[id]/  page, loading, error
  login/ register/ cart/
components/       auth, cart, layout, orders, products, ui
lib/              api/ (client, products, orders, errors), session.ts, cart-store.ts, format.ts
types/            tipos compartidos
proxy.ts          protección rápida de rutas
```

## Configuración

1. Copia el archivo de ejemplo y ajusta la URL base de la API:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   # .env.example
   API_BASE_URL=http://127.0.0.1:8000/api
   ```

   `API_BASE_URL` incluye `/api` y **no** lleva `NEXT_PUBLIC_` (solo la usa el servidor).

2. Levanta la API Laravel `basci_e_commerce` (`php artisan serve`, puerto 8000 por defecto) con la
   base de datos configurada en su `.env` y las migraciones/seeders aplicados
   (`php artisan migrate --seed`). El seeder crea `test@example.com` / `password` y 25 productos.

## Ejecutar el proyecto

```bash
npm install
npm run dev        # http://localhost:3000
```


## Rutas implementadas

| Ruta | Descripción | Acceso |
| --- | --- | --- |
| `/` | Catálogo con búsqueda y paginación (`GET /products`) | Público |
| `/products/[id]` | Detalle de producto (`GET /products/{id}`) | Público |
| `/register` | Registro (`POST /auth/register`) | Público |
| `/login` | Inicio de sesión (`POST /auth/login`) | Público |
| `/cart` | Carrito (estado local) | Público |
| `/checkout` | Crea la orden (`POST /orders`) | Protegido |
| `/checkout/success?order_id=` | Confirmación de compra (`GET /orders/{id}`) | Protegido |
| `/orders` | Historial del usuario (`GET /orders/user/{id}`) | Protegido |
| `/orders/[id]` | Detalle de una orden | Protegido |
| `/profile` | Mi perfil: datos de la cuenta (solo lectura) | Protegido |

Endpoints adicionales usados: `GET /auth/me` (sesión) y `POST /auth/logout` (revoca el token).

### Route Handlers del frontend

| Ruta | Método | Función |
| --- | --- | --- |
| `/api/auth/logout` | POST | Revoca el token en la API, borra la cookie httpOnly y redirige a `/` |
| `/api/auth/expired` | GET | Sesión vencida/revocada: borra la cookie obsoleta y redirige a `/login?next=...` |

### Flujo de autenticación

1. `/login` y `/register` envían el formulario (`onSubmit` con `React.SubmitEvent`) a una
   **Server Action** que llama a la API; si responde con un token, se guarda en la cookie httpOnly.
2. Los errores de la API (422, credenciales inválidas, cuenta inactiva) se muestran por campo y
   tras el éxito se redirige a la ruta original (`?next=`, validada para evitar open redirects).
3. `proxy.ts` bloquea rápido las rutas protegidas sin cookie, y `requireUser()` valida el token
   contra `/auth/me` en cada página protegida.

## Flujo de compra y pago

1. En `/checkout` se crea la orden (`POST /orders`): la API valida stock, congela el precio unitario
   y descuenta el inventario. La orden queda en estado `pending`.
2. El usuario es redirigido a `/checkout/success?order_id=ID`, que muestra la orden y vacía el carrito.
3. El backend no tiene pasarela de pago: una orden pasa a `paid` solo cuando **otra cuenta
   autenticada** llama a `PUT /orders/{id}/mark-as-paid` (el dueño no puede marcarla). El frontend
   no expone esa acción; solo muestra el estado actualizado en el historial y el detalle.


