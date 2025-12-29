import { CexType } from "../../types";

export interface MarketData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    quoteVolume?: number;
    source: CexType;
    sourceSymbol: string;
}

export interface IMarketDataSource {
    type: CexType;
    name: string;

    fetchTickerData(): Promise<any[]>;
    fetchExchangeInfo?(): Promise<any>;
    processData(rawData: any, exchangeInfo?: any): MarketData[];
}

export class BinanceDataSource implements IMarketDataSource {
    type = CexType.Binance;
    name = "Binance";

    async fetchTickerData(): Promise<any[]> {
        try {
            const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async fetchExchangeInfo(): Promise<any> {
        try {
            const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    processData(tickerData: any[], exchangeInfo?: any): MarketData[] {
        const symbolMap = new Map();
        if (exchangeInfo?.symbols) {
            exchangeInfo.symbols.forEach((sym: any) => {
                symbolMap.set(sym.symbol, {
                    name: sym.baseAsset,
                    status: sym.status
                });
            });
        }
        const usdtPairs = tickerData.filter((item: any) =>
            item.symbol.endsWith('USDT') &&
            parseFloat(item.quoteVolume) > 100000 &&
            symbolMap.get(item.symbol)?.status === 'TRADING'
        );
        return usdtPairs.map((item: any) => {
            const price = parseFloat(item.lastPrice);
            const prevPrice = parseFloat(item.prevClosePrice);
            const change = price - prevPrice;
            const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
            const volume = parseFloat(item.volume);
            const quoteVolume = parseFloat(item.quoteVolume);

            return {
                symbol: item.symbol.replace('USDT', ''),
                name: symbolMap.get(item.symbol)?.name || item.symbol.replace('USDT', ''),
                price: price,
                change: change,
                changePercent: changePercent,
                volume: volume,
                marketCap: quoteVolume * 10,
                quoteVolume: quoteVolume,
                source: this.type,
                sourceSymbol: item.symbol
            };
        });
    }
}

export class BybitDataSource implements IMarketDataSource {
    type = CexType.Bybit;
    name = "Bybit";
    async fetchTickerData(): Promise<any[]> {
        try {
            const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.result.list || [];
        } catch (error) {
            throw error;
        }
    }

    processData(rawData: any[]): MarketData[] {
        const usdtPairs = rawData.filter((item: any) =>
            item.symbol.endsWith('USDT') &&
            parseFloat(item.volume24h) > 100000
        );
        return usdtPairs.map((item: any) => {
            const price = parseFloat(item.lastPrice);
            const prevPrice = parseFloat(item.prevPrice24h) || price;
            const change = price - prevPrice;
            const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
            const volume = parseFloat(item.volume24h);
            const quoteVolume = parseFloat(item.turnover24h);
            return {
                symbol: item.symbol.replace('USDT', ''),
                name: item.symbol.replace('USDT', ''),
                price: price,
                change: change,
                changePercent: changePercent,
                volume: volume,
                marketCap: quoteVolume * 10,
                quoteVolume: quoteVolume,
                source: this.type,
                sourceSymbol: item.symbol
            };
        });
    }
}

export class BitgetDataSource implements IMarketDataSource {
    type = CexType.Bitget;
    name = "Bitget";
    async fetchTickerData(): Promise<any[]> {
        try {
            const response = await fetch('https://api.bitget.com/api/v2/spot/market/tickers');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            throw error;
        }
    }
    processData(rawData: any[]): MarketData[] {
        const usdtPairs = rawData.filter((item: any) => {
            const symbol = item.symbol || '';
            const isUsdtPair = symbol.endsWith('USDT');
            const volume = parseFloat(item.quoteVolume) || 0;
            return isUsdtPair && volume > 100000;
        });
        return usdtPairs.map((item: any) => {
            const symbol = item.symbol || '';
            const cleanSymbol = symbol.replace('USDT', '');
            const price = parseFloat(item.lastPr) || 0;
            const openPrice = parseFloat(item.open) || price;
            const change = price - openPrice;
            const changePercent = openPrice > 0 ? (change / openPrice) * 100 : 0;
            const volume = parseFloat(item.baseVolume) || 0;
            const quoteVolume = parseFloat(item.quoteVolume) || 0;
            return {
                symbol: cleanSymbol,
                name: cleanSymbol,
                price: price,
                change: change,
                changePercent: changePercent,
                volume: volume,
                marketCap: quoteVolume * 10,
                quoteVolume: quoteVolume,
                source: this.type,
                sourceSymbol: symbol
            };
        });
    }
}

export class HyperliquidDataSource implements IMarketDataSource {
    type = CexType.Hyperliquid;
    name = "Hyperliquid";
    async fetchTickerData(): Promise<any[]> {
        try {
            const response = await fetch('https://api.hyperliquid.xyz/info');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    processData(rawData: any): MarketData[] {
        if (!rawData || !rawData.meta) return [];
        return rawData.meta.universe.map((item: any) => {
            const stats = rawData.meta.perpStats?.[item.name] || {};
            const price = stats.markPrice || 0;
            const prevPrice = stats.prevDayPrice || price;
            const change = price - prevPrice;
            const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
            const volume = stats.volume24h || 0;
            const quoteVolume = volume * price;
            return {
                symbol: item.name,
                name: item.name,
                price: price,
                change: change,
                changePercent: changePercent,
                volume: volume,
                marketCap: quoteVolume * 10,
                quoteVolume: quoteVolume,
                source: this.type,
                sourceSymbol: item.name
            };
        }).filter((item: MarketData) => item.quoteVolume > 100000);
    }
}

export class MarketDataAggregator {
    private dataSources: Map<CexType, IMarketDataSource> = new Map();
    private allMarketData: MarketData[] = [];
    private dataCache: Map<CexType, { data: MarketData[], timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 30000;
    constructor() {
        this.registerDataSource(new BinanceDataSource());
        this.registerDataSource(new BybitDataSource());
        this.registerDataSource(new BitgetDataSource());
        this.registerDataSource(new HyperliquidDataSource());
    }
    registerDataSource(source: IMarketDataSource) {
        this.dataSources.set(source.type, source);
    }
    async fetchAllData(): Promise<MarketData[]> {
        const results: MarketData[] = [];
        const errors: string[] = [];

        for (const [type, source] of this.dataSources) {
            try {
                const data = await this.fetchDataSource(type);
                results.push(...data);
            } catch (error) {
                errors.push(`Failed to fetch ${source.name}: ${error}`);
            }
        }

        if (errors.length > 0 && results.length === 0) {
            throw new Error(errors.join('\n'));
        }

        this.allMarketData = results;
        return results;
    }

    async fetchDataSource(type: CexType): Promise<MarketData[]> {
        const cached = this.dataCache.get(type);
        const now = Date.now();

        if (cached && now - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }

        const source = this.dataSources.get(type);
        if (!source) {
            throw new Error(`Data source ${type} not found`);
        }

        try {
            const rawData = await source.fetchTickerData();
            let exchangeInfo = undefined;

            if (source.fetchExchangeInfo) {
                exchangeInfo = await source.fetchExchangeInfo();
            }

            const processedData = source.processData(rawData, exchangeInfo);

            this.dataCache.set(type, {
                data: processedData,
                timestamp: now
            });

            return processedData;
        } catch (error) {
            const cached = this.dataCache.get(type);
            if (cached) {
                return cached.data;
            }
            throw error;
        }
    }

    getMarketDataBySource(type?: CexType): MarketData[] {
        if (!type) {
            return this.allMarketData;
        }

        const cached = this.dataCache.get(type);
        return cached ? cached.data : [];
    }

    getAvailableSources(): CexType[] {
        return Array.from(this.dataSources.keys());
    }

    getSourceName(type: CexType): string {
        return this.dataSources.get(type)?.name || type.toString();
    }

    async updatePrices(): Promise<void> {
        for (const [type, source] of this.dataSources) {
            try {
                const newData = await this.fetchDataSource(type);
                const oldData = this.dataCache.get(type)?.data || [];
                const updatedData = oldData.map(oldItem => {
                    const newItem = newData.find((n: MarketData) =>
                        n.symbol === oldItem.symbol && n.source === oldItem.source
                    );
                    if (newItem) {
                        return { ...oldItem, ...newItem };
                    }
                    return oldItem;
                });
                this.dataCache.set(type, {
                    data: updatedData,
                    timestamp: Date.now()
                });
            } catch (error) {
            }
        }
        const allData: MarketData[] = [];
        for (const [type] of this.dataSources) {
            const data = this.dataCache.get(type);
            if (data) {
                allData.push(...data.data);
            }
        }
        this.allMarketData = allData;
    }
}