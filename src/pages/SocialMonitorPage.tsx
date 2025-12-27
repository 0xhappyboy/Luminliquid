import React from "react";
import {
    Menu,
    MenuItem,
    Icon,
    Button,
    Switch
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";

interface SocialMonitorPageIndexProps {
    children?: React.ReactNode;
}

interface SocialMonitorPageIndexState {
    theme: 'dark' | 'light';
    containerHeight: number;
    selectedPlatform: string;
    selectedChannel: string;
    expandedPlatforms: Set<string>;
    isRightDrawerCollapsed: boolean;
    currentPage: number;
    tableHeaderFixed: boolean;
    selectedFilter: string;
    expandedFilter: string | null;
    autoRefresh: boolean;
    monitoringStatus: 'active' | 'paused';
}

interface SocialMessage {
    id: string;
    platform: string;
    channel: string;
    author: string;
    content: string;
    timestamp: Date;
    sentiment: 'positive' | 'negative' | 'neutral';
    engagement: number;
    url: string;
    keywords: string[];
}

class SocialMonitorPageIndex extends React.Component<SocialMonitorPageIndexProps, SocialMonitorPageIndexState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef: React.RefObject<HTMLDivElement | null>;
    private tableContainerRef: React.RefObject<HTMLDivElement | null>;
    private resizeObserver: ResizeObserver | null = null;
    private refreshInterval: NodeJS.Timeout | null = null;

    private platformData = [
        {
            key: 'telegram',
            icon: 'mobile-phone',
            label: 'Telegram',
            color: '#0088CC',
            children: [
                { key: 'crypto-signals', label: 'Crypto Signals', members: '45.2K' },
                { key: 'trading-view', label: 'Trading View', members: '128.7K' },
                { key: 'defi-talks', label: 'DeFi Talks', members: '89.3K' },
                { key: 'whale-alerts', label: 'Whale Alerts', members: '156.1K' }
            ]
        },
        {
            key: 'discord',
            icon: 'people',
            label: 'Discord',
            color: '#5865F2',
            children: [
                { key: 'trading-community', label: 'Trading Community', members: '12.4K' },
                { key: 'crypto-alpha', label: 'Crypto Alpha', members: '8.7K' },
                { key: 'nft-discussion', label: 'NFT Discussion', members: '23.1K' },
                { key: 'web3-dev', label: 'Web3 Development', members: '15.8K' }
            ]
        },
        {
            key: 'twitter',
            icon: 'citation',
            label: 'Twitter',
            color: '#1DA1F2',
            children: [
                { key: 'crypto-influencers', label: 'Crypto Influencers', followers: '2.3M' },
                { key: 'project-announcements', label: 'Project Announcements', followers: '1.8M' },
                { key: 'market-news', label: 'Market News', followers: '3.1M' },
                { key: 'technical-analysis', label: 'Technical Analysis', followers: '1.2M' }
            ]
        },
        {
            key: 'reddit',
            icon: 'social-media',
            label: 'Reddit',
            color: '#FF4500',
            children: [
                { key: 'cryptocurrency', label: 'r/Cryptocurrency', members: '6.2M' },
                { key: 'defi', label: 'r/DeFi', members: '1.8M' },
                { key: 'crypto-markets', label: 'r/CryptoMarkets', members: '2.1M' },
                { key: 'eth-trader', label: 'r/ethTrader', members: '1.5M' }
            ]
        }
    ];

    private filterOptions = [
        { key: 'all', label: 'All Messages', icon: 'feed' },
        { key: 'positive', label: 'Positive Sentiment', icon: 'thumbs-up' },
        { key: 'negative', label: 'Negative Sentiment', icon: 'thumbs-down' },
        { key: 'high-engagement', label: 'High Engagement', icon: 'flash' },
        { key: 'keyword-alerts', label: 'Keyword Alerts', icon: 'warning-sign' }
    ];

    private keywordGroups = [
        {
            key: 'trading',
            label: 'Trading Terms',
            keywords: ['bullish', 'bearish', 'breakout', 'support', 'resistance', 'pump', 'dump']
        },
        {
            key: 'defi',
            label: 'DeFi Terms',
            keywords: ['yield', 'liquidity', 'staking', 'farming', 'APY', 'TVL', 'governance']
        },
        {
            key: 'nft',
            label: 'NFT Terms',
            keywords: ['mint', 'drop', 'floor price', 'rarity', 'whitelist', 'gas war']
        }
    ];

    private generateSocialData = (): SocialMessage[] => {
        const platforms = ['telegram', 'discord', 'twitter', 'reddit'];
        const channels = [
            'Crypto Signals', 'Trading Community', 'Crypto Influencers', 'r/Cryptocurrency',
            'Whale Alerts', 'Crypto Alpha', 'Project Announcements', 'r/DeFi'
        ];
        const authors = [
            'CryptoWhale', 'TradingPro', 'DeFiExpert', 'NFTGuru',
            'MarketAnalyst', 'BlockchainDev', 'AlphaHunter', 'SignalMaster'
        ];
        const contents = [
            'Bullish breakout confirmed on BTC! Target $50K incoming 🚀',
            'New DeFi protocol launching with 500% APY farming opportunities',
            'Major partnership announcement coming this week for $ETH',
            'Market sentiment turning negative, expect correction soon 📉',
            'NFT project minting today - potential 10x opportunity',
            'Whale just bought 5,000 ETH - bullish signal for market',
            'Technical analysis shows strong support at current levels',
            'Regulatory news causing FUD, but this is a buying opportunity'
        ];
        const keywords = [
            ['bullish', 'breakout', 'BTC'],
            ['DeFi', 'APY', 'farming'],
            ['partnership', 'ETH'],
            ['negative', 'correction'],
            ['NFT', 'mint', 'opportunity'],
            ['whale', 'ETH', 'bullish'],
            ['technical analysis', 'support'],
            ['regulatory', 'FUD', 'buying']
        ];

        const data: SocialMessage[] = [];
        const now = new Date();

        for (let i = 0; i < 500; i++) {
            const platformIndex = i % platforms.length;
            const sentimentIndex = i % 3;
            const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];

            data.push({
                id: `msg-${i}`,
                platform: platforms[platformIndex],
                channel: channels[i % channels.length],
                author: authors[i % authors.length],
                content: contents[i % contents.length],
                timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
                sentiment: sentiments[sentimentIndex],
                engagement: Math.floor(Math.random() * 10000),
                url: `https://${platforms[platformIndex]}.com/message/${i}`,
                keywords: keywords[i % keywords.length]
            });
        }

        return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    private socialData: SocialMessage[] = this.generateSocialData();

    constructor(props: SocialMonitorPageIndexProps) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement | null>();
        this.tableContainerRef = React.createRef<HTMLDivElement | null>();
        this.state = {
            theme: themeManager.getTheme(),
            containerHeight: 0,
            selectedPlatform: 'telegram',
            selectedChannel: 'crypto-signals',
            expandedPlatforms: new Set(['telegram']),
            isRightDrawerCollapsed: false,
            currentPage: 0,
            tableHeaderFixed: false,
            selectedFilter: 'all',
            expandedFilter: null,
            autoRefresh: true,
            monitoringStatus: 'active'
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

    private handleTableScroll = (): void => {
        if (this.tableContainerRef.current) {
            const scrollTop = this.tableContainerRef.current.scrollTop;
            this.setState({ tableHeaderFixed: scrollTop > 50 });
        }
    };

    private toggleAutoRefresh = () => {
        this.setState(prevState => {
            const newAutoRefresh = !prevState.autoRefresh;

            if (newAutoRefresh && !this.refreshInterval) {
                this.refreshInterval = setInterval(() => {
                    // Simulate new messages
                    this.forceUpdate();
                }, 10000);
            } else if (!newAutoRefresh && this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }

            return { autoRefresh: newAutoRefresh };
        });
    };

    private toggleMonitoring = () => {
        this.setState(prevState => ({
            monitoringStatus: prevState.monitoringStatus === 'active' ? 'paused' : 'active'
        }));
    };

    componentDidMount() {
        this.updateContainerHeight();
        window.addEventListener('resize', this.debouncedResize);
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);

        if (this.containerRef.current?.parentElement) {
            this.resizeObserver = new ResizeObserver(this.updateContainerHeight);
            this.resizeObserver.observe(this.containerRef.current.parentElement);
        }

        // Start auto-refresh
        this.refreshInterval = setInterval(() => {
            if (this.state.autoRefresh && this.state.monitoringStatus === 'active') {
                this.forceUpdate();
            }
        }, 10000);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedResize);
        if (this.unsubscribe) this.unsubscribe();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
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
      .social-monitor-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .social-monitor-scrollbar::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        border-radius: 3px;
      }
      
      .social-monitor-scrollbar::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 3px;
      }
      
      .social-monitor-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
      }
      
      .social-menu-item:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .social-menu-item.selected {
        background-color: ${selectedBgColor} !important;
        color: ${theme === 'dark' ? '#FFFFFF' : '#182026'} !important;
        font-weight: 600 !important;
      }
      
      .platform-header {
        transition: all 0.2s ease;
        cursor: pointer;
      }
      
      .platform-header:hover {
        background-color: ${hoverBgColor} !important;
      }

      .sentiment-positive {
        color: #2E8B57 !important;
      }

      .sentiment-negative {
        color: #DC143C !important;
      }

      .sentiment-neutral {
        color: ${theme === 'dark' ? '#8F99A8' : '#5F6B7C'} !important;
      }

      .fixed-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        box-shadow: 0 2px 4px ${theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
      }
    `;
    };

    private handlePlatformToggle = (platformKey: string) => {
        this.setState(prevState => {
            const newExpandedPlatforms = new Set(prevState.expandedPlatforms);
            if (newExpandedPlatforms.has(platformKey)) {
                newExpandedPlatforms.delete(platformKey);
            } else {
                newExpandedPlatforms.add(platformKey);
            }
            return { expandedPlatforms: newExpandedPlatforms };
        });
    };

    private handleChannelSelect = (platformKey: string, channelKey: string) => {
        this.setState({
            selectedPlatform: platformKey,
            selectedChannel: channelKey
        });
    };

    private handleFilterSelect = (filterKey: string) => {
        this.setState({ selectedFilter: filterKey });
    };

    private toggleRightDrawer = () => {
        this.setState(prevState => ({
            isRightDrawerCollapsed: !prevState.isRightDrawerCollapsed
        }));
    };

    private handlePageChange = (newPage: number) => {
        this.setState({ currentPage: newPage });
    };

    private formatTime = (timestamp: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return timestamp.toLocaleDateString();
    };

    private getPlatformColor = (platformKey: string): string => {
        const platform = this.platformData.find(p => p.key === platformKey);
        return platform?.color || '#A7B6C2';
    };

    private getFilteredData = (): SocialMessage[] => {
        const { selectedFilter, selectedPlatform, selectedChannel } = this.state;

        let filtered = this.socialData.filter(msg =>
            msg.platform === selectedPlatform &&
            this.getChannelKey(msg.channel) === selectedChannel
        );

        switch (selectedFilter) {
            case 'positive':
                filtered = filtered.filter(msg => msg.sentiment === 'positive');
                break;
            case 'negative':
                filtered = filtered.filter(msg => msg.sentiment === 'negative');
                break;
            case 'high-engagement':
                filtered = filtered.filter(msg => msg.engagement > 1000);
                break;
            case 'keyword-alerts':
                filtered = filtered.filter(msg =>
                    msg.keywords.some(keyword =>
                        ['pump', 'dump', 'whale', 'partnership', 'launch'].includes(keyword.toLowerCase())
                    )
                );
                break;
        }

        return filtered;
    };

    private getChannelKey = (channelName: string): string => {
        // Convert channel display name to key
        return channelName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    };

    private renderRightDrawer = () => {
        const { theme, isRightDrawerCollapsed, selectedFilter } = this.state;
        const drawerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

        if (isRightDrawerCollapsed) {
            return (
                <div style={{
                    width: '60px',
                    backgroundColor: drawerBg,
                    borderLeft: `1px solid ${borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px 8px',
                    flexShrink: 0
                }}>
                    <Button
                        minimal
                        icon="double-chevron-left"
                        onClick={this.toggleRightDrawer}
                        style={{
                            color: textColor,
                            marginBottom: '20px'
                        }}
                        title="Expand Settings"
                    />
                    {this.filterOptions.map(filter => (
                        <div
                            key={filter.key}
                            style={{
                                padding: '12px 8px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                backgroundColor: selectedFilter === filter.key ?
                                    (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent'
                            }}
                            title={filter.label}
                        >
                            <Icon
                                icon={filter.icon as any}
                                size={16}
                                color={selectedFilter === filter.key ? this.getPlatformColor('telegram') : textColor}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div style={{
                width: '280px',
                backgroundColor: drawerBg,
                borderLeft: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                {/* Drawer Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: textColor
                    }}>
                        Filters & Settings
                    </div>
                    <Button
                        minimal
                        icon="double-chevron-right"
                        onClick={this.toggleRightDrawer}
                        style={{ color: textColor }}
                        title="Collapse Settings"
                    />
                </div>

                {/* Monitoring Controls */}
                <div style={{
                    padding: '20px',
                    borderBottom: `1px solid ${borderColor}`
                }}>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                                Auto Refresh
                            </span>
                            <Switch
                                checked={this.state.autoRefresh}
                                onChange={this.toggleAutoRefresh}
                                style={{ margin: 0 }}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                                Monitoring
                            </span>
                            <Switch
                                checked={this.state.monitoringStatus === 'active'}
                                onChange={this.toggleMonitoring}
                                style={{ margin: 0 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Options */}
                <div style={{
                    padding: '20px',
                    borderBottom: `1px solid ${borderColor}`,
                    flex: 1,
                    overflowY: 'auto'
                }} className="social-monitor-scrollbar">
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: textColor,
                            marginBottom: '12px'
                        }}>
                            Message Filters
                        </div>
                        {this.filterOptions.map(filter => (
                            <div
                                key={filter.key}
                                onClick={() => this.handleFilterSelect(filter.key)}
                                className={`social-menu-item ${selectedFilter === filter.key ? 'selected' : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    marginBottom: '4px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Icon
                                    icon={filter.icon as any}
                                    size={14}
                                    color={selectedFilter === filter.key ? this.getPlatformColor('telegram') : textColor}
                                />
                                <span style={{ fontSize: '13px' }}>{filter.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Keyword Groups */}
                    <div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: textColor,
                            marginBottom: '12px'
                        }}>
                            Keyword Alerts
                        </div>
                        {this.keywordGroups.map(group => (
                            <div key={group.key} style={{ marginBottom: '16px' }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: textColor,
                                    marginBottom: '8px'
                                }}>
                                    {group.label}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px'
                                }}>
                                    {group.keywords.map(keyword => (
                                        <span
                                            key={keyword}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                color: textColor
                                            }}
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    private renderPlatformMenu = () => {
        const { theme, selectedPlatform, selectedChannel, expandedPlatforms } = this.state;
        const sidebarBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

        return (
            <div style={{
                width: '280px',
                backgroundColor: sidebarBg,
                borderRight: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: `1px solid ${borderColor}`,
                    flexShrink: 0
                }}>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: textColor,
                        marginBottom: '4px'
                    }}>
                        Social Monitor
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: theme === 'dark' ? '#8F99A8' : '#5F6B7C'
                    }}>
                        Real-time social media tracking
                    </div>
                </div>

                {/* Platform Menu */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 0'
                }} className="social-monitor-scrollbar">
                    {this.platformData.map(platform => {
                        const isExpanded = expandedPlatforms.has(platform.key);
                        const isSelected = selectedPlatform === platform.key;

                        return (
                            <div key={platform.key} style={{ marginBottom: '8px' }}>
                                {/* Platform Header */}
                                <div
                                    onClick={() => this.handlePlatformToggle(platform.key)}
                                    className="platform-header"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 20px',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ?
                                            (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Icon
                                            icon={platform.icon as any}
                                            size={16}
                                            color={platform.color}
                                        />
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: textColor
                                        }}>
                                            {platform.label}
                                        </span>
                                    </div>
                                    <Icon
                                        icon={isExpanded ? "chevron-down" : "chevron-right"}
                                        size={12}
                                        color={textColor}
                                    />
                                </div>

                                {/* Channel List */}
                                {isExpanded && platform.children.map(channel => (
                                    <div
                                        key={channel.key}
                                        onClick={() => this.handleChannelSelect(platform.key, channel.key)}
                                        className={`social-menu-item ${selectedChannel === channel.key ? 'selected' : ''}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 20px 10px 48px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span>{channel.label}</span>
                                        <span style={{
                                            fontSize: '11px',
                                            color: theme === 'dark' ? '#8F99A8' : '#5F6B7C'
                                        }}>
                                            {channel.members || channel.followers}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: `1px solid ${borderColor}`,
                    fontSize: '11px',
                    color: theme === 'dark' ? '#8F99A8' : '#5F6B7C',
                    flexShrink: 0
                }}>
                    <div>Monitoring: {this.state.monitoringStatus === 'active' ? 'ACTIVE' : 'PAUSED'}</div>
                    <div>Last update: {new Date().toLocaleTimeString()}</div>
                </div>
            </div>
        );
    };

    private renderMessageTable = () => {
        const { theme, currentPage, tableHeaderFixed, selectedFilter } = this.state;
        const itemsPerPage = 50;
        const filteredData = this.getFilteredData();
        const startIndex = currentPage * itemsPerPage;
        const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);

        const tableBg = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const headerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const rowHoverBg = theme === 'dark' ? '#2D323D' : '#F8F9FA';

        const headerClass = tableHeaderFixed ? 'fixed-header' : '';

        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24'; // 添加这行
        return (
            <div className="table-container">
                {/* Stats Bar */}
                <div style={{
                    padding: '12px 20px',
                    borderBottom: `1px solid ${borderColor}`,
                    backgroundColor: headerBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: theme === 'dark' ? '#8F99A8' : '#5F6B7C' }}>
                                Total Messages:
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: theme === 'dark' ? '#E8EAED' : '#1A1D24' }}>
                                {filteredData.length.toLocaleString()}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: theme === 'dark' ? '#8F99A8' : '#5F6B7C' }}>
                                Active Filter:
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: this.getPlatformColor('telegram') }}>
                                {this.filterOptions.find(f => f.key === selectedFilter)?.label}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Switch
                            checked={this.state.autoRefresh}
                            onChange={this.toggleAutoRefresh}
                            label="Auto Refresh"
                            style={{ margin: 0 }}
                        />
                        <Button
                            small
                            icon={this.state.monitoringStatus === 'active' ? 'pause' : 'play'}
                            text={this.state.monitoringStatus === 'active' ? 'Pause' : 'Resume'}
                            onClick={this.toggleMonitoring}
                        />
                    </div>
                </div>

                {/* Table */}
                <div
                    ref={this.tableContainerRef}
                    onScroll={this.handleTableScroll}
                    className="table-scroll-container social-monitor-scrollbar"
                    style={{ flex: 1 }}
                >
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '13px'
                    }}>
                        <thead className={headerClass}>
                            <tr style={{
                                backgroundColor: headerBg,
                                borderBottom: `2px solid ${borderColor}`
                            }}>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: `1px solid ${borderColor}`,
                                    width: '120px'
                                }}>Platform</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: `1px solid ${borderColor}`,
                                    width: '150px'
                                }}>Author</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: `1px solid ${borderColor}`
                                }}>Message</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: `1px solid ${borderColor}`,
                                    width: '100px'
                                }}>Sentiment</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: `1px solid ${borderColor}`,
                                    width: '100px'
                                }}>Engagement</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: `1px solid ${borderColor}`,
                                    width: '120px'
                                }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item, index) => (
                                <tr
                                    key={item.id}
                                    style={{
                                        borderBottom: `1px solid ${borderColor}`,
                                        height: '60px',
                                        transition: 'background-color 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = rowHoverBg;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = tableBg;
                                    }}
                                    onClick={() => window.open(item.url, '_blank')}
                                >
                                    <td style={{ padding: '8px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Icon
                                                icon={item.platform === 'telegram' ? 'mobile-phone' :
                                                    item.platform === 'discord' ? 'people' :
                                                        item.platform === 'twitter' ? 'citation' : 'social-media'}
                                                size={14}
                                                color={this.getPlatformColor(item.platform)}
                                            />
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {item.platform}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px 16px', fontWeight: '600' }}>
                                        {item.author}
                                    </td>
                                    <td style={{ padding: '8px 16px' }}>
                                        <div style={{ lineHeight: '1.4' }}>
                                            {item.content}
                                            {item.keywords.length > 0 && (
                                                <div style={{ marginTop: '4px' }}>
                                                    {item.keywords.map(keyword => (
                                                        <span
                                                            key={keyword}
                                                            style={{
                                                                display: 'inline-block',
                                                                padding: '2px 6px',
                                                                backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                                                borderRadius: '8px',
                                                                fontSize: '10px',
                                                                marginRight: '4px',
                                                                color: textColor
                                                            }}
                                                        >
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                                        <Icon
                                            icon={item.sentiment === 'positive' ? 'thumbs-up' :
                                                item.sentiment === 'negative' ? 'thumbs-down' : 'minus'}
                                            size={12}
                                            className={`sentiment-${item.sentiment}`}
                                        />
                                    </td>
                                    <td style={{
                                        padding: '8px 16px',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        fontFamily: 'monospace'
                                    }}>
                                        {item.engagement.toLocaleString()}
                                    </td>
                                    <td style={{
                                        padding: '8px 16px',
                                        textAlign: 'right',
                                        fontSize: '12px',
                                        color: theme === 'dark' ? '#8F99A8' : '#5F6B7C'
                                    }}>
                                        {this.formatTime(item.timestamp)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        padding: '12px 20px',
                        borderTop: `1px solid ${borderColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: headerBg,
                        flexShrink: 0
                    }}>
                        <div style={{ fontSize: '13px', color: theme === 'dark' ? '#8F99A8' : '#5F6B7C' }}>
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Button
                                small
                                minimal
                                icon="chevron-left"
                                onClick={() => this.handlePageChange(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                            />
                            <span style={{ fontSize: '13px', minWidth: '80px', textAlign: 'center' }}>
                                Page {currentPage + 1} of {totalPages}
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

    render() {
        const { containerHeight, theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';

        return (
            <div
                ref={this.containerRef}
                style={{
                    height: containerHeight > 0 ? `${containerHeight}px` : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor,
                    overflow: 'hidden'
                }}
            >
                <style>{this.applyGlobalTheme()}</style>

                <div style={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    {/* Left Platform Menu */}
                    {this.renderPlatformMenu()}

                    {/* Main Content */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        overflow: 'hidden'
                    }}>
                        {this.renderMessageTable()}
                    </div>

                    {/* Right Settings Drawer */}
                    {this.renderRightDrawer()}
                </div>
            </div>
        );
    }
}

export default SocialMonitorPageIndex;