import { BinanceOHLCVData } from './BinanceOHLCVData';
import { BybitOHLCVData } from './BybitOHLCVData';
import { BitgetOHLCVData } from './BitgetOHLCVData';
import { OkxOHLCVData } from './OkxOHLCVData';
import { ExchangeOHLCVData } from './ExchangeOHLCVData';

export interface ExchangeConfig {
    name: string;
    displayName: string;
    supported: boolean;
}

export class ExchangeDataFactory {
    private static instances: Map<string, ExchangeOHLCVData> = new Map();

    private static exchangeConfigs: ExchangeConfig[] = [
        { name: 'binance', displayName: 'Binance', supported: true },
        { name: 'bybit', displayName: 'Bybit', supported: true },
        { name: 'bitget', displayName: 'Bitget', supported: true },
        { name: 'okx', displayName: 'OKX', supported: true }
    ];

    static getExchangeData(exchangeName: string): ExchangeOHLCVData | null {
        const normalizedName = exchangeName.toLowerCase();
        if (this.instances.has(normalizedName)) {
            return this.instances.get(normalizedName)!;
        }
        if (!this.isExchangeSupported(normalizedName)) {
            return null;
        }
        let exchangeData: ExchangeOHLCVData;
        switch (normalizedName) {
            case 'binance':
                exchangeData = new BinanceOHLCVData();
                break;
            case 'bybit':
                exchangeData = new BybitOHLCVData();
                break;
            case 'bitget':
                exchangeData = new BitgetOHLCVData();
                break;
            case 'okx':
                exchangeData = new OkxOHLCVData();
                break;
            default:
                return null;
        }
        this.instances.set(normalizedName, exchangeData);
        return exchangeData;
    }

    static isExchangeSupported(exchangeName: string): boolean {
        return this.exchangeConfigs.some(
            config => config.name === exchangeName.toLowerCase() && config.supported
        );
    }

    static getAllSupportedExchanges(): string[] {
        return this.exchangeConfigs
            .filter(config => config.supported)
            .map(config => config.name);
    }

    static getAllExchangeConfigs(): ExchangeConfig[] {
        return [...this.exchangeConfigs];
    }

    static getExchangeDisplayName(exchangeName: string): string {
        const config = this.exchangeConfigs.find(
            config => config.name === exchangeName.toLowerCase()
        );
        return config?.displayName || exchangeName;
    }

    static clearCache(): void {
        this.instances.clear();
    }

    static preloadAll(): void {
        this.getAllSupportedExchanges().forEach(exchange => {
            this.getExchangeData(exchange);
        });
    }
}