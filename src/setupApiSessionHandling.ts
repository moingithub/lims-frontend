import { API_BASE_URL } from "./config/api";
import { authService } from "./services/authService";

const nativeFetch = window.fetch.bind(window);

function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  if (input instanceof Request) return input.url;
  return String(input);
}

function isAuthLoginRequest(url: string): boolean {
  return /\/auth\/login(?:\?|#|$)/i.test(url);
}

function isOurApiRequest(url: string): boolean {
  const base = API_BASE_URL.replace(/\/$/, "");
  if (!base) return false;
  if (url.startsWith(base) || url.includes(`${base}/`)) return true;
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    return pathname === base || pathname.startsWith(`${base}/`);
  } catch {
    return false;
  }
}

let installed = false;

/** Intercepts API 401 responses and ends the session so the login screen is shown. */
export function installApiSessionHandling(): void {
  if (installed) return;
  installed = true;

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const response = await nativeFetch(input, init);
    const url = resolveRequestUrl(input);

    if (
      response.status === 401 &&
      isOurApiRequest(url) &&
      !isAuthLoginRequest(url)
    ) {
      void authService.handleUnauthorizedApiResponse();
    }

    return response;
  };
}
