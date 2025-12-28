import React from "react";
import { themeManager } from "../../globals/theme/ThemeManager";
import { useNavigate } from "react-router-dom";
import { withRouter } from "../../WithRouter";
import { CexType } from "../../types";

interface TickerTapeState {
    quotes: Array<{
        id: number;
        symbol: string;
        name: string;
        price: number;
        change: number;
        volume: number;
    }>;
    currentIndex: number;
    theme: 'dark' | 'light';
    loading: boolean;
    error: string | null;
}

interface BinanceTicker {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    lastPrice: string;
    volume: string;
    quoteVolume: string;
}

interface TickerTapeProps {
    navigate: (path: string, options?: any) => void;
}

class TickerTape extends React.Component<TickerTapeProps, TickerTapeState> {
    private intervalId: NodeJS.Timeout | null = null;
    private unsubscribe: (() => void) | null = null;
    private dataFetchInterval: NodeJS.Timeout | null = null;

    constructor(props: TickerTapeProps) {
        super(props);
        this.state = {
            quotes: [],
            currentIndex: 0,
            theme: themeManager.getTheme(),
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        this.fetchBinanceData();
        this.intervalId = setInterval(() => {
            this.setState(prevState => ({
                currentIndex: (prevState.currentIndex + 5) % Math.max(prevState.quotes.length, 1)
            }));
        }, 3000);
        this.dataFetchInterval = setInterval(() => {
            this.fetchBinanceData();
        }, 10000);
        this.unsubscribe = themeManager.subscribe((theme) => {
            this.setState({ theme });
        });
    }

    componentWillUnmount() {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.dataFetchInterval) clearInterval(this.dataFetchInterval);
        if (this.unsubscribe) this.unsubscribe();
    }

    fetchBinanceData = async () => {
        try {
            this.setState({ loading: true, error: null });
            const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            const data: BinanceTicker[] = await response.json();
            const filteredData = data
                .filter(ticker => {
                    return ticker.symbol.endsWith('USDT') &&
                        !ticker.symbol.includes('UP') &&
                        !ticker.symbol.includes('DOWN') &&
                        parseFloat(ticker.volume) > 1000000;
                })
                .slice(0, 50)
                .map((ticker, index) => ({
                    id: index + 1,
                    symbol: ticker.symbol.replace('USDT', ''),
                    name: ticker.symbol.replace('USDT', ''),
                    price: parseFloat(ticker.lastPrice),
                    change: parseFloat(ticker.priceChangePercent),
                    volume: parseFloat(ticker.volume)
                }))
                .sort((a, b) => b.volume - a.volume);
            this.setState({
                quotes: filteredData,
                loading: false
            });
        } catch (error) {
            this.setState({
                error: 'Unable to obtain market data',
                loading: false
            });
        }
    };

    handleQuoteClick = (quote: any) => {
        const cexType = CexType.Binance;
        this.props.navigate(`/trade/${cexType}/${quote.symbol}`);
    };

    render() {
        const { theme, quotes, currentIndex, loading, error } = this.state;
        const visibleQuotes = quotes.length > 0 ? [
            quotes[currentIndex % quotes.length],
            quotes[(currentIndex + 1) % quotes.length],
            quotes[(currentIndex + 2) % quotes.length],
            quotes[(currentIndex + 3) % quotes.length],
        ] : [];
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const headerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const quoteBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const quoteHoverBg = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const positiveColor = '#2E8B57';
        const negativeColor = '#DC143C';
        if (loading && quotes.length === 0) {
            return (
                <div style={{
                    height: '30px',
                    backgroundColor: headerBg,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textColor,
                    fontSize: '12px'
                }}>
                    Loading.....
                </div>
            );
        }
        if (error) {
            return (
                <div style={{
                    height: '30px',
                    backgroundColor: headerBg,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: negativeColor,
                    fontSize: '12px'
                }}>
                    {error}
                </div>
            );
        }
        return (
            <div
                style={{
                    height: '30px',
                    backgroundColor: headerBg,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    fontSize: '12px',
                    color: textColor,
                    overflow: 'hidden',
                    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: '1',
                    minWidth: '600px',
                    height: '30px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '30px',
                        flex: '1',
                        overflow: 'hidden',
                        gap: '4px'
                    }}>
                        {visibleQuotes.map((quote, index) => quote ? (
                            <div
                                key={`${quote.id}-${index}`}
                                onClick={() => this.handleQuoteClick(quote)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    backgroundColor: quoteBg,
                                    border: `1px solid ${borderColor}`,
                                    transition: 'all 0.2s ease',
                                    height: '24px',
                                    flex: '1',
                                    minWidth: '0',
                                    fontSize: '11px',
                                    lineHeight: '16px',
                                    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = quoteHoverBg;
                                    e.currentTarget.style.borderColor = theme === 'dark' ? '#A7B6C2' : '#404854';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = quoteBg;
                                    e.currentTarget.style.borderColor = borderColor;
                                }}
                            >
                                <span style={{
                                    marginRight: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '11px',
                                    color: textColor
                                }}>
                                    {quote.symbol}
                                </span>
                                <span style={{
                                    marginRight: '6px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    color: textColor
                                }}>
                                    ${quote.price.toFixed(2)}
                                </span>
                                <span style={{
                                    color: quote.change >= 0 ? positiveColor : negativeColor,
                                    fontWeight: 'bold',
                                    fontSize: '10px'
                                }}>
                                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
                                </span>
                            </div>
                        ) : null)}
                    </div>
                </div>
                <div
                    style={{
                        width: '1px',
                        height: '20px',
                        backgroundColor: borderColor,
                        margin: '0 16px'
                    }}
                />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: '2',
                    overflow: 'hidden',
                    position: 'relative',
                    height: '30px'
                }}>
                    {quotes.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                animation: 'scrollTicker 45s linear infinite',
                                whiteSpace: 'nowrap',
                                height: '30px'
                            }}
                        >
                            {[...quotes, ...quotes].map((quote, index) => (
                                <div
                                    key={`${quote.id}-${index}`}
                                    onClick={() => this.handleQuoteClick(quote)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '3px 8px',
                                        margin: '0 2px',
                                        borderRadius: '2px',
                                        fontSize: '11px',
                                        backgroundColor: quoteBg,
                                        border: `1px solid ${borderColor}`,
                                        flexShrink: 0,
                                        transition: 'all 0.2s ease',
                                        height: '22px',
                                        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = quoteHoverBg;
                                        e.currentTarget.style.borderColor = theme === 'dark' ? '#A7B6C2' : '#404854';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = quoteBg;
                                        e.currentTarget.style.borderColor = borderColor;
                                    }}
                                >
                                    <span style={{
                                        marginRight: '6px',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        color: textColor
                                    }}>
                                        {quote.symbol}
                                    </span>
                                    <span style={{
                                        marginRight: '6px',
                                        fontSize: '11px',
                                        fontWeight: '500',
                                        color: textColor
                                    }}>
                                        ${quote.price.toFixed(2)}
                                    </span>
                                    <span style={{
                                        color: quote.change >= 0 ? positiveColor : negativeColor,
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <style>
                    {`
            @keyframes scrollTicker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
                </style>
            </div>
        );
    }
}

export default withRouter(TickerTape);