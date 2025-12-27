import React from "react";
import {
    Menu,
    MenuItem,
    Icon,
    Button
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";
import { overflowManager } from "../globals/theme/OverflowTypeManager";

interface NewsPageProps {
    children?: React.ReactNode;
}

interface NewsPageState {
    theme: 'dark' | 'light';
    containerHeight: number;
    selectedCategory: string;
    selectedRegion: string;
    newsSources: Set<string>;
    autoRefresh: boolean;
    currentPage: number;
    expandedNewsId: string | null;
    searchQuery: string;
    timeFilter: string;
    importanceFilter: string;
    selectedNewsId: string | null;
}

interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
    source: string;
    timestamp: Date;
    category: string;
    region: string;
    importance: 'high' | 'medium' | 'low';
    sentiment: 'positive' | 'negative' | 'neutral';
    tickers: string[];
    impactScore: number;
    readTime: number;
    isBreaking: boolean;
}

class NewsPage extends React.Component<NewsPageProps, NewsPageState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef: React.RefObject<HTMLDivElement | null>;
    private newsUpdateInterval: NodeJS.Timeout | null = null;

    private categories = [
        { key: 'all', label: 'All News', icon: 'feed' },
        { key: 'markets', label: 'Markets', icon: 'timeline-line-chart' },
        { key: 'stocks', label: 'Stocks', icon: 'dollar' },
        { key: 'bonds', label: 'Bonds', icon: 'comparison' },
        { key: 'forex', label: 'Forex', icon: 'exchange' },
        { key: 'commodities', label: 'Commodities', icon: 'oil-field' },
        { key: 'crypto', label: 'Cryptocurrency', icon: 'blockchain' },
        { key: 'economy', label: 'Economy', icon: 'bank-account' },
        { key: 'policy', label: 'Central Banks', icon: 'office' },
        { key: 'earnings', label: 'Earnings', icon: 'dollar' },
        { key: 'mergers', label: 'M&A', icon: 'merge-links' },
        { key: 'ipo', label: 'IPO', icon: 'new-object' }
    ];

    private regions = [
        { key: 'global', label: 'Global', icon: 'globe' },
        { key: 'us', label: 'United States', icon: 'flag' },
        { key: 'eu', label: 'Europe', icon: 'flag' },
        { key: 'uk', label: 'UK', icon: 'flag' },
        { key: 'asia', label: 'Asia', icon: 'flag' },
        { key: 'china', label: 'China', icon: 'flag' },
        { key: 'japan', label: 'Japan', icon: 'flag' },
        { key: 'emea', label: 'EMEA', icon: 'flag' },
        { key: 'latam', label: 'Latin America', icon: 'flag' }
    ];

    private sources = [
        { key: 'bloomberg', label: 'Bloomberg' },
        { key: 'reuters', label: 'Reuters' },
        { key: 'wsj', label: 'Wall Street Journal' },
        { key: 'financial-times', label: 'Financial Times' },
        { key: 'cnbc', label: 'CNBC' },
        { key: 'marketwatch', label: 'MarketWatch' },
        { key: 'yahoo-finance', label: 'Yahoo Finance' },
        { key: 'seeking-alpha', label: 'Seeking Alpha' },
        { key: 'business-wire', label: 'Business Wire' },
        { key: 'pr-newswire', label: 'PR Newswire' }
    ];

    private timeFilters = [
        { key: '15m', label: 'Last 15 min' },
        { key: '1h', label: 'Last hour' },
        { key: '4h', label: 'Last 4 hours' },
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'week', label: 'This week' }
    ];

    private importanceFilters = [
        { key: 'all', label: 'All' },
        { key: 'high', label: 'High Impact' },
        { key: 'medium', label: 'Medium Impact' },
        { key: 'low', label: 'Low Impact' }
    ];

    private generateNewsData = (): NewsArticle[] => {
        const sources = ['Bloomberg', 'Reuters', 'WSJ', 'Financial Times', 'CNBC'];
        const categories = ['markets', 'stocks', 'bonds', 'forex', 'economy', 'policy'];
        const regions = ['us', 'eu', 'asia', 'global'];
        const sentiments = ['positive', 'negative', 'neutral'] as const;
        const tickersList = [
            ['AAPL', 'MSFT', 'GOOGL'], ['TSLA', 'AMZN', 'META'],
            ['JPM', 'GS', 'MS'], ['BTC', 'ETH', 'SOL'],
            ['SPX', 'DJI', 'NDX'], ['EURUSD', 'GBPUSD', 'USDJPY']
        ];

        const data: NewsArticle[] = [];
        const now = new Date();

        for (let i = 0; i < 100; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const importance = Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';
            const isBreaking = importance === 'high' && Math.random() > 0.8;

            data.push({
                id: `news-${i}`,
                title: this.generateHeadline(category),
                summary: this.generateSummary(),
                content: this.generateContent(),
                source: sources[Math.floor(Math.random() * sources.length)],
                timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
                category,
                region: regions[Math.floor(Math.random() * regions.length)],
                importance,
                sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
                tickers: tickersList[Math.floor(Math.random() * tickersList.length)],
                impactScore: Math.floor(Math.random() * 100),
                readTime: Math.floor(Math.random() * 5) + 1,
                isBreaking
            });
        }

        return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    private generateHeadline = (category: string): string => {
        const headlines = {
            markets: [
                'S&P 500 Futures Edge Higher as Treasury Yields Stabilize',
                'Global Markets Mixed Amid Central Bank Policy Uncertainty',
                'Volatility Index Spikes as Geopolitical Tensions Escalate',
                'Asian Stocks Rally on Strong Economic Data, Dollar Weakens'
            ],
            stocks: [
                'Apple Hits Record High on Strong iPhone Sales Forecast',
                'Tesla Shares Volatile After Q4 Delivery Miss',
                'Bank Stocks Rally as Fed Stress Test Results Awaited',
                'Tech Sector Leads Market Rally Amid AI Optimism'
            ],
            bonds: [
                '10-Year Treasury Yield Falls to 4.2% on Inflation Data',
                'Corporate Bond Spreads Widen Amid Economic Concerns',
                'Fed Balance Sheet Reduction Accelerates in Q3',
                'Municipal Bonds See Record Inflows as Rates Peak'
            ],
            forex: [
                'Dollar Index Drops to Three-Month Low on Dovish Fed Bets',
                'Euro Strengthens Against Dollar After ECB Hawkish Stance',
                'Yen Intervention Fears Grow as USD/JPY Nears 152',
                'Emerging Market Currencies Rally on Risk-On Sentiment'
            ],
            economy: [
                'Inflation Cools More Than Expected, Rate Cut Bets Rise',
                'Job Growth Slows but Wages Continue Upward Trend',
                'Consumer Confidence Unexpectedly Falls in December',
                'Manufacturing PMI Shows Contraction for Fifth Month'
            ],
            policy: [
                'Fed Holds Rates Steady, Signals Three Cuts in 2024',
                'ECB Maintains Hawkish Tone Despite Growth Concerns',
                'BOJ Considers Policy Shift as Inflation Persists',
                'PBOC Injects Liquidity to Support Property Sector'
            ]
        };

        const categoryHeadlines = headlines[category as keyof typeof headlines] || headlines.markets;
        return categoryHeadlines[Math.floor(Math.random() * categoryHeadlines.length)];
    };

    private generateSummary = (): string => {
        const summaries = [
            'Market participants are closely watching key economic indicators as volatility remains elevated.',
            'The central bank decision is expected to set the tone for global risk assets in the coming weeks.',
            'Corporate earnings season kicks off with major banks reporting mixed results amid economic uncertainty.',
            'Technical analysis suggests key support levels are being tested across major equity indices.',
            'Options market positioning indicates increased hedging activity ahead of major economic events.'
        ];
        return summaries[Math.floor(Math.random() * summaries.length)];
    };

    private generateContent = (): string => {
        return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Market analysts are closely monitoring the situation as it develops. Technical indicators suggest potential breakout scenarios while fundamental factors remain supportive.`;
    };

    private newsData: NewsArticle[] = this.generateNewsData();

    constructor(props: NewsPageProps) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement | null>();
        this.state = {
            theme: themeManager.getTheme(),
            containerHeight: 0,
            selectedCategory: 'all',
            selectedRegion: 'global',
            newsSources: new Set(this.sources.map(s => s.key)),
            autoRefresh: true,
            currentPage: 0,
            expandedNewsId: null,
            searchQuery: '',
            timeFilter: 'today',
            importanceFilter: 'all',
            selectedNewsId: this.generateNewsData()[0]?.id || null
        };
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

    private handleCategorySelect = (categoryKey: string) => {
        this.setState({ selectedCategory: categoryKey, currentPage: 0 });
    };

    private handleRegionSelect = (regionKey: string) => {
        this.setState({ selectedRegion: regionKey, currentPage: 0 });
    };

    private handleSourceToggle = (sourceKey: string) => {
        this.setState(prevState => {
            const newSources = new Set(prevState.newsSources);
            if (newSources.has(sourceKey)) {
                newSources.delete(sourceKey);
            } else {
                newSources.add(sourceKey);
            }
            return { newsSources: newSources, currentPage: 0 };
        });
    };

    private handleNewsSelect = (newsId: string) => {
        this.setState({ selectedNewsId: newsId });
    };

    private handleTimeFilterChange = (filterKey: string) => {
        this.setState({ timeFilter: filterKey, currentPage: 0 });
    };

    private handleImportanceFilterChange = (filterKey: string) => {
        this.setState({ importanceFilter: filterKey, currentPage: 0 });
    };

    private handleSearchChange = (query: string) => {
        this.setState({ searchQuery: query, currentPage: 0 });
    };

    private toggleAutoRefresh = () => {
        this.setState(prevState => ({ autoRefresh: !prevState.autoRefresh }));
    };

    private handlePageChange = (newPage: number) => {
        this.setState({ currentPage: newPage });
    };

    private formatTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    private getFilteredNews = (): NewsArticle[] => {
        const { selectedCategory, selectedRegion, newsSources, searchQuery, timeFilter, importanceFilter } = this.state;

        return this.newsData.filter(article => {

            if (selectedCategory !== 'all' && article.category !== selectedCategory) {
                return false;
            }


            if (selectedRegion !== 'global' && article.region !== selectedRegion) {
                return false;
            }


            const sourceKey = article.source.toLowerCase().replace(/\s+/g, '-');
            if (!newsSources.has(sourceKey)) {
                return false;
            }


            if (importanceFilter !== 'all' && article.importance !== importanceFilter) {
                return false;
            }


            if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !article.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }


            const now = new Date();
            const articleTime = article.timestamp.getTime();
            const timeDiff = now.getTime() - articleTime;

            switch (timeFilter) {
                case '15m': if (timeDiff > 15 * 60 * 1000) return false; break;
                case '1h': if (timeDiff > 60 * 60 * 1000) return false; break;
                case '4h': if (timeDiff > 4 * 60 * 60 * 1000) return false; break;
                case 'today':
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (article.timestamp < today) return false;
                    break;
                case 'yesterday':
                    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    yesterday.setHours(0, 0, 0, 0);
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    if (article.timestamp < yesterday || article.timestamp >= todayStart) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (article.timestamp < weekAgo) return false;
                    break;
            }

            return true;
        });
    };

    componentDidMount() {
        this.updateContainerHeight();
        window.addEventListener('resize', this.debouncedResize);
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
        overflowManager.setOverflow('hidden');

        this.newsUpdateInterval = setInterval(() => {
            if (this.state.autoRefresh) {

                const newArticle = this.generateNewsData()[0];
                newArticle.timestamp = new Date();
                this.newsData.unshift(newArticle);
                this.forceUpdate();
            }
        }, 30000);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedResize);
        if (this.unsubscribe) this.unsubscribe();
        if (this.newsUpdateInterval) {
            clearInterval(this.newsUpdateInterval);
        }
    }

    private applyGlobalTheme = () => {
        const { theme } = this.state;
        const focusColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const hoverBgColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
        const selectedBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';
        const focusShadow = theme === 'dark'
            ? '0 0 0 2px rgba(143, 153, 168, 0.3)'
            : '0 0 0 2px rgba(95, 107, 124, 0.2)';

        return `
      .news-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .news-scrollbar::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        border-radius: 3px;
      }
      
      .news-scrollbar::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 3px;
      }
      
      .news-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
      }
      
      .news-item-hover:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .news-item-selected {
        background-color: ${selectedBgColor} !important;
        border-left: 3px solid ${primaryColor} !important;
      }
      
      .filter-button {
        transition: all 0.2s ease;
        border-radius: 6px;
        cursor: pointer;
      }
      
      .filter-button:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .filter-button.selected {
        background-color: ${selectedBgColor} !important;
        border-color: ${primaryColor} !important;
      }
      
      .sentiment-positive {
        color: ${theme === 'dark' ? '#2E8B57' : '#238551'} !important;
      }
      
      .sentiment-negative {
        color: ${theme === 'dark' ? '#DC143C' : '#C2132C'} !important;
      }
      
      .sentiment-neutral {
        color: ${theme === 'dark' ? '#8F99A8' : '#5F6B7C'} !important;
      }
      
      .breaking-news {
        border-left: 3px solid ${theme === 'dark' ? '#FF6B6B' : '#DC143C'} !important;
        background: ${theme === 'dark' ? 'rgba(220, 20, 60, 0.1)' : 'rgba(220, 20, 60, 0.05)'} !important;
      }
    `;
    };

    private renderControlBar = () => {
        const { theme, selectedCategory, selectedRegion, autoRefresh, searchQuery, timeFilter, importanceFilter } = this.state;
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

        return (
            <div style={{
                padding: '12px 20px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: theme === 'dark' ? '#0F1116' : '#F8F9FA',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Category Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: primaryColor }}>Category:</span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => this.handleCategorySelect(e.target.value)}
                        style={{
                            padding: '6px 8px',
                            fontSize: '13px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '4px',
                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                            color: textColor,
                            outline: 'none',
                            minWidth: '120px'
                        }}
                    >
                        {this.categories.map(cat => (
                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                {/* Region Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: primaryColor }}>Region:</span>
                    <select
                        value={selectedRegion}
                        onChange={(e) => this.handleRegionSelect(e.target.value)}
                        style={{
                            padding: '6px 8px',
                            fontSize: '13px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '4px',
                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                            color: textColor,
                            outline: 'none',
                            minWidth: '140px'
                        }}
                    >
                        {this.regions.map(region => (
                            <option key={region.key} value={region.key}>{region.label}</option>
                        ))}
                    </select>
                </div>

                {/* Time Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: primaryColor }}>Time:</span>
                    <select
                        value={timeFilter}
                        onChange={(e) => this.handleTimeFilterChange(e.target.value)}
                        style={{
                            padding: '6px 8px',
                            fontSize: '13px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '4px',
                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                            color: textColor,
                            outline: 'none',
                            minWidth: '120px'
                        }}
                    >
                        {this.timeFilters.map(filter => (
                            <option key={filter.key} value={filter.key}>{filter.label}</option>
                        ))}
                    </select>
                </div>

                {/* Importance Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: primaryColor }}>Impact:</span>
                    <select
                        value={importanceFilter}
                        onChange={(e) => this.handleImportanceFilterChange(e.target.value)}
                        style={{
                            padding: '6px 8px',
                            fontSize: '13px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '4px',
                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                            color: textColor,
                            outline: 'none',
                            minWidth: '120px'
                        }}
                    >
                        {this.importanceFilters.map(filter => (
                            <option key={filter.key} value={filter.key}>{filter.label}</option>
                        ))}
                    </select>
                </div>

                {/* Auto Refresh Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: primaryColor }}>Auto Refresh:</span>
                    <Button
                        minimal
                        small
                        icon={autoRefresh ? "pause" : "play"}
                        onClick={this.toggleAutoRefresh}
                        style={{ color: primaryColor }}
                    />
                </div>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Icon
                        icon="search"
                        size={12}
                        color={theme === 'dark' ? '#8F99A8' : '#5F6B7C'}
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search news..."
                        value={searchQuery}
                        onChange={(e) => this.handleSearchChange(e.target.value)}
                        style={{
                            padding: '6px 12px 6px 30px',
                            fontSize: '13px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '4px',
                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                            color: textColor,
                            outline: 'none',
                            width: '200px'
                        }}
                    />
                </div>
            </div>
        );
    };

    private renderSourceFilter = () => {
        const { theme, newsSources } = this.state;
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

        return (
            <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: theme === 'dark' ? '#0F1116' : '#F8F9FA'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: primaryColor }}>Sources:</span>
                    {this.sources.map(source => (
                        <div
                            key={source.key}
                            onClick={() => this.handleSourceToggle(source.key)}
                            className="filter-button"
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: `1px solid ${newsSources.has(source.key) ? primaryColor : borderColor}`,
                                borderRadius: '4px',
                                backgroundColor: newsSources.has(source.key) ?
                                    (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
                                color: textColor,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {source.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    private renderNewsList = () => {
        const { theme, currentPage, selectedNewsId } = this.state;
        const filteredNews = this.getFilteredNews();
        const itemsPerPage = 25;
        const startIndex = currentPage * itemsPerPage;
        const currentNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';

        return (
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRight: `1px solid ${borderColor}`
            }}>
                {/* News Count */}
                <div style={{
                    padding: '8px 16px',
                    borderBottom: `1px solid ${borderColor}`,
                    backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: primaryColor,
                    flexShrink: 0
                }}>
                    {filteredNews.length} news articles
                </div>

                {/* News List */}
                <div style={{ flex: 1, overflow: 'auto' }} className="news-scrollbar">
                    {currentNews.map((article) => (
                        <div
                            key={article.id}
                            className={`news-item-hover ${selectedNewsId === article.id ? 'news-item-selected' : ''} ${article.isBreaking ? 'breaking-news' : ''}`}
                            onClick={() => this.handleNewsSelect(article.id)}
                            style={{
                                padding: '12px 16px',
                                borderBottom: `1px solid ${borderColor}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF'
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        {article.isBreaking && (
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                color: '#DC143C',
                                                textTransform: 'uppercase',
                                                padding: '1px 4px',
                                                backgroundColor: theme === 'dark' ? 'rgba(220, 20, 60, 0.2)' : 'rgba(220, 20, 60, 0.1)',
                                                borderRadius: '2px'
                                            }}>
                                                Breaking
                                            </span>
                                        )}
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: primaryColor
                                        }}>
                                            {article.source}
                                        </span>
                                        <span style={{ fontSize: '10px', color: secondaryTextColor }}>
                                            {this.formatTime(article.timestamp)}
                                        </span>
                                    </div>
                                    <h3 style={{
                                        margin: '0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: textColor,
                                        lineHeight: '1.3'
                                    }}>
                                        {article.title}
                                    </h3>
                                </div>

                                {/* Sentiment */}
                                <Icon
                                    icon={article.sentiment === 'positive' ? 'arrow-up' : article.sentiment === 'negative' ? 'arrow-down' : 'minus'}
                                    size={10}
                                    className={`sentiment-${article.sentiment}`}
                                />
                            </div>

                            {/* Summary */}
                            <p style={{
                                margin: '0 0 6px 0',
                                fontSize: '12px',
                                color: secondaryTextColor,
                                lineHeight: '1.3',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {article.summary}
                            </p>

                            {/* Tickers and Metadata */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                    {article.tickers.slice(0, 3).map(ticker => (
                                        <span key={ticker} style={{
                                            fontSize: '10px',
                                            padding: '1px 4px',
                                            backgroundColor: theme === 'dark' ? '#2D3746' : '#F1F3F5',
                                            color: primaryColor,
                                            borderRadius: '2px',
                                            fontWeight: '600'
                                        }}>
                                            {ticker}
                                        </span>
                                    ))}
                                    {article.tickers.length > 3 && (
                                        <span style={{ fontSize: '10px', color: secondaryTextColor }}>
                                            +{article.tickers.length - 3}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: secondaryTextColor }}>
                                    <span>Imp: {article.importance.charAt(0).toUpperCase()}</span>
                                    <span>Score: {article.impactScore}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        padding: '8px 16px',
                        borderTop: `1px solid ${borderColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA',
                        flexShrink: 0
                    }}>
                        <div style={{ fontSize: '12px', color: secondaryTextColor }}>
                            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredNews.length)} of {filteredNews.length}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Button
                                small
                                minimal
                                icon="chevron-left"
                                onClick={() => this.handlePageChange(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                            />
                            <span style={{ fontSize: '12px', minWidth: '60px', textAlign: 'center' }}>
                                {currentPage + 1}/{totalPages}
                            </span>
                            <Button
                                small
                                minimal
                                icon="chevron-right"
                                onClick={() => this.handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage >= totalPages - 1}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    private renderNewsDetail = () => {
        const { theme, selectedNewsId } = this.state;
        const selectedArticle = this.newsData.find(article => article.id === selectedNewsId);
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';

        if (!selectedArticle) {
            return (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                    minHeight: 0
                }}>
                    {/* Top: Market Data & Charts */}
                    <div style={{
                        flex: '1 1 50%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        padding: '16px',
                        borderBottom: `1px solid ${borderColor}`,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            flex: '0 0 auto',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: primaryColor }}>
                                Market Overview
                            </h3>
                            <span style={{ fontSize: '12px', color: secondaryTextColor }}>Live</span>
                        </div>

                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            minHeight: 0,
                            overflow: 'auto'
                        }} className="news-scrollbar">
                            {/* Market Indices */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '8px'
                            }}>
                                {[
                                    { symbol: 'SPX', name: 'S&P 500', price: 4782.34, change: 12.56, changePercent: 0.26 },
                                    { symbol: 'DJI', name: 'Dow Jones', price: 37592.98, change: -45.23, changePercent: -0.12 },
                                    { symbol: 'NDX', name: 'Nasdaq', price: 16845.12, change: 78.91, changePercent: 0.47 }
                                ].map(index => (
                                    <div key={index.symbol} style={{
                                        padding: '8px',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '4px',
                                        backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA',
                                        fontSize: '12px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', color: textColor }}>{index.symbol}</span>
                                            <span style={{
                                                color: index.change >= 0 ? '#2E8B57' : '#DC143C',
                                                fontWeight: '600',
                                                fontSize: '11px'
                                            }}>
                                                {index.change >= 0 ? '+' : ''}{index.changePercent}%
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: secondaryTextColor }}>{index.name}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: textColor }}>
                                            {index.price.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Currency Pairs */}
                            <div>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: primaryColor
                                }}>
                                    Major Forex
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '6px',
                                    fontSize: '11px'
                                }}>
                                    {[
                                        { pair: 'EUR/USD', price: 1.0956, change: 0.0023 },
                                        { pair: 'GBP/USD', price: 1.2741, change: -0.0012 },
                                        { pair: 'USD/JPY', price: 145.23, change: 0.45 },
                                        { pair: 'USD/CHF', price: 0.8543, change: -0.0018 }
                                    ].map(currency => (
                                        <div key={currency.pair} style={{
                                            padding: '6px',
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: '3px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontWeight: '600', color: textColor }}>{currency.pair}</div>
                                            <div style={{
                                                color: currency.change >= 0 ? '#2E8B57' : '#DC143C',
                                                fontWeight: '600'
                                            }}>
                                                {currency.price}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Commodities */}
                            <div>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: primaryColor
                                }}>
                                    Commodities
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '6px',
                                    fontSize: '11px'
                                }}>
                                    {[
                                        { name: 'Gold', symbol: 'XAU/USD', price: 2034.56, change: 8.23 },
                                        { name: 'Silver', symbol: 'XAG/USD', price: 24.12, change: -0.15 },
                                        { name: 'Oil', symbol: 'WTI', price: 78.34, change: 1.23 }
                                    ].map(commodity => (
                                        <div key={commodity.symbol} style={{
                                            padding: '6px',
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: '3px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontWeight: '600', color: textColor }}>{commodity.symbol}</div>
                                            <div style={{ fontSize: '10px', color: secondaryTextColor }}>{commodity.name}</div>
                                            <div style={{
                                                color: commodity.change >= 0 ? '#2E8B57' : '#DC143C',
                                                fontWeight: '600'
                                            }}>
                                                ${commodity.price}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Economic Calendar */}
                    <div style={{
                        flex: '1 1 50%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        padding: '16px',
                        overflow: 'hidden'
                    }}>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: primaryColor,
                            flex: '0 0 auto'
                        }}>
                            Economic Calendar
                        </h3>

                        <div style={{
                            flex: 1,
                            minHeight: 0,
                            overflow: 'auto'
                        }} className="news-scrollbar">
                            {[
                                { time: '10:00 ET', event: 'Consumer Confidence Index', previous: 102.0, forecast: 104.5, actual: 105.2, impact: 'high' },
                                { time: '11:30 ET', event: 'Fed Chair Powell Speech', impact: 'high' },
                                { time: '14:00 ET', event: 'Pending Home Sales', previous: '-1.5%', forecast: '0.8%', actual: '1.2%', impact: 'medium' },
                                { time: '16:30 ET', event: 'API Crude Oil Stock', previous: '-1.5M', forecast: '-2.1M', impact: 'medium' },
                                { time: 'Tomorrow 08:30', event: 'Initial Jobless Claims', previous: '218K', forecast: '215K', impact: 'high' },
                                { time: 'Tomorrow 10:00', event: 'Manufacturing PMI', previous: '52.5', forecast: '52.8', impact: 'medium' },
                                { time: 'Tomorrow 14:00', event: 'FOMC Meeting Minutes', impact: 'high' }
                            ].map((item, index) => (
                                <div key={index} style={{
                                    padding: '8px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '4px',
                                    marginBottom: '6px',
                                    backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: primaryColor }}>{item.time}</span>
                                        {item.impact && (
                                            <span style={{
                                                fontSize: '10px',
                                                color: item.impact === 'high' ? '#DC143C' : item.impact === 'medium' ? '#FFA500' : '#2E8B57',
                                                fontWeight: '600',
                                                padding: '1px 4px',
                                                backgroundColor: theme === 'dark' ?
                                                    (item.impact === 'high' ? 'rgba(220, 20, 60, 0.2)' :
                                                        item.impact === 'medium' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(46, 139, 87, 0.2)') :
                                                    (item.impact === 'high' ? 'rgba(220, 20, 60, 0.1)' :
                                                        item.impact === 'medium' ? 'rgba(255, 165, 0, 0.1)' : 'rgba(46, 139, 87, 0.1)'),
                                                borderRadius: '2px'
                                            }}>
                                                {item.impact.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, marginBottom: '2px' }}>
                                        {item.event}
                                    </div>
                                    {item.previous && (
                                        <div style={{ fontSize: '11px', color: secondaryTextColor }}>
                                            Prev: {item.previous} | Forecast: {item.forecast} {item.actual && `| Actual: ${item.actual}`}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                minHeight: 0
            }}>
                {/* Top: Selected News Detail */}
                <div style={{
                    flex: '1 1 50%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden',
                    borderBottom: `1px solid ${borderColor}`
                }}>
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${borderColor}`,
                        backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {selectedArticle.isBreaking && (
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        color: '#DC143C',
                                        textTransform: 'uppercase',
                                        padding: '2px 6px',
                                        backgroundColor: theme === 'dark' ? 'rgba(220, 20, 60, 0.2)' : 'rgba(220, 20, 60, 0.1)',
                                        borderRadius: '3px'
                                    }}>
                                        Breaking
                                    </span>
                                )}
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: primaryColor
                                }}>
                                    {selectedArticle.source}
                                </span>
                                <span style={{ fontSize: '11px', color: secondaryTextColor }}>
                                    {this.formatTime(selectedArticle.timestamp)}
                                </span>
                                <span style={{
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F3F5',
                                    color: secondaryTextColor
                                }}>
                                    {selectedArticle.category.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon
                                    icon={selectedArticle.sentiment === 'positive' ? 'arrow-up' : selectedArticle.sentiment === 'negative' ? 'arrow-down' : 'minus'}
                                    size={12}
                                    className={`sentiment-${selectedArticle.sentiment}`}
                                />
                                <span style={{ fontSize: '11px', color: secondaryTextColor }}>
                                    Impact: {selectedArticle.impactScore}
                                </span>
                            </div>
                        </div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '15px',
                            fontWeight: '700',
                            color: textColor,
                            lineHeight: '1.3'
                        }}>
                            {selectedArticle.title}
                        </h2>
                    </div>

                    {/* 可滚动的内容区域 */}
                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        padding: '16px',
                        overflow: 'auto'
                    }} className="news-scrollbar">
                        {/* Related Stocks Performance */}
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: primaryColor
                            }}>
                                Related Securities Performance
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '8px',
                                fontSize: '11px'
                            }}>
                                {selectedArticle.tickers.map(ticker => {
                                    const change = (Math.random() - 0.5) * 4;
                                    const price = 100 + Math.random() * 200;
                                    return (
                                        <div key={ticker} style={{
                                            padding: '6px',
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: '4px',
                                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600', color: textColor }}>{ticker}</span>
                                                <span style={{
                                                    color: change >= 0 ? '#2E8B57' : '#DC143C',
                                                    fontWeight: '600'
                                                }}>
                                                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                                </span>
                                            </div>
                                            <div style={{ color: textColor, fontWeight: '600' }}>${price.toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* News Content */}
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: primaryColor
                            }}>
                                Summary
                            </h3>
                            <p style={{
                                margin: '0',
                                fontSize: '12px',
                                color: textColor,
                                lineHeight: '1.5',
                                marginBottom: '12px'
                            }}>
                                {selectedArticle.summary}
                            </p>

                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: primaryColor
                            }}>
                                Full Analysis
                            </h3>
                            <p style={{
                                margin: '0',
                                fontSize: '12px',
                                color: textColor,
                                lineHeight: '1.6',
                                whiteSpace: 'pre-line'
                            }}>
                                {selectedArticle.content}
                            </p>
                        </div>

                        {/* Additional Content to Ensure Scrolling */}
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: primaryColor
                            }}>
                                Market Implications
                            </h3>
                            <p style={{
                                margin: '0',
                                fontSize: '12px',
                                color: textColor,
                                lineHeight: '1.5'
                            }}>
                                This development is expected to influence market sentiment in the {selectedArticle.category} sector.
                                Analysts suggest monitoring key technical levels and volume patterns for confirmation of the trend direction.
                                The {selectedArticle.importance.toLowerCase()} impact rating indicates potential trading opportunities.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom: Market Context & Analysis */}
                <div style={{
                    flex: '1 1 50%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${borderColor}`,
                        backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA',
                        flexShrink: 0
                    }}>
                        <h3 style={{
                            margin: '0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: primaryColor
                        }}>
                            Market Context & Impact Analysis
                        </h3>
                    </div>

                    {/* 可滚动的内容区域 */}
                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        padding: '16px',
                        overflow: 'auto'
                    }} className="news-scrollbar">
                        {/* Market Impact Metrics */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                padding: '8px',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '4px',
                                backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA'
                            }}>
                                <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>Sector Impact</div>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: textColor }}>
                                    {selectedArticle.category === 'stocks' ? 'Technology' :
                                        selectedArticle.category === 'bonds' ? 'Fixed Income' :
                                            selectedArticle.category === 'forex' ? 'Currency Markets' : 'Broad Market'}
                                </div>
                            </div>
                            <div style={{
                                padding: '8px',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '4px',
                                backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA'
                            }}>
                                <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>Time Horizon</div>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: textColor }}>
                                    {selectedArticle.importance === 'high' ? 'Immediate' :
                                        selectedArticle.importance === 'medium' ? 'Short-term' : 'Medium-term'}
                                </div>
                            </div>
                        </div>

                        {/* Key Statistics */}
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: textColor
                            }}>
                                News Statistics
                            </h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                fontSize: '11px'
                            }}>
                                <div style={{ textAlign: 'center', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px' }}>
                                    <div style={{ color: secondaryTextColor }}>Importance</div>
                                    <div style={{
                                        color: selectedArticle.importance === 'high' ? '#DC143C' :
                                            selectedArticle.importance === 'medium' ? '#FFA500' : '#2E8B57',
                                        fontWeight: '600'
                                    }}>
                                        {selectedArticle.importance.toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px' }}>
                                    <div style={{ color: secondaryTextColor }}>Sentiment</div>
                                    <div style={{
                                        color: selectedArticle.sentiment === 'positive' ? '#2E8B57' :
                                            selectedArticle.sentiment === 'negative' ? '#DC143C' : '#8F99A8',
                                        fontWeight: '600'
                                    }}>
                                        {selectedArticle.sentiment.toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px' }}>
                                    <div style={{ color: secondaryTextColor }}>Read Time</div>
                                    <div style={{ color: textColor, fontWeight: '600' }}>{selectedArticle.readTime}m</div>
                                </div>
                            </div>
                        </div>

                        {/* Related News */}
                        <div>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: textColor
                            }}>
                                Related Stories
                            </h4>
                            <div style={{ fontSize: '11px' }}>
                                {this.newsData
                                    .filter(article =>
                                        article.category === selectedArticle.category &&
                                        article.id !== selectedArticle.id
                                    )
                                    .slice(0, 5)
                                    .map(article => (
                                        <div key={article.id} style={{
                                            padding: '8px',
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: '4px',
                                            marginBottom: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#F8F9FA'
                                        }}
                                            onClick={() => this.handleNewsSelect(article.id)}
                                        >
                                            <div style={{ fontWeight: '600', color: textColor, marginBottom: '4px' }}>
                                                {article.title}
                                            </div>
                                            <div style={{ color: secondaryTextColor, fontSize: '10px' }}>
                                                {article.source} • {this.formatTime(article.timestamp)} • Impact: {article.impactScore}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Additional Analysis Content */}
                        <div style={{ marginTop: '16px' }}>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: textColor
                            }}>
                                Technical Analysis
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '11px',
                                color: secondaryTextColor,
                                lineHeight: '1.4'
                            }}>
                                Key support and resistance levels should be monitored. Volume analysis suggests
                                {selectedArticle.sentiment === 'positive' ? ' bullish momentum' :
                                    selectedArticle.sentiment === 'negative' ? ' bearish pressure' : ' neutral consolidation'}
                                in the near term.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { containerHeight, theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        overflowManager.setOverflow('hidden');
        return (
            <div
                ref={this.containerRef}
                style={{
                    height: containerHeight > 0 ? `${containerHeight}px` : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor,
                    color: textColor,
                    overflow: 'hidden'
                }}
            >
                <style>{this.applyGlobalTheme()}</style>

                {/* Control Bar */}
                {this.renderControlBar()}

                {/* Source Filter */}
                {this.renderSourceFilter()}

                {/* Main Content Area - 3 Column Layout */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden'
                }}>
                    {/* Left: News List (33% width) */}
                    <div style={{
                        width: '33%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: `1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'}`
                    }}>
                        {this.renderNewsList()}
                    </div>

                    {/* Right: News Detail (67% width) */}
                    <div style={{
                        width: '67%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {this.renderNewsDetail()}
                    </div>
                </div>
            </div>
        );
    }
}

export default NewsPage;