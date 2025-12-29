import { ExchangeOHLCVData } from './ExchangeOHLCVData';
import { ICandleViewDataPoint } from 'candleview';

export class BitgetOHLCVData extends ExchangeOHLCVData {
    protected baseUrl: string = 'https://api.bitget.com';
    
    formatSymbol(symbol: string): string {
        return symbol.replace('/', '');
    }
    
    getKlineUrl(
        symbol: string, 
        interval: string, 
        startTime?: number, 
        endTime?: number, 
        limit: number = 1000
    ): string {
        const formattedSymbol = this.formatSymbol(symbol);
        let url = `${this.baseUrl}/api/v2/spot/market/candles?symbol=${formattedSymbol}&period=${interval}&limit=${limit}`;
        if (startTime) url += `&after=${Math.floor(startTime / 1000)}`;
        if (endTime) url += `&before=${Math.floor(endTime / 1000)}`;
        return url;
    }
    
    parseKlineData(data: any): ICandleViewDataPoint[] {
        if (!data || !data.data || !Array.isArray(data.data)) {
            return [];
        }
        
        return data.data.map((kline: any[]) => {
            const timestamp = parseFloat(kline[0]);
            return {
                time: Math.floor(timestamp / 1000),
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5]),
                isVirtual: false
            };
        }).filter((item: { time: number; }) => !isNaN(item.time));
    }
    
    getTickersUrl(): string {
        return `${this.baseUrl}/api/v2/spot/market/tickers`;
    }
    
    getDepthUrl(symbol: string, limit: number = 20): string {
        const formattedSymbol = this.formatSymbol(symbol);
        return `${this.baseUrl}/api/v2/spot/market/depth?symbol=${formattedSymbol}&limit=${limit}`;
    }
}