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
    const digits = raw.replace(/\D/g, "");

    // We expect Uzbek phone numbers that already start with 998
    if (!digits.startsWith("998")) return raw;

    const body = digits.slice(3); // remove country code
    const parts = [
        body.slice(0, 2), // XX
        body.slice(2, 5), // XXX
        body.slice(5, 7), // XX
        body.slice(7, 9), // XX
    ].filter(Boolean);

    return `+998 ${parts.join(" ")}`.trim();
}

export const handlePhoneInputChange = (value: string, currentValue: string): string => {
    // If user tries to delete or modify the "998" part, keep it
    if (value.length < 3 || !value.startsWith("998")) {
        return "998 ";
    }

    // Remove all non-digits except from position after "998 "
    const afterPrefix = value.slice(4); // Skip "998 "
    const digits = afterPrefix.replace(/\D/g, "");

    // Limit to 9 digits after 998
    const limitedDigits = digits.slice(0, 9);

    // Format the remaining digits
    if (limitedDigits.length === 0) {
        return "998 ";
    } else if (limitedDigits.length <= 2) {
        return `998 ${limitedDigits}`;
    } else if (limitedDigits.length <= 5) {
        return `998 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`;
    } else if (limitedDigits.length <= 7) {
        return `998 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 5)} ${limitedDigits.slice(5)}`;
    } else {
        return `998 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 5)} ${limitedDigits.slice(5, 7)} ${limitedDigits.slice(7)}`;
    }
};

export const formatPhoneInput = (value: string): string => {
    // Remove all non-digits
    let digits = value.replace(/\D/g, "");

    // Always ensure it starts with 998
    if (!digits.startsWith("998")) {
        digits = "998" + digits.replace(/^998/, "");
    }

    // Limit to 12 digits total
    digits = digits.slice(0, 12);

    // Format as 998 90 123 45 67
    if (digits.length <= 3) {
        return "998";
    } else if (digits.length <= 5) {
        return `998 ${digits.slice(3)}`;
    } else if (digits.length <= 8) {
        return `998 ${digits.slice(3, 5)} ${digits.slice(5)}`;
    } else if (digits.length <= 10) {
        return `998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    } else {
        return `998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
    }
};

export const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("998");
};

export const getPhoneDigits = (phone: string): string => {
    return phone.replace(/\D/g, "");
};

/**
 * Convert whatever the user typed/displayed → `"998901234567"`
 */
export function normalizePhoneForBackend(display: string): string {
    return display.replace(/\D/g, ""); // only digits
}

export const getPhoneForBackend = (phone: string): string => {
    return phone.replace(/\s/g, "");
};
