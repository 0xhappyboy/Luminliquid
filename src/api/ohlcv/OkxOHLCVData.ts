import { ExchangeOHLCVData } from './ExchangeOHLCVData';
import { ICandleViewDataPoint } from 'candleview';

export class OkxOHLCVData extends ExchangeOHLCVData {
    protected baseUrl: string = 'https://www.okx.com';
    
    formatSymbol(symbol: string): string {
        return symbol.replace('/', '-');
    }
    
    getKlineUrl(
        symbol: string, 
        interval: string, 
        startTime?: number, 
        endTime?: number, 
        limit: number = 1000
    ): string {
        const formattedSymbol = this.formatSymbol(symbol);
        let url = `${this.baseUrl}/api/v5/market/candles?instId=${formattedSymbol}&bar=${interval}&limit=${limit}`;
        if (startTime) url += `&after=${startTime}`;
        if (endTime) url += `&before=${endTime}`;
        return url;
    }
    
    parseKlineData(data: any): ICandleViewDataPoint[] {
        if (!data || !data.data || !Array.isArray(data.data)) {
            return [];
        }
        
        return data.data.map((kline: string[]) => {
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
    
    getInstrumentsUrl(instType: string = 'SPOT'): string {
        return `${this.baseUrl}/api/v5/public/instruments?instType=${instType}`;
    }
    
    getTickerUrl(symbol?: string): string {
        if (symbol) {
            const formattedSymbol = this.formatSymbol(symbol);
            return `${this.baseUrl}/api/v5/market/ticker?instId=${formattedSymbol}`;
        }
        return `${this.baseUrl}/api/v5/market/tickers?instType=SPOT`;
    }
    
    getServerTimeUrl(): string {
        return `${this.baseUrl}/api/v5/public/time`;
    }
}