/**
 * Input sanitization and validation utilities.
 *
 * Defense-in-depth: React already escapes rendered strings, but we sanitize
 * at the API boundary to prevent stored XSS in case data is ever rendered
 * outside React (emails, PDFs, raw JSON exports, etc.).
 */

/**
 * Strip HTML tags from a string. Simple but effective — removes anything
 * between < and > to prevent XSS payloads in stored user input.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize a free-text string: strip HTML, collapse whitespace, and
 * enforce a maximum length.
 */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  let clean = stripHtml(input);
  clean = clean.replace(/\s+/g, " ").trim();
  return clean.slice(0, maxLength);
}

/**
 * Validate and sanitize a phone number. Keeps only digits, +, -, and spaces.
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^\d+\-\s()]/g, "").trim().slice(0, 20);
}

/**
 * Validate an email address (basic RFC 5322 pattern).
 */
export function isValidEmail(input: unknown): boolean {
  if (typeof input !== "string") return false;
  // Intentionally permissive — catches obvious garbage without
  // rejecting legitimate edge-case addresses.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) && input.length <= 254;
}

/**
 * Validate a URL. Only allows http and https protocols to prevent
 * javascript: URI injection.
 */
export function isValidUrl(input: unknown): boolean {
  if (typeof input !== "string") return false;
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitize a URL string: validates protocol and returns it, or empty string.
 */
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!isValidUrl(trimmed)) return "";
  return trimmed.slice(0, 2048); // reasonable URL length limit
}

/**
 * Validate a grade string — must be a recognizable class level.
 */
export function isValidGrade(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const valid = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  return valid.includes(input.trim());
}

/**
 * Validate password strength.
 * Requirements: min 8 chars, at least one uppercase, one lowercase, one digit.
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number." };
  }
  return { valid: true, message: "" };
}

/**
 * Parse and validate a JSON request body with size limit.
 * Returns null and an error message if validation fails.
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxSizeBytes = 10_000 // 10 KB default — plenty for form data
): Promise<{ data: T | null; error: string | null }> {
  // Check Content-Type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return { data: null, error: "Content-Type must be application/json." };
  }

  // Check Content-Length if available
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
    return { data: null, error: `Request body too large (max ${maxSizeBytes} bytes).` };
  }

  try {
    const text = await request.text();
    if (text.length > maxSizeBytes) {
      return { data: null, error: `Request body too large (max ${maxSizeBytes} bytes).` };
    }
    const data = JSON.parse(text) as T;
    return { data, error: null };
  } catch {
    return { data: null, error: "Invalid JSON in request body." };
  }
}
