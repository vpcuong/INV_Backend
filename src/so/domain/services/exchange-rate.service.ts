/**
 * Domain Service: Exchange Rate Service
 * Responsible for fetching and managing currency exchange rates
 */
export interface IExchangeRateService {
  getRate(currencyCode: string): Promise<number>;
}

/**
 * Default implementation - returns 1.0 for all currencies
 * In production, replace with actual API integration (e.g., Open Exchange Rates, Fixer.io, etc.)
 */
export class ExchangeRateService implements IExchangeRateService {
  /**
   * Get exchange rate for currency
   * @param currencyCode - Currency code (e.g., USD, VND, EUR)
   * @returns Exchange rate relative to base currency (default: USD)
   */
  async getRate(currencyCode: string): Promise<number> {
    // TODO: Implement actual exchange rate API integration
    // Example integrations:
    // 1. Open Exchange Rates API: https://openexchangerates.org/
    // 2. Fixer.io API: https://fixer.io/
    // 3. Currency Layer API: https://currencylayer.com/
    // 4. Database lookup for fixed rates

    // For now, return 1.0 for all currencies
    // This assumes all transactions are in the base currency
    const upperCurrencyCode = currencyCode.toUpperCase();

    // You could add hardcoded rates for testing:
    const rates: Record<string, number> = {
      USD: 1.0,
      VND: 24000, // 1 USD = 24,000 VND (example)
      EUR: 0.85, // 1 USD = 0.85 EUR (example)
      GBP: 0.73, // 1 USD = 0.73 GBP (example)
    };

    return rates[upperCurrencyCode] ?? 1.0;
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const fromRate = await this.getRate(fromCurrency);
    const toRate = await this.getRate(toCurrency);

    // Convert to base currency first, then to target currency
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }

  /**
   * Check if currency code is supported
   */
  isSupported(currencyCode: string): boolean {
    const supportedCurrencies = ['USD', 'VND', 'EUR', 'GBP'];
    return supportedCurrencies.includes(currencyCode.toUpperCase());
  }
}
