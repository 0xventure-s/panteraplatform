# Configuración de variables y servicios

El archivo `.env` incluido en el proyecto contiene la configuración de Kiwi Academia. Está ignorado por Git y no debe copiarse en commits, capturas ni mensajes.

## Aplicación y WhatsApp

```env
NEXT_PUBLIC_APP_URL=""
NEXT_PUBLIC_SITE_NAME="Kiwi Academia"
NEXT_PUBLIC_SITE_DESCRIPTION="Cursos de IA para construir productos."
NEXT_PUBLIC_WHATSAPP_NUMBER=""
NEXT_PUBLIC_WHATSAPP_MESSAGE="Hola. Quiero consultar por los cursos de Kiwi Academia."
```

- `NEXT_PUBLIC_APP_URL`: dominio canónico, sin barra final.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número completo en formato internacional, solo dígitos. Para Argentina debe incluir `54` y el `9` correspondiente a telefonía móvil.
- `NEXT_PUBLIC_WHATSAPP_MESSAGE`: mensaje que aparecerá preparado al abrir el chat.

## Better Auth y correo de acceso

Variables:

```env
BETTER_AUTH_URL=""
BETTER_AUTH_SECRET=""
ADMIN_EMAIL=""
ADMIN_USER_ID=""
RESEND_API_KEY=""
AUTH_EMAIL_FROM=""
```

Obtención:

1. Generar `BETTER_AUTH_SECRET` con al menos 32 caracteres aleatorios desde el generador de la documentación oficial o con `openssl rand -base64 32`.
2. Mantener `BETTER_AUTH_URL` igual al origen público exacto del sitio. En local puede usarse `http://localhost:3000`.
3. Definir `ADMIN_EMAIL` con el correo de la única cuenta administradora antes de registrarla. Better Auth le asignará el rol `admin` al crearla.
4. `ADMIN_USER_ID` es una alternativa opcional para fijar el administrador por ID. Puede dejarse vacío si se usa `ADMIN_EMAIL`.
5. Crear una cuenta en [Resend](https://resend.com/), verificar el dominio y generar una API key en **API Keys**.
6. Configurar `AUTH_EMAIL_FROM` con una dirección perteneciente al dominio verificado.

`BETTER_AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_USER_ID` y `RESEND_API_KEY` quedan únicamente en el servidor. La recuperación de contraseña funciona por correo; si Resend no está configurado, la solicitud no expone información de la cuenta pero no podrá entregar el enlace.

Documentación: [instalación de Better Auth](https://www.better-auth.com/docs/installation), [correo y contraseña](https://www.better-auth.com/docs/authentication/email-password) y [dominios en Resend](https://resend.com/docs/dashboard/domains/introduction).

## Base de datos PostgreSQL

Variable:

```env
DATABASE_URL=""
```

El esquema Prisma usa PostgreSQL. Crear una base administrada —por ejemplo en Neon— y copiar la cadena de conexión completa entregada por el proveedor.

Formato orientativo:

```text
postgresql://USUARIO:CONTRASEÑA@HOST/BASE_DE_DATOS?sslmode=require
```

Usar exactamente la URL segura del proveedor, incluidos sus parámetros SSL. La contraseña debe estar codificada para URL cuando contenga caracteres especiales.

Documentación: [conectar Prisma con PostgreSQL](https://www.prisma.io/docs/orm/overview/databases/postgresql) y [obtener la cadena de conexión de Neon](https://neon.com/docs/connect/connect-from-any-app).

## Mercado Pago

Variables:

```env
MERCADOPAGO_CLIENT_ID=""
MERCADOPAGO_CLIENT_SECRET=""
MERCADOPAGO_REDIRECT_URI=""
MERCADOPAGO_WEBHOOK_SECRET=""
INTEGRATION_ENCRYPTION_KEY=""
```

Obtención:

1. Ingresar a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app).
2. Crear una aplicación llamada **Kiwi Academia**.
3. Elegir pagos online y Checkout Pro.
4. Abrir **Detalles de la aplicación** y copiar el Client ID y el Client Secret.
5. Registrar la URL pública de Kiwi Academia seguida de `/api/mercadopago/oauth/callback` como Redirect URL exacta.
6. Habilitar OAuth con Authorization Code y PKCE.
7. Abrir **Webhooks**, registrar la URL pública de Kiwi Academia seguida de `/api/webhooks/mercadopago` y activar eventos de pagos.
8. Guardar la clave secreta generada para la firma en `MERCADOPAGO_WEBHOOK_SECRET`.
9. Generar `INTEGRATION_ENCRYPTION_KEY` con al menos 32 caracteres aleatorios y guardarla también en el hosting.
10. Ingresar como administrador en el sitio y abrir **Administración → Integraciones → Conectar Mercado Pago**.

El Client Secret, la clave del webhook y la clave de cifrado quedan únicamente en el servidor. El botón de conexión abre Mercado Pago, solicita autorización y guarda el Access Token y Refresh Token cifrados en la base. Los tokens se renuevan automáticamente cuando están por vencer.

El `.env` local ya contiene una clave de cifrado aleatoria. No reemplazarla después de conectar Mercado Pago: si se rota, primero habrá que desconectar y volver a autorizar la cuenta.

Documentación: [OAuth con Authorization Code y PKCE](https://www.mercadopago.com.ar/developers/es/docs/security/oauth/creation), [credenciales de Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/credentials), [cuentas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/test-accounts) y [Webhooks](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/additional-content/your-integrations/notifications/webhooks).

Las URLs deben responder por HTTPS y coincidir exactamente con las registradas en Mercado Pago.

## UploadThing

Variables de la versión 5.x instalada:

```env
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

Obtención:

1. Ingresar a [UploadThing Dashboard](https://uploadthing.com/dashboard).
2. Crear o elegir la aplicación del proyecto.
3. Abrir **API Keys**.
4. Copiar el Secret y el App ID compatibles con UploadThing 5.x.

El repositorio utiliza `uploadthing@5.5.3`. Las versiones actuales de UploadThing ofrecen un único `UPLOADTHING_TOKEN`; no cambiar al token nuevo sin actualizar antes el paquete y la integración.

Documentación: [inicio de UploadThing](https://docs.uploadthing.com/) y [migración a v7](https://docs.uploadthing.com/v7).

## Mux Video

Variables:

```env
MUX_TOKEN_ID=""
MUX_TOKEN_SECRET=""
```

Obtención:

1. Ingresar a [Mux Dashboard](https://dashboard.mux.com/).
2. Abrir **Settings → Access Tokens**.
3. Crear un token para el entorno correcto con permisos de lectura y escritura sobre Mux Video.
4. Copiar Token ID y Token Secret.

Mux muestra el secreto una sola vez. Si se pierde, crear un token nuevo. Ambas variables quedan exclusivamente en el servidor.

Documentación: [fundamentos y Access Tokens de Mux](https://www.mux.com/docs/core/mux-fundamentals).

## Thiings

Thiings no requiere una variable de entorno. Seleccionar y descargar los recursos visuales aprobados desde [thiings.co](https://www.thiings.co/) y guardarlos en `public/thiings/`.

El uso comercial requiere una licencia compatible con el proyecto. Las descargas gratuitas se limitan a uso personal, no comercial y con atribución. Revisar los [términos de Thiings](https://www.thiings.co/terms) antes de publicar.

## Variables públicas y privadas

| Variable | Navegador | Servidor | Secreta |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Sí | Sí | No |
| `NEXT_PUBLIC_SITE_NAME` | Sí | Sí | No |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Sí | Sí | No |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Sí | Sí | No |
| `NEXT_PUBLIC_WHATSAPP_MESSAGE` | Sí | Sí | No |
| `BETTER_AUTH_URL` | No | Sí | No |
| `BETTER_AUTH_SECRET` | No | Sí | Sí |
| `ADMIN_EMAIL` | No | Sí | No, pero es privada |
| `ADMIN_USER_ID` | No | Sí | No, pero es privada |
| `RESEND_API_KEY` | No | Sí | Sí |
| `AUTH_EMAIL_FROM` | No | Sí | No |
| `DATABASE_URL` | No | Sí | Sí |
| `MERCADOPAGO_CLIENT_ID` | No | Sí | No, pero es privada |
| `MERCADOPAGO_CLIENT_SECRET` | No | Sí | Sí |
| `MERCADOPAGO_REDIRECT_URI` | No | Sí | No |
| `MERCADOPAGO_WEBHOOK_SECRET` | No | Sí | Sí |
| `INTEGRATION_ENCRYPTION_KEY` | No | Sí | Sí |
| `UPLOADTHING_SECRET` | No | Sí | Sí |
| `UPLOADTHING_APP_ID` | No | Sí | No, pero es privada |
| `MUX_TOKEN_ID` | No | Sí | No, pero es privada |
| `MUX_TOKEN_SECRET` | No | Sí | Sí |

Toda variable con `NEXT_PUBLIC_` queda incluida en el JavaScript que recibe el navegador. Nunca usar ese prefijo para tokens, secretos o cadenas de conexión.

## Producción

1. Completar `.env` local con credenciales de prueba.
2. Cargar las mismas claves por nombre en el proveedor de hosting.
3. Separar credenciales de prueba y producción para Mercado Pago, Better Auth, Resend y Mux.
4. No copiar `.env` al repositorio.
5. Rotar cualquier secreto que se haya compartido por error.
6. Validar el dominio de Better Auth, el remitente de Resend y el webhook de Mercado Pago después del despliegue.

Stripe ya no forma parte de la aplicación. Eliminar sus variables del hosting después de aplicar la migración y validar un pago completo con Mercado Pago.
