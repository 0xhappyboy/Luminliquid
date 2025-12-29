import { ExchangeOHLCVData } from './ExchangeOHLCVData';
import { ICandleViewDataPoint } from 'candleview';

export class BybitOHLCVData extends ExchangeOHLCVData {
    protected baseUrl: string = 'https://api.bybit.com';
    
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
        let url = `${this.baseUrl}/v5/market/kline?category=spot&symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`;
        if (startTime) url += `&start=${Math.floor(startTime / 1000)}`;
        if (endTime) url += `&end=${Math.floor(endTime / 1000)}`;
        return url;
    }
    
    parseKlineData(data: any): ICandleViewDataPoint[] {
        if (!data || !data.result || !Array.isArray(data.result.list)) {
            return [];
        }
        
        return data.result.list.map((kline: any[]) => {
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
    
    getServerTimeUrl(): string {
        return `${this.baseUrl}/v5/market/time`;
    }
    
    getSymbolsUrl(category: string = 'spot'): string {
        return `${this.baseUrl}/v5/market/instruments-info?category=${category}`;
    }
}