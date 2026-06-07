type WhatsAppEvent = {
  celebratory_name: string;
  event_date: string;
  start_time: string;
  token_unico: string;
  clients: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
};

export type WhatsAppNotificationResult =
  | {
      mode: "api";
      ok: true;
      provider: "cloud";
    }
  | {
      mode: "fallback";
      ok: true;
      provider: "wa.me";
      url: string;
      reason: string;
    };

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function buildQuestionnaireMessage(event: WhatsAppEvent, origin: string) {
  const link = `${origin}/event/${event.token_unico}`;
  const hostName = event.clients?.full_name || "familia";

  return [
    `Hola ${hostName}.`,
    `Ya esta listo el cuestionario para el evento de ${event.celebratory_name}.`,
    `Fecha: ${event.event_date} a las ${event.start_time.slice(0, 5)}.`,
    `Pueden completarlo aqui: ${link}`,
  ].join("\n");
}

export function buildWhatsAppFallbackUrl(phone: string, message: string) {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(message)}`;
}

export async function sendQuestionnaireWhatsApp(
  event: WhatsAppEvent,
  origin: string,
): Promise<WhatsAppNotificationResult> {
  const phone = event.clients?.phone;

  if (!phone) {
    throw new Error("El evento no tiene telefono de cliente.");
  }

  const message = buildQuestionnaireMessage(event, origin);
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return {
      mode: "fallback",
      ok: true,
      provider: "wa.me",
      url: buildWhatsAppFallbackUrl(phone, message),
      reason: "Faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN.",
    };
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: digitsOnly(phone),
      type: "text",
      text: {
        preview_url: true,
        body: message,
      },
    }),
  });

  if (!response.ok) {
    const fallbackUrl = buildWhatsAppFallbackUrl(phone, message);

    return {
      mode: "fallback",
      ok: true,
      provider: "wa.me",
      url: fallbackUrl,
      reason: "La API de WhatsApp no acepto el mensaje.",
    };
  }

  return {
    mode: "api",
    ok: true,
    provider: "cloud",
  };
}
