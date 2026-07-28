// Shared form validation utilities

export type ValidationResult = { valid: boolean; error: string }

const ok: ValidationResult = { valid: true, error: '' }
const fail = (msg: string): ValidationResult => ({ valid: false, error: msg })

export function validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value || !value.trim()) return fail(`${fieldName} is required`)
    return ok
}

export function validateMinLength(value: string, min: number, fieldName: string): ValidationResult {
    if (value.trim().length < min) return fail(`${fieldName} must be at least ${min} characters`)
    return ok
}

export function validateMaxLength(value: string, max: number, fieldName: string): ValidationResult {
    if (value.trim().length > max) return fail(`${fieldName} must be at most ${max} characters`)
    return ok
}

export function validateEmail(email: string): ValidationResult {
    if (!email || !email.trim()) return ok // optional unless paired with validateRequired
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!pattern.test(email.trim())) return fail('Please enter a valid email address')
    return ok
}

export function validatePhone(phone: string): ValidationResult {
    if (!phone || !phone.trim()) return ok
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) return fail('Phone number must be exactly 10 digits')
    return ok
}

export function validateUrl(url: string): ValidationResult {
    if (!url || !url.trim()) return ok
    try {
        new URL(url.trim())
        return ok
    } catch {
        return fail('Please enter a valid URL (e.g. https://example.com)')
    }
}

export function validatePassword(password: string): ValidationResult {
    if (!password) return fail('Password is required')
    if (password.length < 6) return fail('Password must be at least 6 characters')
    return ok
}

export function validateFutureDate(dateStr: string, fieldName: string): ValidationResult {
    if (!dateStr) return fail(`${fieldName} is required`)
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return fail(`${fieldName} must be today or in the future`)
    return ok
}

export function validateLength(value: string, min: number, max: number, fieldName: string): ValidationResult {
    const r1 = validateMinLength(value, min, fieldName)
    if (!r1.valid) return r1
    return validateMaxLength(value, max, fieldName)
}

/**
 * Helper to run multiple validations on a form and collect errors.
 * Usage:
 *   const errors = collectErrors({
 *     title: [validateRequired(title, 'Title'), validateLength(title, 3, 100, 'Title')],
 *     email: [validateEmail(email)],
 *   })
 */
export function collectErrors(
    fieldValidations: Record<string, ValidationResult[]>
): Record<string, string> {
    const errors: Record<string, string> = {}
    for (const [field, results] of Object.entries(fieldValidations)) {
        for (const result of results) {
            if (!result.valid) {
                errors[field] = result.error
                break // first error per field
            }
        }
    }
    return errors
}
