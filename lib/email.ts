import "server-only";

interface PasswordResetEmailInput {
  email: string;
  name: string;
  url: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character];
  });

export const sendPasswordResetEmail = async ({
  email,
  name,
  url,
}: PasswordResetEmailInput) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Falta configurar el correo de recuperación de acceso");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Recuperá tu acceso a Kiwi Academia",
      html: `
        <div style="font-family:Arial,sans-serif;color:#1d1a18;line-height:1.6">
          <h1 style="font-size:24px">Elegí una nueva contraseña</h1>
          <p>Hola${name ? ` ${escapeHtml(name)}` : ""}. Recibimos una solicitud para recuperar tu acceso.</p>
          <p><a href="${url}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#1d1a18;color:#fff;text-decoration:none;font-weight:700">Crear nueva contraseña</a></p>
          <p style="color:#6f6964">Si no hiciste esta solicitud, no necesitás realizar ninguna acción.</p>
        </div>
      `,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No pudimos enviar el correo de recuperación");
  }
};
