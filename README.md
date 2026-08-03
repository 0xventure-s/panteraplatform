# Franco Alonso

Plataforma de cursos de IA orientados a construir productos.

## Producto

- Portada pública y catálogo de cursos.
- Registro, ingreso y recuperación de contraseña con Better Auth.
- Campus del alumno con progreso por curso y lección.
- Administración privada de cursos, capítulos, videos y materiales.
- Conexión de Mercado Pago desde el panel mediante OAuth con PKCE.
- Checkout Pro en pesos argentinos y acreditación segura por webhook.
- Video con Mux y archivos con UploadThing.
- Contacto directo por WhatsApp.

## Stack

- Next.js 15, React y TypeScript.
- Tailwind CSS y componentes shadcn.
- Prisma con PostgreSQL.
- Better Auth, Resend, Mux, UploadThing y Mercado Pago.

## Configuración

1. Instalar dependencias con `npm install`.
2. Completar `.env` siguiendo [CONFIGURACION_ENV.md](./CONFIGURACION_ENV.md).
3. Generar el cliente con `npx prisma generate`.
4. Aplicar la migración de base de datos en el entorno correspondiente.

El archivo `.env` está ignorado por Git. Los secretos OAuth y de infraestructura nunca deben copiarse al repositorio.

## Rutas principales

- `/`: sitio público.
- `/cursos`: catálogo.
- `/dashboard`: campus del alumno.
- `/admin/cursos`: gestión de contenido.
- `/admin/integraciones`: conexión de Mercado Pago.
- `/admin/analiticas`: ventas aprobadas.

## Validación

El repositorio no tiene un runner de pruebas configurado. Antes de publicar, ejecutar `npm run lint` y verificar manualmente acceso, compra, webhook, progreso, contenido y administración.
