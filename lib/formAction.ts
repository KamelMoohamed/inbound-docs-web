/**
 * Wrap a server action (used with `useActionState`) so a client→server transport
 * failure — offline, dropped connection — surfaces as a friendly inline error in
 * the form instead of bubbling up to the full-page error boundary (which loses
 * the user's input and shows a generic "this page couldn't load" screen).
 *
 * Next's control-flow "errors" for `redirect()` / `notFound()` are re-thrown so
 * the happy-path navigation still works on success.
 */
export function withNetworkGuard<S extends { error?: string } | null>(
  action: (prev: S, formData: FormData) => Promise<S>,
): (prev: S, formData: FormData) => Promise<S> {
  return async (prev, formData) => {
    try {
      return await action(prev, formData);
    } catch (e) {
      if (isNextControlFlow(e)) throw e;
      return { error: "Network error — please check your connection and try again." } as S;
    }
  };
}

export function isNextControlFlow(e: unknown): boolean {
  if (typeof e !== "object" || e === null || !("digest" in e)) return false;
  const digest = (e as { digest: unknown }).digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND");
}
