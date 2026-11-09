# QualiFive (prototipo web para pacientes)
Ejecutar: `python3 -m http.server` y abrir http://localhost:8000 (el mapa y fetch requieren servidor).
Publicar: subir la carpeta a un repo → Settings → Pages → Deploy from branch `main` / root.
Datos: solo localStorage, ficticios. No usar RUT ni datos clínicos reales.
## Pendiente / no incluido
- data/routes.geojson está vacío: cargar trazados verificados de micros/colectivos (fuente oficial). Coordenada del hospital aproximada: verificar.
- Envío real con página cerrada (sección 24): requiere backend. Propuesta: Supabase (Auth + Postgres con RLS) + pg_cron/Edge Function que cada minuto lee `scheduled_notifications`, envía por Resend (correo) y registra resultado; clave de idempotencia `cita_id+tipo+offset`; enlaces de reconfirmación con token firmado de un solo uso + login; luego PWA/Web Push (VAPID), WhatsApp Business API y SMS con proveedor autorizado. Claves solo en el servidor.
