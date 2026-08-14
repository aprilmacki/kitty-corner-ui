export const RETURN_URL_PARAM = 'returnUrl';

/**
 * The return URL travels through the query string, so it's attacker-controllable: a crafted
 * link could otherwise turn sign-in into an open redirect. Only same-origin absolute paths
 * are accepted — `//evil.example` and `https://evil.example` are not paths, they're
 * somewhere else. Returns null when the value can't be trusted, so callers fall back.
 */
export function sanitizeReturnUrl(returnUrl: string | null | undefined): string | null {
  if (returnUrl == null || returnUrl.length === 0) {
    return null;
  }
  if (!returnUrl.startsWith('/')) {
    return null;
  }
  // A second leading slash is protocol-relative; browsers also read a backslash as a slash.
  if (returnUrl.startsWith('//') || returnUrl.startsWith('/\\')) {
    return null;
  }
  return returnUrl;
}
