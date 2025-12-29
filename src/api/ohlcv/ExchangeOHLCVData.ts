import { ICandleViewDataPoint } from 'candleview';

export interface IExchangeConfig {
    baseUrl: string;
    formatSymbol: (symbol: string) => string;
    getKlineUrl: (
        symbol: string,
        interval: string,
        startTime?: number,
        endTime?: number,
        limit?: number
    ) => string;
    parseKlineData: (data: any) => ICandleViewDataPoint[];
}

export abstract class ExchangeOHLCVData {
    protected abstract baseUrl: string;

    abstract formatSymbol(symbol: string): string;

    abstract getKlineUrl(
        symbol: string,
        interval: string,
        startTime?: number,
        endTime?: number,
        limit?: number
    ): string;

    abstract parseKlineData(data: any): ICandleViewDataPoint[];

    getBaseUrl(): string {
        return this.baseUrl;
    }

    protected convertTimestamp(timestamp: number | string): number {
        if (typeof timestamp === 'string') {
            return Math.floor(parseFloat(timestamp) / 1000);
        }
        return Math.floor(timestamp / 1000);
    }
}