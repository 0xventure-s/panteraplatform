import "server-only";

import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/secrets";

const API_URL = "https://api.mercadopago.com";

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  user_id: number;
  refresh_token?: string;
  public_key?: string;
  live_mode?: boolean;
}

export interface MercadoPagoPaymentResponse {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  transaction_amount: number;
  currency_id: string;
  payer?: {
    email?: string;
  };
  metadata?: {
    course_id?: string;
    payment_id?: string;
    user_id?: string;
  };
}

interface PreferenceInput {
  externalReference: string;
  title: string;
  price: number;
  payerEmail: string;
  courseId: string;
  paymentId: string;
  userId: string;
}

interface PreferenceResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.message || body?.error || "Mercado Pago rechazó la solicitud";
    throw new Error(message);
  }

  return body as T;
};

const requestOAuthToken = async (body: Record<string, string | boolean>) => {
  const response = await fetch(`${API_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return parseApiResponse<OAuthTokenResponse>(response);
};

export const exchangeOAuthCode = async ({
  code,
  codeVerifier,
}: {
  code: string;
  codeVerifier: string;
}) => {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Falta completar la configuración OAuth de Mercado Pago");
  }

  return requestOAuthToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });
};

const saveRefreshedConnection = async (
  connectionId: string,
  token: OAuthTokenResponse,
  previousRefreshToken?: string,
) => {
  const refreshToken = token.refresh_token || previousRefreshToken;

  return db.mercadoPagoConnection.update({
    where: { id: connectionId },
    data: {
      mercadoPagoUserId: String(token.user_id),
      encryptedAccessToken: encryptSecret(token.access_token),
      encryptedRefreshToken: refreshToken ? encryptSecret(refreshToken) : null,
      publicKey: token.public_key,
      liveMode: Boolean(token.live_mode),
      scope: token.scope,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    },
  });
};

export const saveMercadoPagoConnection = async ({
  token,
  adminUserId,
}: {
  token: OAuthTokenResponse;
  adminUserId: string;
}) => {
  await db.mercadoPagoConnection.upsert({
    where: { id: "primary" },
    create: {
      id: "primary",
      mercadoPagoUserId: String(token.user_id),
      encryptedAccessToken: encryptSecret(token.access_token),
      encryptedRefreshToken: token.refresh_token
        ? encryptSecret(token.refresh_token)
        : null,
      publicKey: token.public_key,
      liveMode: Boolean(token.live_mode),
      scope: token.scope,
      connectedByUserId: adminUserId,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    },
    update: {
      mercadoPagoUserId: String(token.user_id),
      encryptedAccessToken: encryptSecret(token.access_token),
      encryptedRefreshToken: token.refresh_token
        ? encryptSecret(token.refresh_token)
        : null,
      publicKey: token.public_key,
      liveMode: Boolean(token.live_mode),
      scope: token.scope,
      connectedByUserId: adminUserId,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    },
  });
};

export const getMercadoPagoAccess = async () => {
  const connection = await db.mercadoPagoConnection.findUnique({
    where: { id: "primary" },
  });

  if (!connection) {
    return null;
  }

  const accessToken = decryptSecret(connection.encryptedAccessToken);
  const expiresSoon = connection.expiresAt
    ? connection.expiresAt.getTime() <= Date.now() + 5 * 60 * 1000
    : false;

  if (!expiresSoon) {
    return {
      accessToken,
      liveMode: connection.liveMode,
      mercadoPagoUserId: connection.mercadoPagoUserId,
    };
  }

  if (!connection.encryptedRefreshToken) {
    throw new Error("La conexión con Mercado Pago venció. Volvé a conectarla.");
  }

  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const refreshToken = decryptSecret(connection.encryptedRefreshToken);

  if (!clientId || !clientSecret) {
    throw new Error("Falta completar la configuración OAuth de Mercado Pago");
  }

  const refreshed = await requestOAuthToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const saved = await saveRefreshedConnection(
    connection.id,
    refreshed,
    refreshToken,
  );

  return {
    accessToken: refreshed.access_token,
    liveMode: saved.liveMode,
    mercadoPagoUserId: saved.mercadoPagoUserId,
  };
};

export const createMercadoPagoPreference = async (
  accessToken: string,
  input: PreferenceInput,
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!appUrl) {
    throw new Error("Falta configurar NEXT_PUBLIC_APP_URL");
  }

  const resultUrl = `${appUrl}/pagos/resultado`;
  const response = await fetch(`${API_URL}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": input.paymentId,
    },
    body: JSON.stringify({
      items: [
        {
          id: input.courseId,
          title: input.title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: input.price,
        },
      ],
      payer: {
        email: input.payerEmail,
      },
      external_reference: input.externalReference,
      metadata: {
        course_id: input.courseId,
        payment_id: input.paymentId,
        user_id: input.userId,
      },
      back_urls: {
        success: `${resultUrl}?status=success&courseId=${input.courseId}`,
        pending: `${resultUrl}?status=pending&courseId=${input.courseId}`,
        failure: `${resultUrl}?status=failure&courseId=${input.courseId}`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "KIWI ACADEMIA",
    }),
    cache: "no-store",
  });

  return parseApiResponse<PreferenceResponse>(response);
};

export const getMercadoPagoPayment = async (
  accessToken: string,
  paymentId: string,
) => {
  const response = await fetch(`${API_URL}/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  return parseApiResponse<MercadoPagoPaymentResponse>(response);
};
