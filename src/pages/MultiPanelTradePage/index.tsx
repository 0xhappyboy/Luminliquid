import React from 'react';
import CandleView from 'candleview';
import { themeManager } from '../../globals/theme/ThemeManager';
import { TEST_CANDLEVIEW_DATA8 } from '../TradePage/TestData/TestData_3';
import { ExchangeDataFactory } from '../../api/ohlcv/ExchangeDataFactory';

interface MultiPanelPageProps {
    children?: React.ReactNode;
}

interface MultiPanelPageState {
    theme: 'dark' | 'light';
    horizontalSplit: number;
    verticalSplit: number;
    isDraggingHorizontal: boolean;
    isDraggingVertical: boolean;
    panels: {
        [key: number]: {
            exchange: string;
            token: string;
            isLoadingExchange: boolean;
            isLoadingTokens: boolean;
            isLoadingData: boolean;
            tokens: string[];
            data: any[];
            progress: number;
            isDataLoaded: boolean;
        }
    };
    isInitialized: boolean;
}

enum CexType {
    Binance = 'binance',
    Bybit = 'bybit',
    Bitget = 'bitget',
    Hyperliquid = 'Hyperliquid',
    OKX = 'okx',
    Coinbase = 'coinbase'
}

const SUPPORTED_EXCHANGES = [
    { value: CexType.Binance, label: 'Binance' },
    { value: CexType.Bybit, label: 'Bybit' },
    { value: CexType.Bitget, label: 'Bitget' },
    { value: CexType.OKX, label: 'OKX' },
    { value: CexType.Coinbase, label: 'Coinbase' },
    { value: CexType.Hyperliquid, label: 'Hyperliquid' }
];

class MultiPanelPage extends React.Component<MultiPanelPageProps, MultiPanelPageState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef = React.createRef<HTMLDivElement>();
    private resizeObserver: ResizeObserver | null = null;

    constructor(props: MultiPanelPageProps) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            horizontalSplit: 50,
            verticalSplit: 50,
            isDraggingHorizontal: false,
            isDraggingVertical: false,
            panels: {
                1: {
                    exchange: CexType.Binance,
                    token: 'BTC/USDT',
                    isLoadingExchange: false,
                    isLoadingTokens: false,
                    isLoadingData: false,
                    tokens: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'],
                    data: [],
                    progress: 0,
                    isDataLoaded: false
                },
                2: {
                    exchange: CexType.Binance,
                    token: 'ETH/USDT',
                    isLoadingExchange: false,
                    isLoadingTokens: false,
                    isLoadingData: false,
                    tokens: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'],
                    data: [],
                    progress: 0,
                    isDataLoaded: false
                },
                3: {
                    exchange: CexType.Binance,
                    token: 'BNB/USDT',
                    isLoadingExchange: false,
                    isLoadingTokens: false,
                    isLoadingData: false,
                    tokens: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'],
                    data: [],
                    progress: 0,
                    isDataLoaded: false
                },
                4: {
                    exchange: CexType.Binance,
                    token: 'ADA/USDT',
                    isLoadingExchange: false,
                    isLoadingTokens: false,
                    isLoadingData: false,
                    tokens: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'],
                    data: [],
                    progress: 0,
                    isDataLoaded: false
                }
            },
            isInitialized: false
        };
    }

    private handleThemeChange = (theme: 'dark' | 'light'): void => {
        this.setState({ theme });
    };

    private handleHorizontalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState({ isDraggingHorizontal: true });
        const handleMouseMove = (e: MouseEvent) => {
            if (!this.containerRef.current || !this.state.isDraggingHorizontal) return;
            const containerRect = this.containerRef.current.getBoundingClientRect();
            const relativeY = e.clientY - containerRect.top;
            const percentage = (relativeY / containerRect.height) * 100;
            const clampedPercentage = Math.max(30, Math.min(70, percentage));
            this.setState({ horizontalSplit: clampedPercentage });
        };
        const handleMouseUp = () => {
            this.setState({ isDraggingHorizontal: false });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    private handleVerticalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState({ isDraggingVertical: true });
        const handleMouseMove = (e: MouseEvent) => {
            if (!this.containerRef.current || !this.state.isDraggingVertical) return;
            const containerRect = this.containerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - containerRect.left;
            const percentage = (relativeX / containerRect.width) * 100;
            const clampedPercentage = Math.max(30, Math.min(70, percentage));
            this.setState({ verticalSplit: clampedPercentage });
        };
        const handleMouseUp = () => {
            this.setState({ isDraggingVertical: false });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    private handleExchangeChange = async (panelId: number, exchange: string) => {
        this.setState(prevState => ({
            panels: {
                ...prevState.panels,
                [panelId]: {
                    ...prevState.panels[panelId],
                    exchange,
                    isLoadingExchange: true,
                    isLoadingTokens: true,
                    token: '',
                    tokens: [],
                    data: [],
                    progress: 0,
                    isDataLoaded: false
                }
            }
        }));
        try {
            const tokens = await this.fetchTokensForExchange(exchange);
            this.setState(prevState => ({
                panels: {
                    ...prevState.panels,
                    [panelId]: {
                        ...prevState.panels[panelId],
                        tokens: tokens,
                        isLoadingExchange: false,
                        isLoadingTokens: false,
                        token: tokens.length > 0 ? tokens[0] : ''
                    }
                }
            }), () => {
                const panel = this.state.panels[panelId];
                if (panel.token && panel.tokens.length > 0) {
                    this.loadTokenData(panelId, panel.token, exchange, true);
                }
            });
        } catch (error) {
            this.setState(prevState => ({
                panels: {
                    ...prevState.panels,
                    [panelId]: {
                        ...prevState.panels[panelId],
                        isLoadingExchange: false,
                        isLoadingTokens: false,
                        tokens: []
                    }
                }
            }));
        }
    };


    private handleTokenSelect = (panelId: number, token: string) => {
        this.setState(prevState => ({
            panels: {
                ...prevState.panels,
                [panelId]: {
                    ...prevState.panels[panelId],
                    token,
                    isLoadingData: true,
                    progress: 0,
                    isDataLoaded: false
                }
            }
        }), () => {
            const panel = this.state.panels[panelId];
            this.loadTokenData(panelId, token, panel.exchange, true);
        });
    };


    private fetchTokensForExchange = async (exchange: string): Promise<string[]> => {

        await new Promise(resolve => setTimeout(resolve, 300));


        const tokenLists: { [key: string]: string[] } = {
            [CexType.Binance]: [
                'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'XRP/USDT',
                'DOGE/USDT', 'SOL/USDT', 'DOT/USDT', 'MATIC/USDT', 'LINK/USDT',
                'AVAX/USDT', 'UNI/USDT', 'AAVE/USDT', 'ATOM/USDT', 'FIL/USDT'
            ],
            [CexType.Bybit]: [
                'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT',
                'MATIC/USDT', 'LINK/USDT', 'AVAX/USDT', 'DOT/USDT', 'UNI/USDT'
            ],
            [CexType.Bitget]: [
                'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
                'SOL/USDT', 'MATIC/USDT', 'LINK/USDT', 'DOT/USDT', 'ATOM/USDT'
            ],
            [CexType.OKX]: [
                'BTC/USDT', 'ETH/USDT', 'OKB/USDT', 'XRP/USDT', 'ADA/USDT',
                'SOL/USDT', 'DOT/USDT', 'LINK/USDT', 'MATIC/USDT', 'AVAX/USDT'
            ],
            [CexType.Coinbase]: [
                'BTC/USDT', 'ETH/USDT', 'LINK/USDT', 'UNI/USDT', 'AAVE/USDT',
                'SOL/USDT', 'ADA/USDT', 'MATIC/USDT', 'DOT/USDT', 'ATOM/USDT'
            ],
            [CexType.Hyperliquid]: [
                'BTC/USDT', 'ETH/USDT', 'ARB/USDT', 'OP/USDT', 'SOL/USDT',
                'ADA/USDT', 'MATIC/USDT', 'LINK/USDT', 'DOT/USDT'
            ]
        };

        return tokenLists[exchange] || [];
    };

    private loadTokenData = async (panelId: number, token: string, exchange: string, showProgress: boolean = false) => {
        try {
            const simulateProgress = () => {
                if (showProgress) {
                    const interval = setInterval(() => {
                        this.setState(prevState => {
                            const currentProgress = prevState.panels[panelId].progress;
                            if (currentProgress < 90) {
                                const newProgress = currentProgress + Math.random() * 10;
                                return {
                                    panels: {
                                        ...prevState.panels,
                                        [panelId]: {
                                            ...prevState.panels[panelId],
                                            progress: Math.min(90, newProgress)
                                        }
                                    }
                                };
                            }
                            clearInterval(interval);
                            return prevState;
                        });
                    }, 200);
                    return interval;
                }
                return null;
            };
            const progressInterval = simulateProgress();
            const exchangeData = ExchangeDataFactory.getExchangeData(exchange);
            if (!exchangeData) {
                throw new Error(`Exchange ${exchange} is not supported`);
            }
            const binanceInterval = '15m';
            const url = exchangeData.getKlineUrl(
                token,
                binanceInterval,
                Date.now() - (1000 * 60 * 60 * 24 * 30),
                Date.now(),
                1000
            );
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }
            const responseData = await response.json();
            const formattedData = exchangeData.parseKlineData(responseData);
            if (progressInterval) clearInterval(progressInterval);
            this.setState(prevState => ({
                panels: {
                    ...prevState.panels,
                    [panelId]: {
                        ...prevState.panels[panelId],
                        data: formattedData.length > 0 ? formattedData : TEST_CANDLEVIEW_DATA8,
                        isLoadingData: false,
                        progress: 100,
                        isDataLoaded: true
                    }
                }
            }));
            setTimeout(() => {
                this.setState(prevState => ({
                    panels: {
                        ...prevState.panels,
                        [panelId]: {
                            ...prevState.panels[panelId],
                            progress: 0
                        }
                    }
                }));
            }, 500);
        } catch (err) {
            this.setState(prevState => ({
                panels: {
                    ...prevState.panels,
                    [panelId]: {
                        ...prevState.panels[panelId],
                        data: TEST_CANDLEVIEW_DATA8,
                        isLoadingData: false,
                        progress: 100,
                        isDataLoaded: true
                    }
                }
            }));
            setTimeout(() => {
                this.setState(prevState => ({
                    panels: {
                        ...prevState.panels,
                        [panelId]: {
                            ...prevState.panels[panelId],
                            progress: 0
                        }
                    }
                }));
            }, 500);
        }
    };
    private initializePanelsData = async () => {
        const panelIds = [1, 2, 3, 4];
        const loadPromises = panelIds.map(panelId => {
            const panel = this.state.panels[panelId];
            if (panel.token && panel.exchange) {
                return this.loadTokenData(panelId, panel.token, panel.exchange, true);
            }
            return Promise.resolve();
        });
        await Promise.all(loadPromises);
        this.setState({ isInitialized: true });
    };

    componentDidMount() {
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
        setTimeout(() => {
            this.initializePanelsData();
        }, 100);
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
        document.removeEventListener('dragover', (e) => e.preventDefault());
        document.removeEventListener('drop', (e) => e.preventDefault());
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    private renderLoadingOverlay = (panelId: number) => {
        const { theme } = this.state;
        const panel = this.state.panels[panelId];
        const isDark = theme === 'dark';
        if (panel.progress === 0 && panel.isDataLoaded) {
            return null;
        }
        return (
            <div style={{
                position: 'absolute',
                top: '35px',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark ? 'rgba(15, 17, 22, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
            }}>
                <div style={{
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1A1D24' : '#FFFFFF',
                    boxShadow: isDark
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                border: `2px solid ${isDark ? '#4A5568' : '#E2E8F0'}`,
                                borderTop: `2px solid ${isDark ? '#4299E1' : '#3182CE'}`,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: isDark ? '#FFFFFF' : '#1A202C',
                            }}>
                                Loading {panel.token}
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            backgroundColor: isDark ? '#2D3748' : '#E2E8F0',
                        }}>
                            <div
                                style={{
                                    height: '100%',
                                    backgroundColor: isDark ? '#4299E1' : '#3182CE',
                                    width: `${panel.progress}%`,
                                    transition: 'width 0.3s ease-out',
                                    borderRadius: '3px',
                                }}
                            />
                        </div>
                        <span style={{
                            fontSize: '12px',
                            color: isDark ? '#A0AEC0' : '#718096',
                        }}>
                            {Math.round(panel.progress)}%
                        </span>
                        <span style={{
                            fontSize: '12px',
                            color: isDark ? '#CBD5E0' : '#718096',
                            textAlign: 'center',
                        }}>
                            {panel.exchange.charAt(0).toUpperCase() + panel.exchange.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    private renderPanel = (panelId: number) => {
        const { theme, isInitialized } = this.state;
        const panel = this.state.panels[panelId];
        const textColor = theme === 'dark' ? '#FFFFFF' : '#000000';
        const selectBgColor = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
        const selectBorderColor = theme === 'dark' ? '#333' : '#ddd';
        const disabledColor = theme === 'dark' ? '#555' : '#bbb';
        return (
            <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                boxSizing: 'border-box',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div style={{
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA',
                    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
                    gap: '8px',
                    flexShrink: 0,
                    zIndex: 10,
                }}>
                    <span style={{
                        color: textColor,
                        fontSize: '12px',
                        fontWeight: '500',
                        minWidth: '50px',
                    }}>
                        Panel {panelId}:
                    </span>
                    <div style={{ position: 'relative', minWidth: '100px', flex: 1 }}>
                        <select
                            value={panel.exchange}
                            onChange={(e) => this.handleExchangeChange(panelId, e.target.value)}
                            disabled={panel.isLoadingExchange || (panel.progress > 0 && panel.progress < 100)}
                            style={{
                                width: '100%',
                                height: '25px',
                                padding: '2px 24px 2px 8px',
                                backgroundColor: selectBgColor,
                                color: (panel.isLoadingExchange || (panel.progress > 0 && panel.progress < 100)) ? disabledColor : textColor,
                                border: `1px solid ${selectBorderColor}`,
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: (panel.isLoadingExchange || (panel.progress > 0 && panel.progress < 100)) ? 'not-allowed' : 'pointer',
                                outline: 'none',
                                appearance: 'none',
                            }}
                        >
                            {SUPPORTED_EXCHANGES.map(exchange => (
                                <option key={exchange.value} value={exchange.value}>
                                    {exchange.label}
                                </option>
                            ))}
                        </select>
                        {panel.isLoadingExchange && (
                            <div style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '12px',
                                height: '12px',
                                border: `2px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                                borderTop: `2px solid ${theme === 'dark' ? '#4299E1' : '#3182CE'}`,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                        )}
                        {!panel.isLoadingExchange && (
                            <div style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: textColor,
                                fontSize: '10px',
                            }}>
                                ▼
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'relative', minWidth: '120px', flex: 1 }}>
                        <select
                            value={panel.token}
                            onChange={(e) => this.handleTokenSelect(panelId, e.target.value)}
                            disabled={panel.isLoadingTokens || panel.tokens.length === 0 || (panel.progress > 0 && panel.progress < 100)}
                            style={{
                                width: '100%',
                                height: '25px',
                                padding: '2px 24px 2px 8px',
                                backgroundColor: selectBgColor,
                                color: (panel.isLoadingTokens || panel.tokens.length === 0 || (panel.progress > 0 && panel.progress < 100)) ? disabledColor : textColor,
                                border: `1px solid ${selectBorderColor}`,
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: (panel.isLoadingTokens || panel.tokens.length === 0 || (panel.progress > 0 && panel.progress < 100)) ? 'not-allowed' : 'pointer',
                                outline: 'none',
                                appearance: 'none',
                            }}
                        >
                            {panel.isLoadingTokens ? (
                                <option value="">Loading tokens...</option>
                            ) : panel.tokens.length === 0 ? (
                                <option value="">No tokens available</option>
                            ) : (
                                <>
                                    <option value="">Select token</option>
                                    {panel.tokens.map(token => (
                                        <option key={token} value={token}>
                                            {token}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        {panel.isLoadingTokens && (
                            <div style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '12px',
                                height: '12px',
                                border: `2px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                                borderTop: `2px solid ${theme === 'dark' ? '#4299E1' : '#3182CE'}`,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                        )}
                        {!panel.isLoadingTokens && panel.tokens.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: textColor,
                                fontSize: '10px',
                            }}>
                                ▼
                            </div>
                        )}
                    </div>
                    {panel.isLoadingData && (
                        <div style={{
                            width: '14px',
                            height: '14px',
                            border: `2px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                            borderTop: `2px solid ${theme === 'dark' ? '#4299E1' : '#3182CE'}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    )}
                </div>
                <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    {!panel.isDataLoaded && this.renderLoadingOverlay(panelId)}
                    {(panel.isDataLoaded || isInitialized) && panel.data.length > 0 && (
                        <CandleView
                            height={'100%'}
                            data={panel.data}
                            title={`${panel.token} - ${panel.exchange.charAt(0).toUpperCase() + panel.exchange.slice(1)}`}
                            theme={theme}
                            i18n={'en'}
                            leftpanel={true}
                            toppanel={true}
                            ai={true}
                            timezone='America/New_York'
                            timeframe='15m'
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
    };

    render() {
        const {
            theme,
            horizontalSplit,
            verticalSplit,
            isDraggingHorizontal,
            isDraggingVertical
        } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const handleColor = theme === 'dark' ? '#333' : '#ddd';
        const hoverHandleColor = theme === 'dark' ? '#555' : '#ccc';
        return (
            <div
                ref={this.containerRef}
                style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor,
                    position: 'relative',
                    userSelect: 'none',
                }}
                onMouseLeave={() => {
                    if (isDraggingHorizontal || isDraggingVertical) {
                        this.setState({
                            isDraggingHorizontal: false,
                            isDraggingVertical: false
                        });
                    }
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${verticalSplit}%`,
                    height: `${horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                    borderRight: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
                    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
                    boxSizing: 'border-box',
                }}>
                    {this.renderPanel(1)}
                </div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: `${verticalSplit}%`,
                    width: `${100 - verticalSplit}%`,
                    height: `${horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
                    boxSizing: 'border-box',
                }}>
                    {this.renderPanel(2)}
                </div>
                <div style={{
                    position: 'absolute',
                    top: `${horizontalSplit}%`,
                    left: 0,
                    width: `${verticalSplit}%`,
                    height: `${100 - horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                    borderRight: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
                    boxSizing: 'border-box',
                }}>
                    {this.renderPanel(3)}
                </div>
                <div style={{
                    position: 'absolute',
                    top: `${horizontalSplit}%`,
                    left: `${verticalSplit}%`,
                    width: `${100 - verticalSplit}%`,
                    height: `${100 - horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                    boxSizing: 'border-box',
                }}>
                    {this.renderPanel(4)}
                </div>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: `${verticalSplit}%`,
                        width: '4px',
                        height: '100%',
                        backgroundColor: isDraggingVertical ? hoverHandleColor : handleColor,
                        cursor: 'col-resize',
                        zIndex: 10,
                        transform: 'translateX(-2px)',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseDown={this.handleVerticalMouseDown}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: `${horizontalSplit}%`,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        backgroundColor: isDraggingHorizontal ? hoverHandleColor : handleColor,
                        cursor: 'row-resize',
                        zIndex: 10,
                        transform: 'translateY(-2px)',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseDown={this.handleHorizontalMouseDown}
                />
                {(isDraggingHorizontal || isDraggingVertical) && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000,
                        cursor: isDraggingHorizontal ? 'row-resize' : 'col-resize',
                    }} />
                )}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    select:disabled {
                        opacity: 0.7;
                        cursor: not-allowed;
                    }
                    
                    select:hover:not(:disabled) {
                        border-color: ${theme === 'dark' ? '#555' : '#bbb'};
                    }
                    
                    select:focus:not(:disabled) {
                        border-color: ${theme === 'dark' ? '#4299E1' : '#3182CE'};
                        box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(66, 153, 225, 0.2)' : 'rgba(49, 130, 206, 0.2)'};
                    }
                `}</style>
            </div>
        );
    }
}

export default MultiPanelPage;