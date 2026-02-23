
export const REGISTRATION_PRICES = {
    DOMESTIC_ASSESSOR: 275,
    COMMERCIAL_ASSESSOR: 275,
    BUNDLE_ASSESSOR: 350,
    BUSINESS_REGISTRATION: 300,
} as const;

export const VAT_RATE = 0.23;

export type RegistrationType = keyof typeof REGISTRATION_PRICES;
