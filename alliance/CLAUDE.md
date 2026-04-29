# Alliance — Frontend Next.js

## Contexto del proyecto
Alliance es una plataforma estilo LinkedIn + TikTok para networking 
profesional, ofertas de trabajo, chat, reels y posts.

Este repo (`alliance/`) es el **frontend nuevo en Next.js 14+** que 
reemplaza al frontend viejo de React (`../alliance-frontend/`) y se 
conecta al backend en NestJS (`../alliance-backend/`).

## Estructura del workspace (carpetas hermanas)
- `../Alliance-Vanilla-Ts/` → backend viejo en Express. **SOLO LECTURA.** 
  Úsalo como referencia de funcionalidades e ideas de negocio.
- `../alliance-frontend/`   → frontend viejo en React + Tailwind. 
  **SOLO LECTURA.** Úsalo como referencia visual y de componentes.
- `../alliance-backend/`    → backend NestJS + MongoDB. **Este sí se 
  puede modificar** si hace falta refactor, agregar endpoints o DTOs.
- `./` (alliance)           → frontend nuevo. **Aquí se crea todo.**

## Stack del frontend nuevo
- Next.js 14+ con App Router
- TypeScript estricto
- Tailwind CSS
- React Query (TanStack Query) para data fetching del lado cliente
- Server Components por defecto; Client Components solo cuando haga falta
- Zustand o Context API para estado global ligero (auth)
- Axios o fetch wrapper para el cliente HTTP

## Reglas innegociables
1. **SOLO componentes funcionales.** Prohibido `class extends Component`.
2. **Nada de datos hardcodeados.** Todo viene del backend NestJS → MongoDB.
   Los únicos strings permitidos son labels de UI (títulos, placeholders).
3. Si falta un endpoint en el backend, **detente y avísame** antes de 
   inventar mocks. Podemos agregarlo en `../alliance-backend/`.
4. **Fidelidad visual:** las imágenes en `./design-references/` son la 
   verdad absoluta del diseño. Tailwind debe reproducirlas con precisión.
5. Código en inglés (variables, archivos, funciones). Comentarios y 
   comunicación conmigo en español.
6. Nombres de archivos en `kebab-case.tsx`, componentes en `PascalCase`.

## Variables de entorno
- `NEXT_PUBLIC_API_URL` → URL base del backend NestJS
- `NEXTAUTH_SECRET` → si usamos NextAuth para OAuth
- Otras por definir según se necesiten

## Cómo correr
- Backend: `cd ../alliance-backend && npm run start:dev` (puerto 3001)
- Frontend: `npm run dev` (puerto 3000)

## Páginas a construir (ver design-references/)
1. /register      → Registro con OAuth + form
2. /jobs          → Listado de ofertas de trabajo
3. /companies     → Featured employers
4. /profile       → Perfil del usuario con progreso
5. /networking    → Reclutadores y posiciones remotas
6. /reels         → Feed de videos
7. /chat          → Chat 3 columnas con WebSocket
8. /posts         → Feed social
9. /help          → Help Center