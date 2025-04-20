// /e:/project-bolt-sb1-8p3ygyus/project/services/validators.ts

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

export type ValidatorFn = (value: string) => string | null

/**
 * Vérifie que la valeur n'est pas vide.
 */
export const isRequired: ValidatorFn = (value) =>
    value.trim() ? null : "Ce champ est requis."

/**
 * Vérifie le format d'une adresse e‑mail.
 */
export const isEmail: ValidatorFn = (value) => {
    const emailRegex =
        /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    return emailRegex.test(value)
        ? null
        : "Adresse e‑mail invalide."
}

/**
 * Vérifie la robustesse d'un mot de passe :
 *  - au moins 8 caractères
 *  - une majuscule, une minuscule, un chiffre, un caractère spécial
 */
export const isStrongPassword: ValidatorFn = (value) => {
    if (value.length < 8) {
        return "Le mot de passe doit contenir au moins 8 caractères."
    }
    const rules = [
        { regex: /[A-Z]/, msg: "une majuscule" },
        { regex: /[a-z]/, msg: "une minuscule" },
        { regex: /\d/, msg: "un chiffre" },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, msg: "un caractère spécial" },
    ]
    const failed = rules
        .filter((r) => !r.regex.test(value))
        .map((r) => r.msg)
    return failed.length
        ? `Le mot de passe doit contenir ${failed.join(", ")}.`
        : null
}

/**
 * Vérifie le format d'un numéro de téléphone (FR).
 */
export const isFrenchPhone: ValidatorFn = (value) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
    return phoneRegex.test(value)
        ? null
        : "Numéro de téléphone invalide."
}

/**
 * Exécute une série de validateurs sur une même valeur.
 */
export function runValidators(
    value: string,
    validators: ValidatorFn[]
): ValidationResult {
    const errors = validators
        .map((fn) => fn(value))
        .filter((msg): msg is string => msg !== null)
    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Valide un objet de champs selon un schéma de validation.
 * rules = { fieldName: [validator1, validator2, ...] }
 */
export function validateForm<T extends Record<string, string>>(
    values: T,
    rules: { [K in keyof T]?: ValidatorFn[] }
): { [K in keyof T]: ValidationResult } {
    const result = {} as { [K in keyof T]: ValidationResult }
    for (const key in values) {
        const v = values[key]
        const fns = rules[key] || []
        result[key] = runValidators(v, fns)
    }
    return result
}