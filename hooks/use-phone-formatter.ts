"use client"

import { useState } from "react"

/**
 * A tiny helper that:
 * 1. Keeps the raw phone string exactly as the user types it (for the input value)
 * 2. Exposes `formattedPhone` – the same value but *without any spaces* –
 *    which is what the backend expects.
 *
 * Usage:
 * const { formattedPhone, setRawPhone } = usePhoneFormatter()
 */
export function usePhoneFormatter(initialValue = "998 ") {
  const [rawPhone, setRawPhone] = useState<string>(initialValue)

  // Remove **all** whitespace before sending to the backend
  const formattedPhone = rawPhone.replace(/\s/g, "")

  return {
    rawPhone,
    setRawPhone,
    formattedPhone,
  }
}
