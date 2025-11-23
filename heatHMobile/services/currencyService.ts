/**
 * Currency conversion service
 * Converts between USD (base currency) and local currencies based on language
 */

// Exchange rates (updated with current rates)
const EXCHANGE_RATES = {
  USD: 1,
  TRY: 42.3, // Turkish Lira per USD
  JPY: 157.12, // Japanese Yen per USD
} as const;

export type Currency = 'USD' | 'TRY' | 'JPY';

/**
 * Get currency symbol for a language
 */
export function getCurrencySymbol(language: string): string {
  if (language.startsWith('tr')) return '₺';
  if (language.startsWith('ja')) return '¥';
  return '$';
}

/**
 * Get currency code for a language
 */
export function getCurrencyCode(language: string): Currency {
  if (language.startsWith('tr')) return 'TRY';
  if (language.startsWith('ja')) return 'JPY';
  return 'USD';
}

/**
 * Convert USD to local currency
 */
export function convertFromUSD(usdAmount: number, targetCurrency: Currency): number {
  if (targetCurrency === 'USD') return usdAmount;
  return usdAmount * EXCHANGE_RATES[targetCurrency];
}

/**
 * Convert local currency to USD
 */
export function convertToUSD(localAmount: number, sourceCurrency: Currency): number {
  if (sourceCurrency === 'USD') return localAmount;
  return localAmount / EXCHANGE_RATES[sourceCurrency];
}

/**
 * Format price with currency symbol
 */
export function formatPrice(usdAmount: number | null | undefined, language: string): string {
  if (usdAmount == null) return '-';
  
  const currency = getCurrencyCode(language);
  const symbol = getCurrencySymbol(language);
  const convertedAmount = convertFromUSD(usdAmount, currency);
  
  // Format with appropriate decimal places
  if (currency === 'JPY') {
    // Japanese Yen typically doesn't use decimals
    return `${symbol}${Math.round(convertedAmount).toLocaleString()}`;
  } else {
    // USD and TRY use 2 decimal places
    return `${symbol}${convertedAmount.toFixed(2)}`;
  }
}

/**
 * Parse price from local currency input to USD
 */
export function parsePriceToUSD(localAmountString: string, language: string): number | null {
  const amount = parseFloat(localAmountString);
  if (isNaN(amount)) return null;
  
  const currency = getCurrencyCode(language);
  return convertToUSD(amount, currency);
}

/**
 * Format price for input (USD to local currency)
 */
export function formatPriceForInput(usdAmount: number | null | undefined, language: string): string {
  if (usdAmount == null || usdAmount === 0) return '';
  
  const currency = getCurrencyCode(language);
  const convertedAmount = convertFromUSD(usdAmount, currency);
  
  // Format with appropriate decimal places
  if (currency === 'JPY') {
    return Math.round(convertedAmount).toString();
  } else {
    return convertedAmount.toFixed(2);
  }
}

