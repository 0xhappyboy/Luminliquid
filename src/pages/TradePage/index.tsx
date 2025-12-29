import React from 'react';
// import '../styles/TradePage.css';
import { overflowManager } from '../../globals/theme/OverflowTypeManager';
import { TEST_CANDLEVIEW_DATA8 } from './TestData/TestData_3';
import CandleView, { ICandleViewDataPoint } from 'candleview';
import { themeManager } from "../../globals/theme/ThemeManager";
import { ExchangeDataFactory } from '../../api/ohlcv/ExchangeDataFactory';

interface TradePageProps {
    children?: React.ReactNode;
}

interface TradePageState {
    theme: 'dark' | 'light';
    containerHeight: number;
    candleData: ICandleViewDataPoint[];
    selectedPair: string;
    isLoadingCandleData: boolean;
    candleDataError: string | null;
    progress: number;
    currentTimeframe: string;
    exchange: string;
    symbol: string;
    initialLoadComplete: boolean;
}

const BINANCE_INTERVAL_MAP: Record<string, string> = {
    '1s': '1s',
    '5s': '5s',
    '15s': '15s',
    '30s': '30s',
    '1m': '1m',
    '3m': '3m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '45m': '45m',
    '1H': '1h',
    '2H': '2h',
    '3H': '3h',
    '4H': '4h',
    '6H': '6h',
    '8H': '8h',
    '12H': '12h',
    '1D': '1d',
    '3D': '3d',
    '1W': '1w',
    '2W': '2w',
    '1M': '1M',
    '3M': '3M',
    '6M': '6M'
};

const TIMEFRAME_CONFIGS: Record<string, {
    totalCandles: number,
    limit: number,
    description: (locale: string) => string
}> = {
    '1s': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '1秒 - 5,000条' : '1s - 5,000 candles'
    },
    '5s': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '5秒 - 5,000条' : '5s - 5,000 candles'
    },
    '15s': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '15秒 - 5,000条' : '15s - 5,000 candles'
    },
    '30s': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '30秒 - 5,000条' : '30s - 5,000 candles'
    },
    '1m': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '1分钟 - 5,000条' : '1m - 5,000 candles'
    },
    '3m': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '3分钟 - 5,000条' : '3m - 5,000 candles'
    },
    '5m': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '5分钟 - 5,000条' : '5m - 5,000 candles'
    },
    '15m': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '15分钟 - 5,000条' : '15m - 5,000 candles'
    },
    '30m': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '30分钟 - 5,000条' : '30m - 5,000 candles'
    },
    '45m': {
        totalCandles: 5000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '45分钟 - 5,000条' : '45m - 5,000 candles'
    },
    '1H': {
        totalCandles: 4000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '1小时 - 4,000条' : '1H - 4,000 candles'
    },
    '2H': {
        totalCandles: 3000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '2小时 - 3,000条' : '2H - 3,000 candles'
    },
    '3H': {
        totalCandles: 2000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '3小时 - 2,000条' : '3H - 2,000 candles'
    },
    '4H': {
        totalCandles: 2000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '4小时 - 2,000条' : '4H - 2,000 candles'
    },
    '6H': {
        totalCandles: 2000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '6小时 - 2,000条' : '6H - 2,000 candles'
    },
    '8H': {
        totalCandles: 2000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '8小时 - 2,000条' : '8H - 2,000 candles'
    },
    '12H': {
        totalCandles: 2000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '12小时 - 2,000条' : '12H - 2,000 candles'
    },
    '1D': {
        totalCandles: 1000,
        limit: 1000,
        description: (locale: string) => locale === 'cn' ? '1日 - 1,000条 (约2.7年)' : '1D - 1,000 candles (~2.7 years)'
    },
    '3D': {
        totalCandles: 800,
        limit: 500,
        description: (locale: string) => locale === 'cn' ? '3日 - 800条 (约6.6年)' : '3D - 800 candles (~6.6 years)'
    },
    '1W': {
        totalCandles: 500,
        limit: 500,
        description: (locale: string) => locale === 'cn' ? '1周 - 500条 (约9.6年)' : '1W - 500 candles (~9.6 years)'
    },
    '2W': {
        totalCandles: 400,
        limit: 400,
        description: (locale: string) => locale === 'cn' ? '2周 - 400条 (约15.4年)' : '2W - 400 candles (~15.4 years)'
    },
    '1M': {
        totalCandles: 300,
        limit: 300,
        description: (locale: string) => locale === 'cn' ? '1月 - 300条 (约25年)' : '1M - 300 candles (~25 years)'
    },
    '3M': {
        totalCandles: 200,
        limit: 200,
        description: (locale: string) => locale === 'cn' ? '3月 - 200条 (约50年)' : '3M - 200 candles (~50 years)'
    },
    '6M': {
        totalCandles: 100,
        limit: 100,
        description: (locale: string) => locale === 'cn' ? '6月 - 100条 (约50年)' : '6M - 100 candles (~50 years)'
    }
};

interface BinanceKlineData {
    0: number;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: number;
    7: string;
    8: number;
    9: string;
    10: string;
    11: string;
}

class TradePage extends React.Component<TradePageProps, TradePageState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef: React.RefObject<HTMLDivElement | null>;
    private resizeObserver: ResizeObserver | null = null;
    private previousUrl: string = '';

    constructor(props: TradePageProps) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement | null>();
        const { exchange, symbol } = this.getUrlParams();
        this.state = {
            theme: themeManager.getTheme(),
            containerHeight: 0,
            candleData: [],
            selectedPair: symbol,
            isLoadingCandleData: true,
            candleDataError: null,
            progress: 0,
            currentTimeframe: '15m',
            exchange: exchange,
            symbol: symbol,
            initialLoadComplete: false
        };
    }

    private getUrlParams = () => {
        const pathParts = window.location.pathname.split('/');
        const exchange = pathParts[2] || 'binance';
        const symbol = pathParts[3] || 'BTCUSDT';
        if (!exchange && !symbol) {
            return {
                exchange: 'test',
                symbol: 'Test'
            };
        }
        return {
            exchange: exchange || 'binance',
            symbol: symbol || 'BTC/USDT'
        };
    }

    componentDidMount() {
        this.updateContainerHeight();
        window.addEventListener('resize', this.debouncedResize);
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
        if (this.containerRef.current?.parentElement) {
            this.resizeObserver = new ResizeObserver(this.updateContainerHeight);
            this.resizeObserver.observe(this.containerRef.current.parentElement);
        }
        this.previousUrl = window.location.href;
        this.loadDataFromUrl();
    }

    componentDidUpdate(prevProps: TradePageProps, prevState: TradePageState) {
        const currentUrl = window.location.href;
        if (currentUrl !== this.previousUrl) {
            this.previousUrl = currentUrl;
            const { exchange, symbol } = this.getUrlParams();
            if (exchange !== this.state.exchange || symbol !== this.state.symbol) {
                this.setState({
                    exchange,
                    symbol,
                    isLoadingCandleData: true,
                    candleDataError: null,
                    progress: 0,
                    initialLoadComplete: false
                }, () => {
                    this.loadDataFromUrl();
                });
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedResize);
        if (this.unsubscribe) this.unsubscribe();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    private loadDataFromUrl = async () => {
        const { exchange, symbol } = this.state;
        if (exchange === 'test') {
            this.setState({
                candleData: TEST_CANDLEVIEW_DATA8,
                isLoadingCandleData: false,
                initialLoadComplete: true
            });
            return;
        }
        await this.fetchCandleDataByTimeframe(symbol, '15m');
    }

    private updateContainerHeight = (): void => {
        if (this.containerRef.current) {
            const container = this.containerRef.current;
            const parentHeight = container.parentElement?.clientHeight || window.innerHeight;
            this.setState({ containerHeight: parentHeight });
        }
    };

    private debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    private debouncedResize = this.debounce(this.updateContainerHeight, 100);

    private handleThemeChange = (theme: 'dark' | 'light'): void => {
        this.setState({ theme });
    };

    private getTimeIntervalInMs = (timeframe: string): number => {
        const unit = timeframe.slice(-1);
        const value = parseInt(timeframe.slice(0, -1)) || 1;
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'H': return value * 60 * 60 * 1000;
            case 'D': return value * 24 * 60 * 60 * 1000;
            case 'W': return value * 7 * 24 * 60 * 60 * 1000;
            case 'M': return value * 30 * 24 * 60 * 60 * 1000;
            default: return 60 * 1000;
        }
    };

    private getDaysToFetch = (timeframe: string): number => {
        const unit = timeframe.slice(-1);
        const value = parseInt(timeframe.slice(0, -1)) || 1;
        switch (unit) {
            case 'D':
                return value * 1000;
            case 'W':
                return value * 1000 * 7;
            case 'M':
                return value * 1000 * 30;
            default:
                return 30;
        }
    };

    private fetchCandleDataByTimeframe = async (pair: string, timeframe: string) => {
        try {
            const { exchange } = this.state;
            const exchangeData = ExchangeDataFactory.getExchangeData(exchange);
            if (!exchangeData) {
                throw new Error(`Exchange ${exchange} is not supported`);
            }
            const binanceInterval = BINANCE_INTERVAL_MAP[timeframe] || '1m';
            const { limit, totalCandles } = TIMEFRAME_CONFIGS[timeframe] || TIMEFRAME_CONFIGS['15m'];
            let allData: ICandleViewDataPoint[] = [];
            let endTime = Date.now();
            let startTime: number;
            const timeIntervalMs = this.getTimeIntervalInMs(timeframe);
            if (timeframe.includes('D') || timeframe.includes('W') || timeframe.includes('M')) {
                const daysToFetch = this.getDaysToFetch(timeframe);
                startTime = endTime - (daysToFetch * 24 * 60 * 60 * 1000);
            } else {
                startTime = endTime - (totalCandles * timeIntervalMs);
            }
            const batchSize = Math.min(limit, 1000);
            let currentEndTime = endTime;
            let fetchedCount = 0;
            const maxBatches = 5;
            this.setState({
                isLoadingCandleData: true,
                candleDataError: null,
                selectedPair: pair,
                currentTimeframe: timeframe,
                progress: 0
            });
            for (let batch = 0; batch < maxBatches && fetchedCount < totalCandles && currentEndTime > startTime; batch++) {
                try {
                    const batchStartTime = Math.max(startTime, currentEndTime - (batchSize * timeIntervalMs));
                    const url = exchangeData.getKlineUrl(
                        pair,
                        binanceInterval,
                        batchStartTime,
                        currentEndTime,
                        batchSize
                    );
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP Error ${response.status}`);
                    }
                    const responseData = await response.json();
                    const formattedData = exchangeData.parseKlineData(responseData);
                    if (formattedData.length === 0) {
                        break;
                    }
                    allData = [...formattedData, ...allData];
                    fetchedCount += formattedData.length;
                    if (formattedData.length > 0) {
                        currentEndTime = formattedData[0].time * 1000 - 1;
                    }
                    const progressPercent = Math.min(100, Math.round((fetchedCount / totalCandles) * 100));
                    this.setState({ progress: progressPercent });
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (batchError) {
                    if (batch === 0) {
                        throw batchError;
                    }
                    break;
                }
            }
            allData.sort((a, b) => a.time - b.time);
            const uniqueData = allData.filter((item, index, self) =>
                index === self.findIndex(t => t.time === item.time)
            );
            if (uniqueData.length === 0) {
                throw new Error(`No ${timeframe} data obtained for ${pair} from ${exchange}`);
            }
            if (uniqueData.length > totalCandles) {
                allData = uniqueData.slice(-totalCandles);
            } else {
                allData = uniqueData;
            }
            this.setState({
                candleData: allData,
                progress: 100,
                candleDataError: null,
                initialLoadComplete: true
            });
            setTimeout(() => {
                this.setState({
                    isLoadingCandleData: false,
                    progress: 0
                });
            }, 500);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            this.setState({
                candleDataError: errorMessage,
                candleData: TEST_CANDLEVIEW_DATA8,
                isLoadingCandleData: false,
                initialLoadComplete: true
            });
        }
    };

    private getCandleViewTitle = () => {
        const { selectedPair, exchange } = this.state;
        if (exchange === 'test') {
            return 'Test Chart';
        }
        return `${selectedPair} - ${exchange.charAt(0).toUpperCase() + exchange.slice(1)}`;
    };

    private applyGlobalTheme = () => {
        const { theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const scrollbarTrack = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const scrollbarThumb = theme === 'dark' ? '#5A6270' : '#C4C9D1';
        const scrollbarThumbHover = theme === 'dark' ? '#767E8C' : '#A8AFB8';
        return `
            .trade-page-scrollbar::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            .trade-page-scrollbar::-webkit-scrollbar-track {
                background: ${scrollbarTrack};
                border-radius: 3px;
            }
            .trade-page-scrollbar::-webkit-scrollbar-thumb {
                background: ${scrollbarThumb};
                border-radius: 3px;
            }
            .trade-page-scrollbar::-webkit-scrollbar-thumb:hover {
                background: ${scrollbarThumbHover};
            }
            .trade-page-container {
                background-color: ${backgroundColor};
                height: 100%;
                overflow: hidden;
            }
            
            .loading-overlay {
                position: absolute;
                inset: 0;
                z-index: 50;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: ${theme === 'dark' ? 'rgba(15, 17, 22, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
            }
            
            .error-message {
                position: absolute;
                top: 16px;
                right: 16px;
                z-index: 50;
                padding: 12px;
                border-radius: 8px;
                background-color: ${theme === 'dark' ? 'rgba(220, 20, 60, 0.9)' : 'rgba(220, 20, 60, 0.1)'};
                color: ${theme === 'dark' ? '#FFB6C1' : '#DC143C'};
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                max-width: 300px;
            }
            
            .info-message {
                position: absolute;
                top: 16px;
                right: 16px;
                z-index: 50;
                padding: 12px;
                border-radius: 8px;
                background-color: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.1)'};
                color: ${theme === 'dark' ? '#93C5FD' : '#3B82F6'};
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                max-width: 300px;
            }
        `;
    };

    private renderLoadingOverlay = () => {
        const { theme, progress, currentTimeframe, selectedPair, exchange } = this.state;
        const isDark = theme === 'dark';
        const config = TIMEFRAME_CONFIGS[currentTimeframe] || TIMEFRAME_CONFIGS['15m'];
        return (
            <div className="loading-overlay">
                <div style={{
                    padding: '24px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? '#1A1D24' : '#FFFFFF',
                    boxShadow: isDark
                        ? '0 10px 25px rgba(0, 0, 0, 0.5)'
                        : '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <svg
                            className="animate-spin"
                            style={{
                                width: '32px',
                                height: '32px',
                                marginBottom: '16px',
                                color: isDark ? '#4299E1' : '#3182CE'
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke={isDark ? '#4A5568' : '#E2E8F0'}
                                strokeWidth="4"
                            />
                            <path
                                fill={isDark ? '#4299E1' : '#3182CE'}
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            color: isDark ? '#FFFFFF' : '#1A202C'
                        }}>
                            Loading {selectedPair} from {exchange}
                        </span>
                        <span style={{
                            fontSize: '14px',
                            marginBottom: '16px',
                            color: isDark ? '#CBD5E0' : '#718096'
                        }}>
                            {config.description('en')}
                        </span>
                        <div style={{
                            width: '256px',
                            height: '8px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            backgroundColor: isDark ? '#2D3748' : '#E2E8F0'
                        }}>
                            <div
                                style={{
                                    height: '100%',
                                    backgroundColor: isDark ? '#4299E1' : '#3182CE',
                                    transition: 'width 0.3s ease-out',
                                    width: `${progress}%`
                                }}
                            />
                        </div>
                        <span style={{
                            fontSize: '12px',
                            marginTop: '8px',
                            color: isDark ? '#A0AEC0' : '#718096'
                        }}>
                            {progress}%
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    private renderErrorMessage = () => {
        const { theme, candleDataError } = this.state;
        const isDark = theme === 'dark';

        if (!candleDataError) return null;

        return (
            <div className="error-message">
                <svg
                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{candleDataError}</span>
            </div>
        );
    };

    private renderInfoMessage = () => {
        const { theme, exchange, symbol } = this.state;
        const isDark = theme === 'dark';

        if (exchange === 'test') {
            return (
                <div className="info-message">
                    <svg
                        style={{ width: '16px', height: '16px', flexShrink: 0 }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Showing test data. Add ?exchange=binance&symbol=BTC/USDT to URL for real data.</span>
                </div>
            );
        }
        return null;
    };

    render() {
        const { containerHeight, theme, candleData, isLoadingCandleData, candleDataError, initialLoadComplete } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        overflowManager.setOverflow('auto');
        return (
            <div
                ref={this.containerRef}
                style={{
                    height: containerHeight > 0 ? `${containerHeight}px` : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <style>{this.applyGlobalTheme()}</style>
                {this.renderInfoMessage()}
                {candleDataError && this.renderErrorMessage()}
                <div
                    className="trade-page-scrollbar"
                    style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {(isLoadingCandleData || !initialLoadComplete) && this.renderLoadingOverlay()}
                    {initialLoadComplete && !isLoadingCandleData && candleData.length > 0 && (
                        <CandleView
                            data={candleData}
                            title={this.getCandleViewTitle()}
                            theme={theme}
                            i18n={'en'}
                            leftpanel={true}
                            toppanel={true}
                            terminal={true}
                            ai={true}
                            timezone='America/New_York'
                            timeframe='15m'
                            timeframeCallbacks={{
                                "1s": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "1s");
                                },
                                "5s": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "5s");
                                },
                                "15s": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "15s");
                                },
                                "30s": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "30s");
                                },
                                "1m": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "1m");
                                },
                                "3m": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "3m");
                                },
                                "5m": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "5m");
                                },
                                "15m": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "15m");
                                },
                                "30m": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "30m");
                                },
                                "45m": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "45m");
                                },
                                "1H": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "1H");
                                },
                                "2H": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "2H");
                                },
                                "3H": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "3H");
                                },
                                "4H": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "4H");
                                },
                                "6H": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "6H");
                                },
                                "8H": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "8H");
                                },
                                "12H": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "12H");
                                },
                                "1D": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "1D");
                                },
                                "3D": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "3D");
                                },
                                "1W": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "1W");
                                },
                                "2W": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "2W");
                                },
                                "1M": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "1M");
                                },
                                "3M": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "3M");
                                },
                                "6M": async () => {
                                    await this.fetchCandleDataByTimeframe(this.state.symbol, "6M");
                                }
                            }}
                            aiconfigs={[
                                {
                                    proxyUrl: 'http://localhost:3000/api',
                                    brand: 'aliyun',
                                    model: 'qwen-turbo',
                                },
                                {
                                    proxyUrl: 'http://localhost:3000/api',
                                    brand: 'deepseek',
                                    model: 'deepseek-chat',
                                },
                                {
                                    proxyUrl: 'http://localhost:3000/api',
                                    brand: 'deepseek',
                                    model: 'deepseek-chat-lite',
                                },
                            ]}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default TradePage;