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

        return (
            <>
                <div style={{
                    height: `${headerHeight}px`,
                    padding: '8px 12px',
                    borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                    backgroundColor: theme === 'dark' ? '#30404D' : '#EBF1F5'
                }}>
                    <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>Market News</h3>
                    <span style={{ fontSize: '9px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>
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
                        ...scrollbarStyles
                    }}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                >
                    {news.map((newsItem) => (
                        <div key={`news-${newsItem.id}`} style={{
                            padding: '6px 8px',
                            borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                            fontSize: '10px',
                            cursor: 'pointer',
                            backgroundColor: newsItem.id === this.newsCounter ?
                                (theme === 'dark' ? '#2A3843' : '#F0F5F9') : 'transparent',
                            transition: 'background-color 0.2s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                    <span style={{
                                        padding: '1px 3px',
                                        backgroundColor: newsItem.impact === 'high' ? '#DB4437' :
                                            newsItem.impact === 'medium' ? '#F4B400' : '#0F9D58',
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
                                        color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                                        minWidth: '38px'
                                    }}>
                                        {newsItem.timestamp}
                                    </span>
                                    <span style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: newsItem.sentiment === 'positive' ? '#0F9D58' :
                                            newsItem.sentiment === 'negative' ? '#DB4437' : '#F4B400'
                                    }} />
                                </div>
                                <span style={{
                                    fontSize: '8px',
                                    color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                                    fontStyle: 'italic'
                                }}>
                                    {newsItem.source}
                                </span>
                            </div>
                            <div style={{
                                fontWeight: '600',
                                marginBottom: '3px',
                                color: theme === 'dark' ? '#F5F8FA' : '#182026',
                                fontSize: '9px',
                                lineHeight: '1.2'
                            }}>
                                {newsItem.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {newsItem.assets.slice(0, 3).map((asset: string) => (
                                        <span key={asset} style={{
                                            padding: '1px 3px',
                                            backgroundColor: theme === 'dark' ? '#5C7080' : '#EBF1F5',
                                            borderRadius: '2px',
                                            fontSize: '7px',
                                            color: theme === 'dark' ? '#F5F8FA' : '#182026'
                                        }}>
                                            {asset}
                                        </span>
                                    ))}
                                </div>
                                <span style={{
                                    padding: '1px 4px',
                                    backgroundColor: theme === 'dark' ? '#5C7080' : '#EBF1F5',
                                    borderRadius: '2px',
                                    fontSize: '7px',
                                    color: theme === 'dark' ? '#F5F8FA' : '#182026'
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