import { CurrencyType, NetworkType, type Currency } from '@exchanger/shared';

export function generateMockAddress(currency: Currency): string {
  if (currency.type === CurrencyType.FIAT) {
    return '';
  }

  const network = currency.network || NetworkType.BTC;
  
  switch (network) {
    case NetworkType.BTC:
      const btcRandom = Math.random().toString(36).substring(2, 34);
      return `bc1q${btcRandom.slice(0, 39)}`;
    
    case NetworkType.ETH:
    case NetworkType.BSC:
      const ethRandom = Math.random().toString(16).substring(2, 42);
      return `0x${ethRandom}`;
    
    case NetworkType.TRON:
      const trxRandom = Math.random().toString(36).substring(2, 34);
      return `T${trxRandom.slice(0, 33)}`;
    
    case NetworkType.TON:
      const tonRandom = Math.random().toString(36).substring(2, 34);
      return `EQ${tonRandom.slice(0, 46)}`;
    
    case NetworkType.LTC:
      const ltcRandom = Math.random().toString(36).substring(2, 34);
      return `ltc1q${ltcRandom.slice(0, 39)}`;
    
    default:
      const defaultRandom = Math.random().toString(16).substring(2, 42);
      return `0x${defaultRandom}`;
  }
}
