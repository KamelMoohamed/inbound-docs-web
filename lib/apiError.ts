/** Parse a JSON or plain-text API error body into a user-facing message. */
export function messageFromApiBody(
  status: number,
  body: string,
  method: string,
  path: string,
): string {
  const fallback = `${method} ${path} failed (${status})`;
  if (!body.trim()) return fallback;
  try {
    const j = JSON.parse(body) as {
      error?: string;
      message?: string;
      detail?: string | { msg?: string }[];
    };
    if (typeof j.error === "string" && j.error) return j.error;
    if (typeof j.message === "string" && j.message) return j.message;
    if (typeof j.detail === "string" && j.detail) return j.detail;
    if (Array.isArray(j.detail)) {
      const msgs = j.detail.map((d) => d?.msg).filter(Boolean);
      if (msgs.length) return msgs.join("; ");
    }
  } catch {
    if (body.length <= 300) return body;
  }
  return fallback;
}
