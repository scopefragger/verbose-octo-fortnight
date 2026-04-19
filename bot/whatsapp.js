const messagesUrl = () =>
  `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const headers = () => ({
  Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
});

/**
 * Send a plain text message. Works within a 24-hour session window.
 * Returns the WhatsApp message ID (wamid.xxx) for digest reply tracking.
 */
export async function sendMessage(to, text) {
  const res = await fetch(messagesUrl(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text, preview_url: false },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp sendMessage failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.messages?.[0]?.id ?? null;
}

/**
 * Mark an incoming message as read (shows double blue tick).
 * Non-critical — errors are logged but not thrown.
 */
export async function markRead(messageId) {
  fetch(messagesUrl(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  }).catch((err) => console.error('markRead failed:', err.message));
}

/**
 * Verify the HMAC-SHA256 signature on incoming webhook payloads.
 * Meta sends X-Hub-Signature-256: sha256=<hex>
 */
export async function verifySignature(rawBody, signatureHeader) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true; // Skip verification if secret not configured

  const [, received] = (signatureHeader || '').split('=');
  if (!received) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expected === received;
}
