"use client";

import { useState, useEffect } from "react";

// Mapping of common Locales to Currency codes
const getCurrencyFromLocale = (locale: string): string => {
    // Try to isolate the country code from "en-US", "en-GB", "ja-JP"
    const parts = locale.split('-');
    const country = parts.length > 1 ? parts[1].toUpperCase() : '';

    switch (country) {
        case 'US': return 'USD';
        case 'GB': return 'GBP';
        case 'EU': return 'EUR';
        case 'JP': return 'JPY';
        case 'IN': return 'INR';
        case 'CN': return 'CNY';
        case 'KR': return 'KRW';
        case 'AU': return 'AUD';
        case 'CA': return 'CAD';
        case 'SG': return 'SGD';
        case 'ZA': return 'ZAR';
        case 'AE': return 'AED';
        default: return 'USD'; // Fallback strictly required by Amadeus
    }
}

export function useUserCurrency() {
    const [currency, setCurrency] = useState<string>('USD');

    useEffect(() => {
        try {
            // e.g. "en-US"
            const locale = Intl.DateTimeFormat().resolvedOptions().locale;
            const code = getCurrencyFromLocale(locale);
            setCurrency(code);
        } catch (e) {
            console.warn("Could not determine user locale, defaulting to USD");
            setCurrency('USD');
        }
    }, []);

    return currency;
}
