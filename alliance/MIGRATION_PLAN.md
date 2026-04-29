# Plan de Migración — Alliance Frontend Next.js

> **Estado:** Fase 0 completada — pendiente aprobación para Fase 1  
> **Generado:** 2026-04-21  
> **Autor:** Claude Code (análisis automatizado de los 4 repos)

---

## 1. Inventario del Backend NestJS

### 1.1 Endpoints disponibles

#### Auth — `POST /api/auth/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| POST | `/api/auth/register` | `{ name, email, password }` | `{ message, user: { id, name, email } }` | ❌ pública |
| POST | `/api/auth/login` | `{ email, password }` | `{ message, access_token, user: { id, name, email } }` | ❌ pública |

#### Users — `GET/PATCH/POST/DELETE /api/users/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| GET | `/api/users/me` | — | `User` completo | ✅ JWT |
| PATCH | `/api/users/me` | `UpdateUserDto` (name, bio, location, skills, profilePicture) | `User` actualizado | ✅ JWT |
| PATCH | `/api/users/me/avatar` | `multipart/form-data { file }` | `User` con nueva `profilePicture` | ✅ JWT |
| GET | `/api/users/network` | — | `User[]` sugerencias | ✅ JWT |
| GET | `/api/users/search?q=` | `query: string` | `{ users[], jobs[] }` | ❌ pública |
| POST | `/api/users/connections/:id` | — | `{ message }` | ✅ JWT |
| PATCH | `/api/users/connections/accept/:senderId` | — | `{ message }` | ✅ JWT |
| DELETE | `/api/users/connections/reject/:senderId` | — | `{ message }` | ✅ JWT |
| GET | `/api/users/:id` | — | `User` público | ❌ pública |
| GET | `/api/users` | — | `User[]` | ❌ pública |

#### Posts — `POST/GET/PATCH /api/posts/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| POST | `/api/posts` | `{ content, imageUrl?, hashtags? }` | `Post` creado | ✅ JWT |
| GET | `/api/posts` | — | `Post[]` con author poblado | ❌ pública |
| PATCH | `/api/posts/:id/like` | — | `Post` actualizado | ✅ JWT |
| POST | `/api/posts/:id/comments` | `{ text: string }` | `Post` actualizado | ✅ JWT |

#### Jobs — `GET/POST/PATCH/DELETE /api/jobs/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| GET | `/api/jobs` | `QueryJobDto (title?, location?)` | `Job[]` | ❌ pública |
| POST | `/api/jobs` | `CreateJobDto (title, company, location, salaryRange?, description?, tags?)` | `Job` creado | ❌ pública (⚠️ sin guard) |
| GET | `/api/jobs/:id` | — | `Job` con company poblado | ❌ pública |
| PATCH | `/api/jobs/:id` | `UpdateJobDto` | `Job` actualizado | ❌ pública (⚠️ sin guard) |
| DELETE | `/api/jobs/:id` | — | `{ message }` | ❌ pública (⚠️ sin guard) |
| POST | `/api/jobs/:id/apply` | — | `{ message }` | ✅ JWT |
| POST | `/api/jobs/:id/save` | — | `{ message, saved: bool }` | ✅ JWT |

#### Companies — `GET/POST/PATCH/DELETE /api/companies/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| GET | `/api/companies` | — | `Company[]` | ❌ pública |
| POST | `/api/companies` | `{ name, logoUrl?, description?, industry?, availableJobs? }` | `Company` | ❌ pública (⚠️ sin guard) |
| GET | `/api/companies/:id` | — | `Company` | ❌ pública |
| PATCH | `/api/companies/:id` | `UpdateCompanyDto` | `Company` | ❌ pública (⚠️ sin guard) |
| DELETE | `/api/companies/:id` | — | `{ message }` | ❌ pública (⚠️ sin guard) |
| GET | `/api/companies/:id/jobs` | — | `Job[]` | ❌ pública |

#### Reels — `POST/GET /api/reels/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| POST | `/api/reels` | `multipart/form-data { file, caption? }` | `Reel` creado | ✅ JWT |
| GET | `/api/reels` | — | `Reel[]` con author poblado | ❌ pública |

#### Stories — `POST/GET/PATCH /api/stories/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| POST | `/api/stories` | `multipart/form-data { file }` | `Story` creada | ✅ JWT |
| GET | `/api/stories` | — | `Story[]` activas (< 24h) | ❌ pública |
| PATCH | `/api/stories/:id/view` | — | `Story` actualizada | ✅ JWT |

#### Chat — `GET /api/chat/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| GET | `/api/chat/conversations` | — | `Conversation[]` | ✅ JWT |
| GET | `/api/chat/conversations/:id/messages` | — | `Message[]` | ✅ JWT |

#### News — `GET /api/news/...`
| Método | Ruta | DTO entrada | DTO salida | Auth |
|--------|------|-------------|------------|------|
| GET | `/api/news/tech` | — | `NewsArticle[]` (de NewsAPI) | ❌ pública |

#### Swagger
- Disponible en `GET /api/docs`

---

### 1.2 Schemas de MongoDB

#### User
```
name          String (required)
email         String (required, unique)
password      String (required, bcrypt)
location      String
bio           String
skills        String[] (default [])
profilePicture String (URL Cloudinary)
connections   ObjectId[] → User
connectionRequests ObjectId[] → User
createdAt / updatedAt  (timestamps)
```

#### Post
```
author    ObjectId → User (required)
content   String (required)
imageUrl  String
likes     ObjectId[] → User
comments  [{ user: ObjectId, text: String, createdAt: Date }]
hashtags  String[]
createdAt / updatedAt  (timestamps)
```

#### Job
```
title       String (required)
company     ObjectId → Company (required)
location    String (required)
salaryRange String
description String
tags        String[]
applicants  ObjectId[] → User
savedBy     ObjectId[] → User
createdAt / updatedAt  (timestamps)
```

#### Company
```
name          String (required, unique)
logoUrl       String
description   String
availableJobs Number (default 0)
industry      String
createdAt / updatedAt  (timestamps)
⚠️ FALTAN: location, website (existen en Express pero no en NestJS)
```

#### Conversation
```
participants  ObjectId[] → User (required)
lastMessage   ObjectId → Message
createdAt / updatedAt  (timestamps)
```

#### Message
```
conversationId ObjectId → Conversation (required)
sender         ObjectId → User (required)
content        String (required)
isRead         Boolean (default false)
createdAt / updatedAt  (timestamps)
⚠️ FALTA: attachmentUrl (existe en Express pero no en NestJS)
```

#### Reel
```
author     ObjectId → User (required)
videoUrl   String (required, Cloudinary)
caption    String
likesCount Number (default 0)
createdAt / updatedAt  (timestamps)
```

#### Story
```
author    ObjectId → User (required)
mediaUrl  String (required, Cloudinary)
mediaType enum['image', 'video'] (default 'image')
viewedBy  ObjectId[] → User
createdAt Date (TTL expires: '24h')
⚠️ FALTAN: content (texto), mediaType 'text' (existen en Express pero no en NestJS)
```

---

### 1.3 Sistema de autenticación

- **Estrategia:** JWT (Passport.js `passport-jwt`)
- **Extracción:** `Authorization: Bearer <token>` header
- **Secret:** variable de entorno `JWT_SECRET`
- **Payload del token:** `{ sub: userId, email }`
- **Guard:** `JwtAuthGuard extends AuthGuard('jwt')`
- **Decorador:** `@GetUser()` extrae `{ userId, email }` del `request.user`
- **Contraseñas:** bcrypt con 10 salt rounds
- **OAuth:** ❌ No implementado en NestJS (solo en el diseño Figma)
- **Expiración del token:** ⚠️ No visible en el código — revisar `AuthService`

---

### 1.4 Configuración (main.ts)

| Campo | Valor |
|-------|-------|
| Puerto | `process.env.PORT \|\| 3000` |
| CORS | Habilitado para todos los orígenes (`*`) |
| Prefijo global | `/api` |
| ValidationPipe | `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` |
| Swagger | `GET /api/docs` (Bearer Auth habilitado) |

> ⚠️ **Conflicto de puertos:** El `CLAUDE.md` dice que el backend corre en el puerto `3001`, pero `main.ts` usa `3000` como default. **Esto hay que resolver antes de la Fase 1** — el frontend necesita saber a qué URL apuntar.

---

## 2. Inventario del Frontend React viejo

### 2.1 Componentes reutilizables

| Componente | Archivo | Función |
|-----------|---------|---------|
| `MainLayout` | `components/MainLayout.tsx` | Wrapper con Navbar + `<Outlet>` |
| `Navbar` | `components/Navbar.tsx` | Nav sticky top con links, badge notif, avatar |
| `PostCard` | `components/PostCard.tsx` | Card de post con likes/comments/autor |
| `CreatePost` | `components/CreatePost.tsx` | Textarea + botón crear post |
| `JobCard` | `components/JobCard.tsx` | Card de vacante con empresa/loc/tags/apply |
| `NewsCard` | `components/NewsCard.tsx` | Card de artículo con imagen/título/fecha |
| `ReelItem` | `components/ReelItem.tsx` | Video fullscreen con overlay de controles |
| `StoriesBar` | `components/StoriesBar.tsx` | Scrollbar horizontal de stories |
| `StoryBubble` | `components/StoryBubble.tsx` | Burbuja individual de story |
| `AnnouncementCard` | `components/AnnouncementCard.tsx` | Card de anuncio/banner informativo |
| `StatusBanner` | `components/StatusBanner.tsx` | Banner de estado/alerta |

**Páginas existentes:**

| Página | Ruta | Archivo |
|--------|------|---------|
| Login | `/login` | `pages/Login.tsx` |
| Feed | `/` | `pages/Feed.tsx` |
| Jobs | `/jobs` | `pages/Jobs.tsx` |
| News | `/news` | `pages/News.tsx` |
| Chat | `/chat` | `pages/Chat.tsx` |
| Profile | `/profile` | `pages/Profile.tsx` |
| Companies | `/companies` | `pages/Companies.tsx` |
| Reels | `/reels` | `pages/Reels.tsx` |
| Network | `/network` | `pages/Network.tsx` |
| Help | `/help` | `pages/Help.tsx` |
| Notifications | `/notifications` | inline en `App.tsx` (solo empty state) |

---

### 2.2 Tokens de diseño detectados (React viejo — Tailwind defaults)

El frontend viejo **no tiene tailwind.config personalizado** — usa los colores de utilidad directamente:

| Token | Valor Tailwind | Hex |
|-------|---------------|-----|
| Fondo app | `bg-slate-900` | `#0F172A` |
| Navbar | `bg-slate-900` texto blanco | `#0F172A` |
| Cards | `bg-white` bordes `border-slate-100/200` | `#FFFFFF` |
| Primario | `text-blue-600` / `bg-blue-600` | `#2563EB` |
| Acento 1 | `bg-indigo-600` / `bg-purple-700` | `#4F46E5` / `#6D28D9` |
| Status OK | `bg-green-500` | `#22C55E` |
| Border radius | `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-[3rem]` | custom |
| Sombra | `shadow-xl shadow-slate-200/50` | custom |

---

### 2.3 Cliente HTTP actual

```ts
// src/api/axios.ts
const api = axios.create({ baseURL: 'http://localhost:3000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('alliance_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

- Token key: `'alliance_token'` en localStorage
- Estado auth: Zustand (`useAuthStore`) con `{ user, token, isHydrated }`
- WebSocket: Socket.io client en `src/api/socket.ts`

---

## 3. Funcionalidades en Express que NO están en NestJS

| Funcionalidad | Express | NestJS | Prioridad | Acción |
|--------------|---------|--------|-----------|--------|
| `Company.location` field | ✅ | ❌ | **Alta** | Agregar al schema NestJS |
| `Company.website` field | ✅ | ❌ | **Alta** | Agregar al schema NestJS |
| `Story.content` (texto) | ✅ | ❌ | **Baja** | Agregar si se necesita stories de texto |
| `Story.mediaType = 'text'` | ✅ | ❌ | **Baja** | Agregar junto con `content` |
| `Message.attachmentUrl` | ✅ | ❌ | **Media** | Agregar si el chat necesita adjuntos |
| Índices en Conversation | ✅ (`participants`, `updatedAt`) | ❌ | **Media** | Agregar para performance del chat |
| Índices en Message | ✅ (`conversationId + createdAt`) | ❌ | **Alta** | Agregar para paginación de mensajes |
| `GET /api/auth/profile` | ✅ | ❌ | **BLOCKER** | El frontend viejo llama este endpoint; NestJS solo tiene `GET /users/me` |
| `GET /api/notifications/unread-count` | ⚠️ no verificado | ❌ | **BLOCKER** | El Navbar lo llama al cargar |
| Paginación en endpoints | ✅ (parcial) | ❌ | **Media** | Sin paginación en `/posts`, `/jobs`, `/reels` |

---

## 4. Análisis de las imágenes de Figma

### 4.1 Paleta de colores propuesta (tokens de Tailwind)

Colores extraídos directamente de las 10 imágenes:

| Token nombre | Hex aproximado | Uso en el diseño |
|-------------|----------------|-----------------|
| `brand-lime` | `#C8FF00` o `#CCFF00` | Botón CTA primario ("CONTINUAR", "Sign in now!") |
| `brand-pink` | `#FFCDD2` / `#FCE4EC` | Fondo de la página de registro |
| `brand-mint` | `#E8F5F0` / `#F0FAF5` | Fondo global de la app (verde muy claro) |
| `brand-orange` | `#F5A623` / `#FF9800` | Fondo del Help Center |
| `brand-yellow` | `#FFFF80` / `#FFFE99` | Cards del Help Center |
| `brand-purple` | `#8B5CF6` / `#7C3AED` | Burbujas de chat del emisor |
| `brand-lavender` | `#DDD6FE` / `#C4B5FD` | Banner "Fair Compensation" en Companies |
| `brand-salmon` | `#FFACAC` / `#FFB3B3` | Banner rosa en Jobs ("Over 1 million jobs") |
| `white` | `#FFFFFF` | Cards, fondos de sección |
| `text-dark` | `#111827` / `#1F2937` | Headings y títulos |
| `text-gray` | `#6B7280` | Body text, descripciones |
| `text-blue` | `#2563EB` | "Alliance" logo text color |
| `tag-purple` | `#7C3AED` texto blanco | Badges "Hiring" en cards de networking |

**Config de Tailwind propuesta:**
```js
// tailwind.config.ts
colors: {
  brand: {
    lime:     '#CCFF00',
    pink:     '#FCE4EC',
    mint:     '#F0FAF5',
    orange:   '#F5A623',
    yellow:   '#FFFE99',
    purple:   '#8B5CF6',
    lavender: '#C4B5FD',
    salmon:   '#FFACAC',
  }
}
```

---

### 4.2 Tipografías

Observadas en las imágenes de Figma:

| Uso | Estilo observado | Sugerencia Google Fonts |
|-----|-----------------|------------------------|
| Logo "Alliance" | Bold/Black, sans-serif | `Inter Black` o `Plus Jakarta Sans Black` |
| Headings H1 | Extra Bold, muy grande | `Inter ExtraBold` / `Outfit ExtraBold` |
| Headings H2/H3 | Bold, negro | `Inter Bold` |
| Body text | Regular, gris | `Inter Regular` |
| Labels / tags | Small caps, uppercase | `Inter Medium` 10-11px |
| Botón CTA | Bold, uppercase, tracking | `Inter Bold` |

> El Figma usa apariencia consistente con **Inter** (fuente estándar de diseño UI). Tailwind por defecto usa `font-sans` (system-ui). Para fidelidad total hay que configurar Inter explícitamente.

---

### 4.3 Mapeo imagen → página

| Archivo | Página destino | Ruta Next.js | Endpoints consumidos |
|---------|---------------|--------------|---------------------|
| `Screenshot 090626.png` | Registro | `/register` | `POST /api/auth/register` |
| `Screenshot 090640.png` | Empleos | `/jobs` | `GET /api/jobs`, `GET /api/companies` |
| `Screenshot 090656.png` | Empresas | `/companies` | `GET /api/companies`, `GET /api/companies/:id/jobs` |
| `Screenshot 090709.png` | Perfil | `/profile` | `GET /api/users/me`, `PATCH /api/users/me`, `PATCH /api/users/me/avatar` |
| `Screenshot 090734.png` | Networking | `/networking` | `GET /api/users/network`, `POST /api/users/connections/:id` |
| `Screenshot 091043.png` | Networking (alt) | `/networking` | Mismos que 090734 |
| `Screenshot 091050.png` | Reels | `/reels` | `GET /api/reels`, `POST /api/reels` |
| `Screenshot 091058.png` | Chat | `/chat` | `GET /api/chat/conversations`, `GET /api/chat/conversations/:id/messages`, WS |
| `Screenshot 091105.png` | Feed/Posts | `/` (home) | `GET /api/posts`, `POST /api/posts`, `GET /api/stories` |
| `Screenshot 091116.png` | Help Center | `/help` | — (estático) |

**Nota:** No hay imagen de login en las referencias — el `/login` se infiere de `/register` (misma estética).

---

## 5. Endpoints FALTANTES en el backend

Los siguientes endpoints son **necesarios para que el frontend funcione 100% contra DB real** y actualmente no existen en NestJS:

| # | Endpoint | Motivo / Quién lo necesita | Severidad |
|---|----------|---------------------------|-----------|
| 1 | `GET /api/notifications/unread-count` | `Navbar` llama esto al montar para mostrar badge | 🔴 BLOCKER |
| 2 | `GET /api/auth/profile` | El viejo frontend y el `App.tsx` lo usan para rehydratar sesión (NestJS solo tiene `GET /users/me`) | 🔴 BLOCKER |
| 3 | `POST /api/chat/conversations` | Para iniciar una nueva conversación desde el perfil/networking | 🟡 IMPORTANTE |
| 4 | `PATCH /api/reels/:id/like` | El Figma muestra interacción de like en reels; solo existe `likesCount` en el schema pero no el endpoint | 🟡 IMPORTANTE |
| 5 | `GET /api/users/:id/connections` | Para ver las conexiones de un perfil público | 🟠 MEDIA |
| 6 | `GET /api/jobs/saved` | Para que el usuario vea sus vacantes guardadas (el schema tiene `savedBy[]`) | 🟠 MEDIA |
| 7 | `GET /api/users/me/connection-requests` | Para que el usuario vea solicitudes pendientes entrantes | 🟠 MEDIA |
| 8 | `POST /api/posts` con imagen | `CreatePostDto` acepta `imageUrl` pero el form actual no sube a Cloudinary desde el frontend | 🟠 MEDIA |
| 9 | Paginación en `/posts`, `/jobs`, `/reels` | Sin paginación, el feed podría volverse inusable con muchos datos | 🟠 MEDIA |

> **Regla del CLAUDE.md:** Si falta un endpoint, detener y avisar. Antes de la Fase 1 debo saber cuáles de estos se van a agregar al backend NestJS.

---

## 6. Decisiones técnicas pendientes

Preguntas concretas que necesito que respondas antes de avanzar a la Fase 1:

### 6.1 Puerto del backend
> `main.ts` usa `PORT || 3000` pero `CLAUDE.md` dice que el backend corre en `3001`.  
> **¿En qué puerto realmente corre el backend NestJS? ¿Cambio `NEXT_PUBLIC_API_URL` a `3000` o `3001`?**

### 6.2 ¿Implementamos OAuth en esta migración?
> El Figma de registro muestra botones de Google, Microsoft y Facebook. El backend NestJS actual **no tiene ninguna estrategia OAuth**. Implementarlo requiere Passport + Google/Azure/Facebook strategies en el backend Y NextAuth o similar en el frontend.  
> **¿OAuth entra en scope de esta migración, o arrancamos solo con email/password?**

### 6.3 Endpoints faltantes (#1 y #2 son BLOCKERS)
> El Navbar necesita `GET /api/notifications/unread-count` y el flujo de sesión necesita un endpoint para rehydratar el usuario (actualmente el frontend viejo usa `GET /api/auth/profile` que no existe en NestJS).  
> **¿Agrego estos 2 endpoints al backend NestJS ahora, o el frontend nuevo usa `GET /users/me` directamente?**

### 6.4 Login page en el Next.js nuevo
> Las imágenes de Figma muestran `/register`. No hay imagen de `/login`.  
> **¿Tenemos también página de login en el nuevo diseño, o es la misma pantalla con un toggle?**

### 6.5 Diseño de la Navbar en el nuevo frontend
> El Figma muestra una **Navbar blanca** con links: *Job Offers | Companies | Networking | Chat | Reels | Help | Posts*.  
> El frontend viejo tiene **Navbar negra (slate-900)** con links distintos.  
> **¿El frontend nuevo sigue el diseño del Figma (Navbar blanca) o mantiene la del viejo?**

### 6.6 ¿Server Components o Client Components por defecto para las páginas de datos?
> La mayoría de páginas (Feed, Jobs, Reels) necesitan data que cambia en tiempo real o requiere auth del cliente.  
> El CLAUDE.md dice "Server Components por defecto; Client Components solo cuando haga falta".  
> **¿El fetch de datos del Feed va en un Server Component (SSR, no real-time) o en Client Component con React Query?** Esto cambia toda la arquitectura de la capa de datos.

---

## 7. Plan por fases con checkboxes

- [x] **Fase 0:** Análisis — Inventario completo de los 4 repos + MIGRATION_PLAN.md
- [x] **Fase 1:** Setup Next.js ✅ COMPLETADA (2026-04-21)
  - [x] Colores Figma → `globals.css` vía `@theme` (Tailwind v4, sin config.js)
  - [x] Fuente Inter vía `next/font/google`
  - [x] Estructura de carpetas: `app/(auth)`, `app/(main)`, `components/`, `lib/`, `services/`, `types/`
  - [x] `.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:3000/api` + OAuth placeholders
  - [x] `lib/api.ts` — Axios base + `createAuthClient(token)`
  - [x] `lib/socket.ts` — Socket.io singletons (chat + notificaciones)
  - [x] `auth.ts` — NextAuth v5 con Google + Microsoft + Facebook + Credentials
  - [x] `proxy.ts` — Protección de rutas (**Next.js 16 breaking change**: `middleware.ts` → `proxy.ts`)
  - [x] `components/providers.tsx` — SessionProvider + QueryClientProvider
  - [x] `types/index.ts` — Tipos TypeScript de los 8 schemas
  - [x] `components/layout/navbar.tsx` — Navbar rosa con nav links del Figma
  - [x] Layouts de route groups `(auth)/` y `(main)/` + 9 páginas placeholder
  - [x] `next.config.ts` — image domains + turbopack root fix
  - [x] **Backend** `POST /api/auth/oauth` — login/registro vía OAuth
  - [x] **Backend** `GET /api/notifications/unread-count` — badge del Navbar
  - [x] Dev server: ✓ Ready in 757ms — sin errores ni warnings
- [x] **Fase 2:** Capa de API ✅ COMPLETADA junto con Fase 1
  - [x] `services/auth.service.ts`
  - [x] `services/users.service.ts`
  - [x] `services/posts.service.ts`
  - [x] `services/jobs.service.ts`
  - [x] `services/companies.service.ts`
  - [x] `services/chat.service.ts`
  - [x] `services/reels.service.ts`
  - [x] `services/stories.service.ts`
  - [x] `services/news.service.ts`
  - [x] `lib/socket.ts` (Socket.io singletons — chat + notificaciones)
- [ ] **Fase 3:** Páginas (una por una, en este orden)
  - [ ] `/register` → pantalla de registro (Figma 090626)
  - [ ] `/` (home/Feed) → feed con stories + posts + sidebar (Figma 091105)
  - [ ] `/jobs` → listado de vacantes con filtros (Figma 090640)
  - [ ] `/companies` → empresas destacadas (Figma 090656)
  - [ ] `/networking` → reclutadores y posiciones remotas (Figma 090734)
  - [ ] `/reels` → feed de video full-screen (Figma 091050)
  - [ ] `/chat` → 3 columnas con WebSocket (Figma 091058)
  - [ ] `/profile` → perfil con progreso y edición (Figma 090709)
  - [ ] `/help` → help center estático (Figma 091116)
- [ ] **Fase 4:** Autenticación
  - [ ] Guard de rutas protegidas en `middleware.ts`
  - [ ] Flujo de login (email/password) — página `/login`
  - [ ] Rehydratación de sesión en layout raíz
  - [ ] Logout con limpieza de token y socket
  - [ ] (Opcional) OAuth si se aprueba en decisión 6.2

---

## Apéndice A — Estructura de carpetas propuesta para el Next.js

```
alliance/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          ← MainLayout con Navbar
│   │   ├── page.tsx            ← Feed home
│   │   ├── jobs/page.tsx
│   │   ├── companies/page.tsx
│   │   ├── networking/page.tsx
│   │   ├── reels/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── profile/page.tsx
│   │   └── help/page.tsx
│   ├── layout.tsx              ← Root layout (font, providers)
│   └── globals.css
├── components/
│   ├── ui/                     ← Componentes primitivos (Button, Card, Badge...)
│   ├── layout/                 ← Navbar, MainLayout, Sidebar
│   ├── feed/                   ← PostCard, CreatePost, StoriesBar, StoryBubble
│   ├── jobs/                   ← JobCard, JobFilters
│   ├── companies/              ← CompanyCard
│   ├── networking/             ← RecruiterCard, NetworkBanner
│   ├── reels/                  ← ReelItem
│   ├── chat/                   ← ConversationList, MessageBubble, ChatWindow
│   └── news/                   ← NewsCard
├── lib/
│   ├── api.ts                  ← Axios instance con interceptores
│   └── socket.ts               ← Socket.io singleton
├── services/
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── posts.service.ts
│   ├── jobs.service.ts
│   ├── companies.service.ts
│   ├── chat.service.ts
│   ├── reels.service.ts
│   ├── stories.service.ts
│   └── news.service.ts
├── store/
│   └── auth-store.ts           ← Zustand (compatible con App Router)
├── types/
│   ├── user.ts
│   ├── post.ts
│   ├── job.ts
│   ├── company.ts
│   ├── chat.ts
│   ├── reel.ts
│   └── story.ts
├── middleware.ts               ← Protección de rutas
├── .env.local
├── tailwind.config.ts
└── next.config.ts
```

---

## Apéndice B — Tipos TypeScript base (derivados de los schemas)

```ts
// types/user.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  skills: string[];
  profilePicture?: string;
  connections: string[];
  connectionRequests: string[];
  createdAt: string;
  updatedAt: string;
}

// types/post.ts
export interface Comment {
  user: User | string;
  text: string;
  createdAt: string;
}
export interface Post {
  _id: string;
  author: User | string;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  hashtags: string[];
  createdAt: string;
}

// types/job.ts
export interface Job {
  _id: string;
  title: string;
  company: Company | string;
  location: string;
  salaryRange?: string;
  description?: string;
  tags: string[];
  applicants: string[];
  savedBy: string[];
  createdAt: string;
}

// types/company.ts
export interface Company {
  _id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  availableJobs: number;
  industry?: string;
  createdAt: string;
}
```
