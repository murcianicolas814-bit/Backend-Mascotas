# ZooloMascotas Frontend

## Desarrollo local

Inicia cada proceso en una terminal separada:

1. En la carpeta del backend: `npm run dev` (API en `http://localhost:3000`).
2. En esta carpeta: `npm run mock` (JSON Server para las pantallas que siguen usando datos de prueba, puerto `3001`).
3. En esta carpeta: `npm run dev` (Vite; normalmente `http://localhost:5173`).

El frontend envía las llamadas reales a `/api`; Vite las redirige al backend en el puerto `3000`. El login, registro, mascotas y citas usan MongoDB. Las pantallas de administración, recepción y veterinario aún conservan algunos datos simulados en JSON Server.

Para apuntar el frontend a otro backend sin usar el proxy de Vite, crea un archivo `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```
