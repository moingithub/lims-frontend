type ValidationDetailItem = { msg?: string; loc?: string[] };

type ApiErrorBody = {
  error?: string;
  message?: string;
  detail?: string | ValidationDetailItem[] | Record<string, unknown>;
  errors?: Record<string, string[] | string>;
};

/** Reads `error`, `message`, `detail`, or validation `errors` from a failed API response. */
export async function parseApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  if (response.status === 401) return "Unauthorized";

  const rawBody = await response.text().catch(() => "");
  if (!rawBody.trim()) {
    return response.statusText?.trim() || fallback;
  }

  let body: ApiErrorBody;
  try {
    body = JSON.parse(rawBody) as ApiErrorBody;
  } catch {
    return rawBody.trim();
  }

  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }

  const detail = body.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const formatted = detail
      .map((item) =>
        item.loc?.length
          ? `${item.loc.join(".")}: ${item.msg ?? "Invalid value"}`
          : (item.msg ?? "Invalid value"),
      )
      .join("; ");
    if (formatted) return formatted;
  }
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const nested = detail as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message;
    }
    if (typeof nested.error === "string" && nested.error.trim()) {
      return nested.error;
    }
  }

  if (body.errors && typeof body.errors === "object") {
    const cylinderNumber = body.errors.cylinder_number;
    if (Array.isArray(cylinderNumber) && cylinderNumber.length) {
      return cylinderNumber.join(" ");
    }
    const flat = Object.values(body.errors).flat();
    if (flat.length) {
      return flat.map(String).join(" ");
    }
  }

  return rawBody.trim() || response.statusText?.trim() || fallback;
}
