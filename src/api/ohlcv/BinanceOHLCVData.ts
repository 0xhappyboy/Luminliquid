import { ExchangeOHLCVData } from './ExchangeOHLCVData';
import { ICandleViewDataPoint } from 'candleview';

export class BinanceOHLCVData extends ExchangeOHLCVData {
    protected baseUrl: string = 'https://api.binance.com';
    
    formatSymbol(symbol: string): string {
        return symbol.replace('/', '').toUpperCase();
    }
    
    getKlineUrl(
        symbol: string, 
        interval: string, 
        startTime?: number, 
        endTime?: number, 
        limit: number = 1000
    ): string {
        const formattedSymbol = this.formatSymbol(symbol);
        let url = `${this.baseUrl}/api/v3/klines?symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`;
        if (startTime) url += `&startTime=${startTime}`;
        if (endTime) url += `&endTime=${endTime}`;
        return url;
    }
    
    parseKlineData(data: any): ICandleViewDataPoint[] {
        if (!Array.isArray(data)) {
            return [];
        }
        
        return data.map((kline: any[]) => ({
            time: Math.floor(kline[0] / 1000),
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5]),
            isVirtual: false
        })).filter(item => !isNaN(item.time));
    }
    
    getExchangeInfoUrl(): string {
        return `${this.baseUrl}/api/v3/exchangeInfo`;
    }
    
    getTickerPriceUrl(symbol?: string): string {
        if (symbol) {
            const formattedSymbol = this.formatSymbol(symbol);
            return `${this.baseUrl}/api/v3/ticker/price?symbol=${formattedSymbol}`;
        }
        return `${this.baseUrl}/api/v3/ticker/price`;
    }
}