# Plan de lanzamiento de Kiwi Academia

## Objetivo

Convertir el LMS actual en Kiwi Academia, enfocada en IA aplicada a la construcción de productos.

El resultado tendrá tres áreas bien separadas:

- Sitio público para presentar Kiwi Academia, mostrar los cursos y resolver consultas.
- Campus del alumno con acceso, cursos comprados y progreso individual.
- Administración privada para crear, editar y publicar cursos.

## Estado de implementación — 3 de agosto de 2026

### Implementado

- Marca Kiwi Academia, portada pública, perfil, catálogo, detalle de curso, metadata, Open Graph, sitemap, robots y favicon propio.
- Campus en `/dashboard` y `/mis-cursos`, progreso persistente, próxima lección, estados vacíos y lecciones pagas protegidas.
- Better Auth con correo y contraseña, cierre de sesión, recuperación de acceso, sesiones en PostgreSQL y autorización administrativa en servidor.
- Administración en `/admin`: cursos, capítulos, publicación, archivos, video, analíticas e integración de Mercado Pago.
- Redirecciones desde `/teacher` y rutas canónicas de lecciones en español.
- PostgreSQL en Neon con migración registrada, importes `Decimal`, pagos, compras y tokens OAuth cifrados.
- Mercado Pago Checkout Pro con PKCE, validación de firma, consulta del pago, controles de importe, moneda, metadata, curso publicado e idempotencia.
- Contacto por WhatsApp configurado con el número internacional provisto.
- Eliminación de Clerk y Stripe del código, las dependencias y la configuración documentada.

### Verificado

- `npm run typecheck`: sin errores.
- `npm run lint`: sin advertencias ni errores.
- `npm audit --omit=dev --audit-level=high`: sin vulnerabilidades de producción detectadas.
- `npx prisma migrate status`: esquema de Neon actualizado y migración aplicada.
- Respuesta HTTP local: portada, catálogo, acceso y API de sesión disponibles; el campus redirige al ingreso sin sesión.

### Configuración externa pendiente

- Definir `ADMIN_EMAIL` o `ADMIN_USER_ID` para habilitar la única cuenta administradora.
- Cargar `RESEND_API_KEY` y verificar el remitente para entregar correos de recuperación.
- Completar credenciales y webhooks de Mercado Pago; luego validar pagos de prueba aprobados, pendientes, rechazados y reintentos.
- Completar credenciales de Mux y UploadThing y validar carga, reproducción y descarga.
- Incorporar recursos de Thiings únicamente después de confirmar una licencia comercial válida.
- Desplegar, conectar el dominio público de Kiwi Academia, decidir la redirección de `www` y repetir la validación final sobre HTTPS.

## Decisiones de producto

- Marca: **Kiwi Academia**.
- Propuesta principal: **Cursos de IA para construir productos.**
- Dominio canónico: el origen configurado en `NEXT_PUBLIC_APP_URL`.
- Acceso: Better Auth con correo y contraseña sobre la base PostgreSQL del proyecto.
- Administración: una única cuenta autorizada mediante `ADMIN_EMAIL`, `ADMIN_USER_ID` o el rol persistido `admin`.
- Pagos: conexión OAuth desde Administración, Mercado Pago Checkout Pro, cobros en pesos argentinos y acreditación por webhook.
- Soporte comercial: enlace directo a WhatsApp, sin bot ni bandeja intermedia.
- Video y archivos: Mux y UploadThing continúan en uso.
- Interfaz: refinamiento visual sobre Tailwind y shadcn, con recursos de Thiings usados bajo una licencia comercial válida.

## Mapa de navegación

### Sitio público

- `/`: portada, propuesta, cursos destacados y llamada a la acción.
- `/cursos`: catálogo de cursos publicados.
- `/cursos/[courseId]`: información, programa, precio y compra.
- `/sign-in`: ingreso.
- `/sign-up`: creación de cuenta.

### Campus del alumno

- `/dashboard`: resumen personal y acceso rápido para continuar.
- `/mis-cursos`: cursos en progreso y completados.
- `/cursos/[courseId]/capitulos/[chapterId]`: lección, materiales y avance.

### Administración

- `/admin/cursos`: listado y estado de publicación.
- `/admin/cursos/nuevo`: alta de curso.
- `/admin/cursos/[courseId]`: contenido, precio, portada, adjuntos y publicación.
- `/admin/analiticas`: ventas e inscripciones confirmadas.

Las rutas actuales bajo `/teacher` redirigen a `/admin`. La portada es pública y el alumno autenticado ingresa en `/dashboard`.

## Fase 1 — Marca, estructura y contenido

1. Reemplazar el logo genérico, favicon, título, descripción y metadatos por Kiwi Academia.
2. Crear la portada pública con una jerarquía corta:
   - Hero con la propuesta principal.
   - Cursos publicados.
   - Qué construye el alumno durante la formación.
   - Perfil del equipo docente, con información real provista por sus integrantes.
   - Preguntas frecuentes basadas en condiciones reales de compra y acceso.
   - Acceso y contacto por WhatsApp.
3. Mover el dashboard actual de `/` a `/dashboard`.
4. Traducir todo el producto al español natural: navegación, estados, errores, formularios, botones y mensajes de compra.
5. Crear metadata, Open Graph, `robots.txt`, `sitemap.xml` y URL canónica a partir de `NEXT_PUBLIC_APP_URL`.

### Criterios de aceptación

- Una visita sin sesión puede recorrer la portada y los cursos publicados.
- La marca anterior y el copy del tutorial no aparecen en ninguna superficie visible.
- No quedan textos en inglés ni caracteres con codificación incorrecta.

## Fase 2 — Accesos y autorización

1. Implementar Better Auth para registro, inicio de sesión, cierre de sesión y recuperación de acceso.
2. Crear un control de servidor basado en rol, `ADMIN_EMAIL` o `ADMIN_USER_ID`.
3. Proteger `/admin` en el servidor y ocultar su navegación para cualquier alumno.
4. Aplicar la verificación de admin a todas las mutaciones de cursos, capítulos, archivos, video, publicación y analíticas.
5. Eliminar la autorización actual basada en `NEXT_PUBLIC_TEACHER_ID`; una variable pública no debe decidir permisos.
6. Mantener las rutas del campus disponibles para cualquier usuario autenticado.
7. Definir como públicas únicamente la portada, el catálogo, las páginas de acceso y los webhooks necesarios.

### Criterios de aceptación

- Un alumno no puede abrir `/admin` ni ejecutar sus endpoints aunque conozca la URL.
- Solo la cuenta configurada como administradora puede crear, editar, ordenar, publicar o borrar contenido.
- Un usuario sin sesión no puede consultar progreso ni consumir lecciones pagas.

## Fase 3 — Mercado Pago

1. Eliminar el SDK de Stripe, `lib/stripe.ts`, el checkout actual, el webhook de Stripe y el modelo `StripeCustomer`.
2. Incorporar **Administración → Integraciones** con un botón **Conectar Mercado Pago** basado en OAuth Authorization Code y PKCE.
3. Cifrar Access Token y Refresh Token antes de guardarlos, y renovar el acceso automáticamente cuando esté por vencer.
4. Crear una preferencia de Checkout Pro desde el servidor con:
   - Curso publicado y precio leído desde la base de datos.
   - Moneda `ARS`.
   - Una unidad por compra.
   - `external_reference` única.
   - ID del usuario y del curso en metadata.
   - URLs de retorno para pago aprobado, pendiente y rechazado.
   - URL de notificación de producción.
5. Mostrar un único botón principal: **Comprar con Mercado Pago**.
6. Redirigir al `init_point` devuelto por Mercado Pago.
7. Crear `/api/webhooks/mercadopago` y validar la firma `x-signature` con `MERCADOPAGO_WEBHOOK_SECRET`.
8. Consultar el pago a Mercado Pago desde el servidor antes de otorgar acceso.
9. Acreditar la compra únicamente si se cumplen todas estas condiciones:
   - Estado `approved`.
   - Importe y moneda coincidentes.
   - Curso existente y publicado.
   - Usuario coincidente con la referencia creada.
   - Pago todavía no procesado.
10. Hacer el webhook idempotente: recibir el mismo evento más de una vez no debe duplicar compras.
11. Crear estados claros de retorno: pago aprobado, pago pendiente y pago no completado. La redirección del navegador nunca reemplaza la confirmación del webhook.

### Modelo de datos propuesto

- Cambiar `Course.price` de `Float` a `Decimal` para evitar errores de precisión monetaria.
- Incorporar `Payment` con `providerPaymentId`, `preferenceId`, `externalReference`, `status`, `amount`, `currency`, `userId`, `courseId` y fechas.
- Mantener `Purchase` como derecho de acceso confirmado y vincularlo al pago que lo originó.
- Agregar índices únicos para `providerPaymentId`, `externalReference` y la combinación usuario/curso.

### Flujo esperado

`Alumno → preferencia → Mercado Pago → webhook firmado → pago verificado → compra acreditada → curso disponible`

### Criterios de aceptación

- Un pago aprobado habilita el curso una sola vez.
- Un pago pendiente o rechazado no habilita contenido.
- Alterar el precio o el ID del curso desde el navegador no modifica el cobro real.
- Repetir el webhook no crea registros duplicados.
- No quedan dependencias, variables ni textos de Stripe.

## Fase 4 — Campus y progreso

1. Reorganizar el dashboard con:
   - Continuar aprendiendo.
   - Cursos en progreso.
   - Cursos completados.
   - Porcentaje y cantidad de lecciones terminadas por curso.
2. Mantener el avance capítulo por capítulo y el cálculo actual de progreso.
3. Destacar la próxima lección disponible y ofrecer una acción clara para continuar.
4. Conservar bloqueados los capítulos pagos hasta que exista una compra confirmada.
5. Añadir estados vacíos concretos para cuentas sin compras y búsquedas sin resultados.
6. Revisar la experiencia móvil del reproductor, navegación entre capítulos y materiales adjuntos.

### Criterios de aceptación

- Cada alumno ve únicamente sus compras y su progreso.
- Completar o desmarcar una lección actualiza el porcentaje correcto.
- Al volver a ingresar, el alumno retoma desde un punto claro.

## Fase 5 — Administración de cursos

1. Renombrar “Teacher mode” como **Administración**.
2. Mantener la creación y edición de cursos, capítulos, portada, descripción, adjuntos, precio y video.
3. Conservar el orden manual de capítulos.
4. Mostrar un checklist de publicación con los campos realmente obligatorios.
5. Presentar estados visibles: borrador, publicado y no publicado.
6. Ajustar analíticas para mostrar únicamente pagos aprobados e inscripciones confirmadas.
7. Cambiar “ganancias” por importes reales registrados en Mercado Pago, sin inferir ventas desde precios actuales del curso.

### Criterios de aceptación

- El administrador completa todo el ciclo de un curso sin salir del área privada.
- Ninguna edición de precio altera el monto histórico de una venta.
- Un curso sin requisitos mínimos no puede publicarse.

## Fase 6 — Pulido visual y Thiings

1. Definir una dirección sobria y tecnológica: tipografía nítida, fondo claro, contraste alto, una paleta corta y acentos consistentes.
2. Mejorar espaciado, tamaños, estados de foco, botones, cards, formularios, tablas y navegación móvil sin rediseñar el funcionamiento central.
3. Usar iconos de Thiings en puntos de identidad: portada, categorías, beneficios y estados vacíos.
4. Mantener iconos vectoriales simples para controles funcionales pequeños, donde la lectura rápida y la accesibilidad pesan más que la ilustración.
5. Guardar los recursos aprobados dentro de `public/thiings/`, optimizados y con texto alternativo adecuado.
6. Confirmar una licencia de Thiings que autorice el uso comercial antes de publicar.

### Criterios de aceptación

- La interfaz se siente unificada en escritorio y móvil.
- Los iconos acompañan la jerarquía sin competir con el contenido.
- Botones, campos y navegación mantienen estados visibles de foco, carga, éxito y error.

## Fase 7 — WhatsApp

1. Incorporar un acceso flotante discreto en el sitio público.
2. Añadir una acción de contacto en la página de cada curso.
3. Construir el enlace con `NEXT_PUBLIC_WHATSAPP_NUMBER` y un mensaje inicial configurable.
4. Abrir `wa.me` en una pestaña nueva y mantener visible una etiqueta textual, no solo el icono.
5. Ocultar el acceso cuando el número no esté configurado.

### Criterios de aceptación

- El enlace abre el chat correcto tanto en móvil como en escritorio.
- El número no contiene `+`, espacios ni guiones.
- La compra y el soporte siguen siendo acciones separadas.

## Fase 8 — Dominio y salida a producción

1. Conectar el dominio público de Kiwi Academia al proveedor de hosting.
2. Redirigir la variante `www` al dominio canónico o aplicar la decisión inversa de forma consistente.
3. Cargar las variables de producción del archivo `.env` en el hosting, sin subir el archivo al repositorio.
4. Configurar `BETTER_AUTH_URL`, el secreto de sesión y el remitente de recuperación para producción.
5. Registrar la URL pública de Kiwi Academia seguida de `/api/webhooks/mercadopago` en Mercado Pago.
6. Activar credenciales productivas únicamente después de validar el circuito completo con credenciales de prueba.
7. Verificar HTTPS, metadata social, indexación y enlaces absolutos.

## Validación final

- Registro, ingreso, cierre de sesión y recuperación de acceso.
- Separación real entre alumno y administrador.
- Creación, edición, publicación y consumo de un curso.
- Compra aprobada, pendiente y rechazada en Mercado Pago.
- Firma, reintentos e idempotencia del webhook.
- Progreso persistente por alumno.
- WhatsApp en móvil y escritorio.
- Portada, dashboard, curso y administración en anchos móviles y de escritorio.
- Ausencia completa de Stripe y del branding del tutorial original.
- Revisión de textos en español, accesibilidad básica y codificación UTF-8.

## Orden recomendado de implementación

1. Marca, rutas y layout público.
2. Autorización del administrador en servidor.
3. Modelo de pagos y migración de base de datos.
4. Checkout Pro y webhook de Mercado Pago.
5. Dashboard y experiencia del curso.
6. Administración y analíticas.
7. Pulido visual, recursos de Thiings y WhatsApp.
8. Dominio, credenciales productivas y validación completa.

El checkout debe permanecer fuera de producción hasta completar las credenciales externas y validar webhook, idempotencia y permisos con pagos de prueba.
