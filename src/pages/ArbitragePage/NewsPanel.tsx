import React from "react";

interface NewsPanelProps {
    theme: 'dark' | 'light';
    headerHeight: number;
    scrollbarStyles: any;
    panelHeight: number;
}

interface NewsPanelState {
    news: any[];
    isHovered: boolean;
}

class NewsPanel extends React.Component<NewsPanelProps, NewsPanelState> {
    private newsInterval: NodeJS.Timeout | null = null;
    private scrollContainerRef = React.createRef<HTMLDivElement>();
    private newsCounter = 8;

    constructor(props: NewsPanelProps) {
        super(props);
        this.state = {
            news: [
                {
                    id: 1,
                    timestamp: this.getCurrentTime(),
                    title: 'Fed Announces Interest Rate Decision - No Change Expected',
                    source: 'Bloomberg',
                    impact: 'high',
                    sentiment: 'neutral',
                    assets: ['USD', 'BTC', 'SPY'],
                    category: 'macro'
                },
                {
                    id: 2,
                    timestamp: this.getCurrentTime(-120),
                    title: 'Major Crypto Exchange Faces Regulatory Scrutiny Over Compliance',
                    source: 'CoinDesk',
                    impact: 'medium',
                    sentiment: 'negative',
                    assets: ['BTC', 'ETH', 'BNB'],
                    category: 'regulation'
                },
                {
                    id: 3,
                    timestamp: this.getCurrentTime(-180),
                    title: 'Ethereum Foundation Announces Major Protocol Upgrade Timeline',
                    source: 'The Block',
                    impact: 'high',
                    sentiment: 'positive',
                    assets: ['ETH', 'L2', 'DEFI'],
                    category: 'tech'
                },
                {
                    id: 4,
                    timestamp: this.getCurrentTime(-240),
                    title: 'Institutional Investors Increase Crypto Allocation by 15% This Quarter',
                    source: 'Reuters',
                    impact: 'medium',
                    sentiment: 'positive',
                    assets: ['BTC', 'GBTC', 'MSTR'],
                    category: 'institutional'
                }
            ],
            isHovered: false
        };
    }

    componentDidMount() {
        this.startNewsFeed();
    }

    componentWillUnmount() {
        if (this.newsInterval) {
            clearInterval(this.newsInterval);
        }
    }

    getCurrentTime = (offsetSeconds: number = 0) => {
        const now = new Date();
        now.setSeconds(now.getSeconds() + offsetSeconds);
        return now.toTimeString().split(' ')[0].substring(0, 8);
    };

    startNewsFeed = () => {
        this.newsInterval = setInterval(() => {
            if (!this.state.isHovered) {
                this.addNewNews();
            }
        }, 5000);
    };

    addNewNews = () => {
        const newsTemplates = [
            {
                title: 'CPI Data Release Shows Inflation Cooling Faster Than Expected',
                source: 'Bureau of Labor Statistics',
                impact: 'high',
                sentiment: 'positive' as const,
                assets: ['USD', 'SPY', 'TLT'],
                category: 'economic'
            },
            {
                title: 'New DeFi Protocol Launches With $50M TVL in First 24 Hours',
                source: 'DeFi Pulse',
                impact: 'medium',
                sentiment: 'positive' as const,
                assets: ['DEFI', 'LENDING', 'TVL'],
                category: 'defi'
            },
            {
                title: 'SEC Delays Decision on Spot Bitcoin ETF Applications',
                source: 'SEC Filing',
                impact: 'medium',
                sentiment: 'negative' as const,
                assets: ['BTC', 'ETF', 'GBTC'],
                category: 'regulation'
            },
            {
                title: 'Major Bank Announces Crypto Custody Services for Institutional Clients',
                source: 'Financial Times',
                impact: 'medium',
                sentiment: 'positive' as const,
                assets: ['BTC', 'BANK', 'INSTITUTIONAL'],
                category: 'institutional'
            }
        ];

        const template = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];

        this.newsCounter++;
        const newNews = {
            id: this.newsCounter,
            timestamp: this.getCurrentTime(),
            ...template
        };

        this.setState(prevState => ({
            news: [newNews, ...prevState.news.slice(0, 14)]
        }), () => {

            if (this.scrollContainerRef.current && !this.state.isHovered) {
                this.scrollContainerRef.current.scrollTop = 0;
            }
        });
    };

    handleMouseEnter = () => {
        this.setState({ isHovered: true });
    };

    handleMouseLeave = () => {
        this.setState({ isHovered: false });
    };

    render() {
        const { theme, headerHeight, scrollbarStyles } = this.props;
        const { news } = this.state;

        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const sidebarBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const hoverBgColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';

        return (
            <>
                <div style={{
                    height: `${headerHeight}px`,
                    padding: '8px 12px',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                    backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '12px',
                        fontWeight: '600',
                        color: textColor
                    }}>
                        Market News
                    </h3>
                    <span style={{
                        fontSize: '9px',
                        color: secondaryTextColor
                    }}>
                        Live Feed
                    </span>
                </div>
                <div
                    ref={this.scrollContainerRef}
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        overflowX: 'hidden' as const,
                        minHeight: 0,
                        backgroundColor: backgroundColor,
                        ...scrollbarStyles
                    }}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                >
                    {news.map((newsItem) => (
                        <div
                            key={`news-${newsItem.id}`}
                            style={{
                                padding: '6px 8px',
                                borderBottom: `1px solid ${borderColor}`,
                                fontSize: '10px',
                                cursor: 'pointer',
                                backgroundColor: newsItem.id === this.newsCounter ?
                                    hoverBgColor : backgroundColor,
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = hoverBgColor;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    newsItem.id === this.newsCounter ? hoverBgColor : backgroundColor;
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '3px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flex: 1
                                }}>
                                    <span style={{
                                        padding: '1px 3px',
                                        backgroundColor: newsItem.impact === 'high' ? '#DC143C' :
                                            newsItem.impact === 'medium' ? '#F4B400' : '#2E8B57',
                                        color: 'white',
                                        borderRadius: '2px',
                                        fontSize: '7px',
                                        fontWeight: '600',
                                        minWidth: '28px',
                                        textAlign: 'center'
                                    }}>
                                        {newsItem.impact.toUpperCase()}
                                    </span>
                                    <span style={{
                                        fontSize: '8px',
                                        color: secondaryTextColor,
                                        minWidth: '38px'
                                    }}>
                                        {newsItem.timestamp}
                                    </span>
                                    <span style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: newsItem.sentiment === 'positive' ? '#2E8B57' :
                                            newsItem.sentiment === 'negative' ? '#DC143C' : '#F4B400'
                                    }} />
                                </div>
                                <span style={{
                                    fontSize: '8px',
                                    color: secondaryTextColor,
                                    fontStyle: 'italic'
                                }}>
                                    {newsItem.source}
                                </span>
                            </div>
                            <div style={{
                                fontWeight: '600',
                                marginBottom: '3px',
                                color: textColor,
                                fontSize: '9px',
                                lineHeight: '1.2'
                            }}>
                                {newsItem.title}
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '4px',
                                    flexWrap: 'wrap'
                                }}>
                                    {newsItem.assets.slice(0, 3).map((asset: string) => (
                                        <span key={asset} style={{
                                            padding: '1px 3px',
                                            backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                            borderRadius: '2px',
                                            fontSize: '7px',
                                            color: textColor
                                        }}>
                                            {asset}
                                        </span>
                                    ))}
                                </div>
                                <span style={{
                                    padding: '1px 4px',
                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                    borderRadius: '2px',
                                    fontSize: '7px',
                                    color: textColor
                                }}>
                                    {newsItem.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }
}

export default NewsPanel;