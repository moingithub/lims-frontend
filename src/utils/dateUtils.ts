/**
 * Utility functions for date formatting in US format (MM/DD/YYYY)
 */

/**
 * Format a date string or Date object to US date format (MM/DD/YYYY)
 * @param date - Date string (YYYY-MM-DD or any valid date format) or Date object
 * @returns Formatted date string in MM/DD/YYYY format
 */
export function formatDateUS(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * Get current date in US format (MM/DD/YYYY)
 * @returns Current date as MM/DD/YYYY
 */
export function getCurrentDateUS(): string {
  return formatDateUS(new Date());
}

/**
 * Get current date and time in US format (MM/DD/YYYY HH:MM:SS AM/PM)
 * @returns Current date and time in US format
 */
export function getCurrentDateTimeUS(): string {
  const now = new Date();
  const date = formatDateUS(now);
  const time = now.toLocaleTimeString("en-US");
  return `${date} ${time}`;
}

/**
 * Convert ISO date string (YYYY-MM-DD) to US format (MM/DD/YYYY)
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Date in MM/DD/YYYY format
 */
export function isoToUSDate(isoDate: string): string {
  if (!isoDate) return "";
  const dateOnly = isoDate.trim().split(/[T\s]/)[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-");
    return `${month}/${day}/${year}`;
  }
  return formatDateUS(isoDate);
}

/**
 * Convert US date (MM/DD/YYYY) to ISO format (YYYY-MM-DD) for input fields
 * @param usDate - US formatted date (MM/DD/YYYY)
 * @returns ISO date string (YYYY-MM-DD)
 */
export function usDateToISO(usDate: string): string {
  if (!usDate) return "";

  const parts = usDate.split("/");
  if (parts.length !== 3) return "";

  const month = parts[0].padStart(2, "0");
  const day = parts[1].padStart(2, "0");
  const year = parts[2];

  return `${year}-${month}-${day}`;
}

/**
 * Normalize assorted date strings to YYYY-MM-DD for HTML date inputs.
 */
export function toIsoDateInputValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    return usDateToISO(trimmed);
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(trimmed)) {
    const [month, day, yearPart] = trimmed.split("/");
    const shortYear = Number(yearPart);
    const fullYear = shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear;
    return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{1,2}\/\d{1,2}$/.test(trimmed)) {
    const [month, day] = trimmed.split("/");
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
}

export function formatUsDateInputDisplay(value: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-");
    return `${month}/${day}/${year}`;
  }

  return trimmed;
}

export function normalizeUsDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export function parseUsDateInputToIso(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return cleaned;
  }

  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Format a sampled date for display (accepts ISO or US format).
 */
export function formatSampledDate(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return isoToUSDate(value);
  }
  return value;
}

/**
 * Pull a date portion from ISO datetime or plain date strings.
 */
export function extractDateFromDateTime(
  value: string | null | undefined,
): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) return trimmed;

  const dateOnly = trimmed.split(/[T\s]/)[0]?.trim() ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateOnly;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateOnly)) return dateOnly;

  return trimmed;
}

/**
 * Format the first usable date-like value for display (MM/DD/YYYY).
 */
export function resolveDisplayDate(
  ...sources: (string | null | undefined)[]
): string {
  for (const source of sources) {
    const trimmed = source?.trim();
    if (!trimmed) continue;

    const isoFormatted = isoToUSDate(trimmed);
    if (isoFormatted) return isoFormatted;

    const sampledFormatted = formatSampledDate(trimmed);
    if (sampledFormatted) return sampledFormatted;
  }

  return "";
}

/**
 * Format check-in datetime for display (MM/DD/YYYY h:mm AM/PM).
 */
export function formatCheckInTime(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed) && /(AM|PM)/i.test(trimmed)) {
    return trimmed;
  }

  const dateObj = new Date(trimmed);
  if (Number.isNaN(dateObj.getTime())) return trimmed;

  const date = formatDateUS(dateObj);
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

/**
 * Format ISO datetime string to MM/DD/YYYY h:mm AM/PM format.
 * @param isoDateTime - ISO datetime string (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD HH:MM:SS)
 * @returns Formatted datetime string in MM/DD/YYYY h:mm AM/PM format
 */
export function formatDateTimeUS(isoDateTime: string): string {
  if (!isoDateTime) return "";

  const dateObj = new Date(isoDateTime);

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const year = dateObj.getFullYear();

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}
