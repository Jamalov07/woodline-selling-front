/**
 * utils/phone-formatter.ts
 *
 * Very small helpers for:
 *  • showing Uzbek numbers in the familiar “+998 XX XXX XX XX” form
 *  • stripping every non-digit before sending the value to the backend
 */

/**
 * Convert `998901234567` or `+998(90)123-45-67` → `+998 90 123 45 67`
 */
export function formatPhoneForDisplay(raw: string): string {
  // keep only digits
  const digits = raw.replace(/\D/g, "")

  // We expect Uzbek phone numbers that already start with 998
  if (!digits.startsWith("998")) return raw

  const body = digits.slice(3) // remove country code
  const parts = [
    body.slice(0, 2), // XX
    body.slice(2, 5), // XXX
    body.slice(5, 7), // XX
    body.slice(7, 9), // XX
  ].filter(Boolean)

  return `+998 ${parts.join(" ")}`.trim()
}

/**
 * Convert whatever the user typed/displayed → `"998901234567"`
 */
export function normalizePhoneForBackend(display: string): string {
  return display.replace(/\D/g, "") // only digits
}
