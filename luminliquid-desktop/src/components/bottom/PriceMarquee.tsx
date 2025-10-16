import React from "react";
import { themeManager } from "../../globals/theme/ThemeManager";

interface TickerTapeState {
    quotes: Array<{ id: number; symbol: string; name: string; price: number; change: number }>;
    currentIndex: number;
    theme: 'dark' | 'light';
}

class TickerTape extends React.Component<{}, TickerTapeState> {
    private intervalId: NodeJS.Timeout | null = null;
    private unsubscribe: (() => void) | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            quotes: this.generateQuotes(),
            currentIndex: 0,
            theme: themeManager.getTheme()
        };
    }

    componentDidMount() {
        this.intervalId = setInterval(() => {
            this.setState(prevState => ({
                currentIndex: (prevState.currentIndex + 5) % prevState.quotes.length
            }));
        }, 3000);
        this.unsubscribe = themeManager.subscribe((theme) => {
            this.setState({ theme });
        });
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    generateQuotes = () => {
        return [
            { id: 1, symbol: 'AAPL', name: 'AAPL', price: 182.63, change: 2.34 },
            { id: 2, symbol: 'GOOGL', name: 'GOOGL', price: 2782.45, change: -1.23 },
            { id: 3, symbol: 'MSFT', name: 'MSFT', price: 413.72, change: 0.89 },
            { id: 4, symbol: 'TSLA', name: 'TSLA', price: 245.18, change: 5.67 },
            { id: 5, symbol: 'AMZN', name: 'AMZN', price: 3542.18, change: -0.45 },
            { id: 6, symbol: 'NVDA', name: 'NVDA', price: 1189.25, change: 3.21 },
            { id: 7, symbol: 'META', name: 'META', price: 468.32, change: 1.56 },
            { id: 8, symbol: 'NFLX', name: 'NFLX', price: 612.45, change: -2.18 },
            { id: 9, symbol: 'BTC', name: 'BTC', price: 51234.56, change: 4.32 },
            { id: 10, symbol: 'ETH', name: 'ETH', price: 2890.12, change: -1.67 },
            { id: 11, symbol: 'BABA', name: 'BABA', price: 78.34, change: 0.78 },
            { id: 12, symbol: 'JD', name: 'JD', price: 28.91, change: -0.92 },
            { id: 13, symbol: 'PDD', name: 'v', price: 145.67, change: 2.45 },
            { id: 14, symbol: 'BYD', name: 'BYD', price: 234.56, change: 3.12 },
            { id: 15, symbol: 'NIO', name: 'NIO', price: 7.89, change: -3.45 },
            { id: 16, symbol: 'XPEV', name: 'XPEV', price: 9.12, change: 1.23 },
            { id: 17, symbol: 'LI', name: 'LI', price: 31.45, change: -0.67 },
            { id: 18, symbol: 'BIDU', name: 'BIDU', price: 105.78, change: 0.34 },
            { id: 19, symbol: 'TCEHY', name: 'TCEHY', price: 345.67, change: 1.89 },
            { id: 20, symbol: 'KO', name: 'KO', price: 59.83, change: -0.23 }
        ];
    };

    handleQuoteClick = (quote: any) => {
        console.log('Quote clicked:', quote);
        alert(`Click ${quote.name} (${quote.symbol}) - Price: $${quote.price} Change: ${quote.change >= 0 ? '+' : ''}${quote.change}%`);
    };

    render() {
        const { theme } = this.state;
        const { quotes, currentIndex } = this.state;
        const visibleQuotes = [
            quotes[currentIndex],
            quotes[(currentIndex + 1) % quotes.length],
            quotes[(currentIndex + 2) % quotes.length],
            quotes[(currentIndex + 3) % quotes.length],
        ];
        return (
            <div
                style={{
                    height: '30px',
                    backgroundColor: theme === 'dark' ? '#2F343C' : '#F5F8FA',
                    borderBottom: theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#F5F8FA' : '#182026',
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
                        {visibleQuotes.map((quote, index) => (
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
                                    backgroundColor: theme === 'dark' ? '#394B59' : '#EBF1F5',
                                    border: theme === 'dark' ? '1px solid #5F6B7C' : '1px solid #DCE0E5',
                                    transition: 'all 0.2s ease',
                                    height: '24px',
                                    flex: '1',
                                    minWidth: '0',
                                    fontSize: '11px',
                                    lineHeight: '16px',
                                    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#5F6B7C' : '#DCE0E5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#394B59' : '#EBF1F5';
                                }}
                            >
                                <span style={{
                                    marginRight: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '11px'
                                }}>
                                    {quote.symbol}
                                </span>
                                <span style={{
                                    marginRight: '6px',
                                    fontSize: '11px',
                                    fontWeight: '500'
                                }}>
                                    ${quote.price.toFixed(2)}
                                </span>
                                <span style={{
                                    color: quote.change >= 0
                                        ? (theme === 'dark' ? '#48C78E' : '#0A6640')
                                        : (theme === 'dark' ? '#F56565' : '#A82A2A'),
                                    fontWeight: 'bold',
                                    fontSize: '10px'
                                }}>
                                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    style={{
                        width: '1px',
                        height: '20px',
                        backgroundColor: theme === 'dark' ? '#394B59' : '#DCE0E5',
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
                                    backgroundColor: theme === 'dark' ? '#293742' : '#F5F8FA',
                                    border: theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                                    flexShrink: 0,
                                    transition: 'all 0.2s ease',
                                    height: '22px',
                                    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#5F6B7C' : '#DCE0E5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#293742' : '#F5F8FA';
                                }}
                            >
                                <span style={{
                                    marginRight: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '11px'
                                }}>
                                    {quote.symbol}
                                </span>
                                <span style={{
                                    marginRight: '6px',
                                    fontSize: '11px',
                                    fontWeight: '500'
                                }}>
                                    ${quote.price.toFixed(2)}
                                </span>
                                <span style={{
                                    color: quote.change >= 0
                                        ? (theme === 'dark' ? '#48C78E' : '#0A6640')
                                        : (theme === 'dark' ? '#F56565' : '#A82A2A'),
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
                                </span>
                            </div>
                        ))}
                    </div>
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

export default TickerTape;