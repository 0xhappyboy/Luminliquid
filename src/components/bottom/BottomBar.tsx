import React from 'react';
import { InputGroup, Button, Popover, Menu, MenuItem, Classes } from '@blueprintjs/core';
import { themeManager } from '../../globals/theme/ThemeManager';
import { useNavigate } from 'react-router-dom';
import { withRouter } from '../../WithRouter';
import { CexType } from '../../types';

interface BottomBarState {
    theme: 'dark' | 'light';
    currentTime: string;
    marqueeText: string;
    windowWidth: number;
    isSearchFocused: boolean;
    searchValue: string;
    activeSearchTab: string;
    networkSpeed: 'excellent' | 'good' | 'fair' | 'poor';
    hotTokens: TokenInfo[];
    latestTokens: TokenInfo[];
    loading: boolean;
    error: string | null;
}

interface TokenInfo {
    symbol: string;
    name: string;
    price?: string;
    change24h?: string;
}

interface BinanceTicker {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    lastPrice: string;
    volume: string;
    quoteVolume: string;
}

interface BottomBarProps {
    navigate?: (path: string, options?: any) => void;
}

class BottomBar extends React.Component<BottomBarProps, BottomBarState> {
    private timer: NodeJS.Timeout | null = null;
    private unsubscribe: (() => void) | null = null;
    private networkTimer: NodeJS.Timeout | null = null;
    private dataFetchTimer: NodeJS.Timeout | null = null;
    private searchInputRef: React.RefObject<HTMLInputElement | null> = React.createRef();
    private searchPopupRef: React.RefObject<HTMLDivElement | null> = React.createRef();

    private leftMenuItems = [
        {
            key: 'home',
            label: 'home',
            children: [
                { key: 'dashboard', label: 'dashboard' },
                { key: 'overview', label: 'overview' },
                { key: 'analytics', label: 'analytics' },
                { key: 'reports', label: 'reports' }
            ]
        },
        {
            key: 'self-select',
            label: 'self-select',
            children: [
                { key: 'add-stock', label: 'add-stock' },
                { key: 'manage', label: 'manage' },
                { key: 'favorites', label: 'favorites' },
                { key: 'watchlist', label: 'watchlist' }
            ]
        },
        {
            key: 'market',
            label: 'market',
            children: [
                { key: 'stock-market', label: 'stock-market' },
                { key: 'futures', label: 'futures' },
                { key: 'forex', label: 'forex' },
                { key: 'crypto', label: 'crypto' },
                { key: 'indices', label: 'indices' }
            ]
        },
        {
            key: 'news',
            label: 'news',
            children: [
                { key: 'latest-news', label: 'latest-news' },
                { key: 'announcements', label: 'announcements' },
                { key: 'earnings', label: 'earnings' },
                { key: 'economic-calendar', label: 'economic-calendar' }
            ]
        },
        {
            key: 'trade',
            label: 'trade',
            children: [
                { key: 'buy', label: 'buy' },
                { key: 'sell', label: 'sell' },
                { key: 'orders', label: 'orders' },
                { key: 'history', label: 'history' },
                { key: 'alerts', label: 'alerts' }
            ]
        },
        {
            key: 'assets',
            label: 'assets',
            children: [
                { key: 'balance', label: 'balance' },
                { key: 'positions', label: 'positions' },
                { key: 'transactions', label: 'transactions' },
                { key: 'performance', label: 'performance' }
            ]
        },
        {
            key: 'settings',
            label: 'settings',
            children: [
                { key: 'preferences', label: 'preferences' },
                { key: 'system', label: 'system' },
                { key: 'account', label: 'account' },
                { key: 'notifications', label: 'notifications' },
                { key: 'security', label: 'security' }
            ]
        }
    ];

    constructor(props: BottomBarProps) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            currentTime: new Date().toLocaleTimeString(),
            marqueeText: '连接Binance实时数据...',
            windowWidth: window.innerWidth,
            isSearchFocused: false,
            searchValue: '',
            activeSearchTab: 'hot',
            networkSpeed: 'good',
            hotTokens: [],
            latestTokens: [],
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.unsubscribe = themeManager.subscribe((theme) => {
            this.setState({ theme });
        });
        this.timer = setInterval(() => {
            this.setState({
                currentTime: new Date().toLocaleTimeString()
            });
        }, 1000);
        this.networkTimer = setInterval(this.simulateNetworkChange, 5000);
        this.dataFetchTimer = setInterval(this.fetchMarketData, 15000);
        document.addEventListener('mousedown', this.handleClickOutside);
        this.fetchMarketData();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.unsubscribe) this.unsubscribe();
        if (this.timer) clearInterval(this.timer);
        if (this.networkTimer) clearInterval(this.networkTimer);
        if (this.dataFetchTimer) clearInterval(this.dataFetchTimer);
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    fetchMarketData = async () => {
        try {
            const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            const data: BinanceTicker[] = await response.json();
            const hotTokens = data
                .filter(ticker => {
                    return ticker.symbol.endsWith('USDT') &&
                        !ticker.symbol.includes('UP') &&
                        !ticker.symbol.includes('DOWN');
                })
                .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
                .slice(0, 16)
                .map(ticker => this.convertToTokenInfo(ticker));
            const latestTokens = data
                .filter(ticker => {
                    return ticker.symbol.endsWith('USDT') &&
                        !ticker.symbol.includes('UP') &&
                        !ticker.symbol.includes('DOWN');
                })
                .sort((a, b) => b.symbol.localeCompare(a.symbol))
                .slice(0, 16)
                .map(ticker => this.convertToTokenInfo(ticker));
            const topGainers = data
                .filter(ticker => ticker.symbol.endsWith('USDT'))
                .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
                .slice(0, 5);
            const marqueeText = topGainers.map(ticker => {
                const symbol = ticker.symbol.replace('USDT', '');
                const change = parseFloat(ticker.priceChangePercent);
                return `${symbol}: $${parseFloat(ticker.lastPrice).toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`;
            }).join(' | ');
            this.setState({
                hotTokens,
                latestTokens,
                marqueeText: `热门代币: ${marqueeText}`,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('获取Binance数据失败:', error);
            this.setState({
                error: '无法获取市场数据',
                loading: false
            });
        }
    };

    convertToTokenInfo = (ticker: BinanceTicker): TokenInfo => {
        const baseSymbol = ticker.symbol.replace('USDT', '');
        const change = parseFloat(ticker.priceChangePercent);
        return {
            symbol: `${baseSymbol}/USDT`,
            name: baseSymbol,
            price: `$${parseFloat(ticker.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
            change24h: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
        };
    };

    private simulateNetworkChange = () => {
        const speeds: ('excellent' | 'good' | 'fair' | 'poor')[] = ['excellent', 'good', 'fair', 'poor'];
        const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];
        this.setState({ networkSpeed: randomSpeed });
    };

    handleSettingsClick = () => {
    };

    handleResize = () => {
        this.setState({ windowWidth: window.innerWidth });
    };

    handleClickOutside = (event: MouseEvent) => {
        if (
            this.searchInputRef.current &&
            !this.searchInputRef.current.contains(event.target as Node) &&
            this.searchPopupRef.current &&
            !this.searchPopupRef.current.contains(event.target as Node)
        ) {
            this.setState({ isSearchFocused: false });
        }
    };

    getCurrentTheme = (): 'dark' | 'light' => {
        return document.documentElement.classList.contains('bp4-dark') ? 'dark' : 'light';
    };

    getVisibleMenuItems = () => {
        const { windowWidth } = this.state;
        const middleWidth = windowWidth * 2 / 4;
        const rightWidth = windowWidth * 1 / 4;
        const availableWidth = windowWidth - middleWidth - rightWidth - 50;
        const itemWidth = 45;
        const maxVisibleItems = Math.floor(availableWidth / itemWidth);
        return this.leftMenuItems.slice(0, Math.max(2, Math.min(7, maxVisibleItems)));
    };

    renderDropdownMenu = (items: any[]) => {
        const { theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#1C2127' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
        return (
            <Menu
                style={{
                    minWidth: '120px',
                    fontSize: '12px',
                    backgroundColor: backgroundColor,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    userSelect: 'none'
                }}
            >
                {items.map((item) => (
                    <MenuItem
                        key={item.key}
                        text={item.label}
                        style={{
                            fontSize: '12px',
                            padding: '4px 12px',
                            color: textColor,
                            backgroundColor: backgroundColor
                        }}
                        className={theme === 'dark' ? Classes.DARK : ''}
                        onClick={() => this.handleMenuItemClick(item.key)}
                    />
                ))}
            </Menu>
        );
    };

    handleMenuItemClick = (menuKey: string) => {
        console.log(`Menu item clicked: ${menuKey}`);
    };

    handleSearchFocus = () => {
        this.setState({ isSearchFocused: true });
    };

    handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchValue: event.target.value });
    };

    handleSearchTabChange = (tabId: string) => {
        this.setState({ activeSearchTab: tabId });
    };

    private handleTokenSelect = (token: string) => {
        this.setState({ searchValue: token });
        const cexType = CexType.Binance;
        this.props.navigate(`/trade/${cexType}/${token}`);
    };

    renderNetworkIndicator = () => {
        const { theme, networkSpeed } = this.state;
        const iconColor = theme === 'dark' ? '#8A9BA8' : '#5C7080';
        const activeColor = theme === 'dark' ? '#15B371' : '#0A6640';

        let signalIcon;
        switch (networkSpeed) {
            case 'excellent':
                signalIcon = '📶';
                break;
            case 'good':
                signalIcon = '📶';
                break;
            case 'fair':
                signalIcon = '📶';
                break;
            case 'poor':
                signalIcon = '📶';
                break;
            default:
                signalIcon = '📶';
        }

        return (
            <div
                style={{
                    fontSize: '14px',
                    cursor: 'default',
                    color: networkSpeed === 'excellent' ? activeColor : iconColor,
                    transition: 'color 0.3s ease',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}
                title={`Network: ${networkSpeed}`}
            >
                {signalIcon}
            </div>
        );
    };

    renderSettingsIcon = () => {
        const { theme } = this.state;
        const iconColor = theme === 'dark' ? '#8A9BA8' : '#5C7080';
        const hoverColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        return (
            <div
                style={{
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: iconColor,
                    transition: 'color 0.2s ease, transform 0.2s ease',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = hoverColor;
                    e.currentTarget.style.transform = 'rotate(30deg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = iconColor;
                    e.currentTarget.style.transform = 'rotate(0deg)';
                }}
                onClick={this.handleSettingsClick}
                title="Settings"
            >
                ⚙️
            </div>
        );
    };

    renderTokenLogo = (symbol: string) => {
        const color = '#394B59';
        return (
            <div
                style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    flexShrink: 0,
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    userSelect: 'none'
                }}
            >
                {symbol.split('/')[0].substring(0, 2)}
            </div>
        );
    };

    renderCustomTabs = () => {
        const { theme, activeSearchTab } = this.state;
        const activeBackgroundColor = theme === 'dark' ? '#394B59' : '#CED9E0';
        const activeTextColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const inactiveBackgroundColor = 'transparent';
        const inactiveTextColor = theme === 'dark' ? '#8A9BA8' : '#5C7080';
        const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
        return (
            <div style={{
                display: 'flex',
                height: '30px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: theme === 'dark' ? '#2F343C' : '#F8F9FA',
                flexShrink: 0,
                userSelect: 'none'
            }}>
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: activeSearchTab === 'hot' ? activeBackgroundColor : inactiveBackgroundColor,
                        color: activeSearchTab === 'hot' ? activeTextColor : inactiveTextColor,
                        borderBottom: activeSearchTab === 'hot' ? `2px solid ${theme === 'dark' ? '#8A9BA8' : '#394B59'}` : 'none',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => this.handleSearchTabChange('hot')}
                >
                    热门代币
                </div>
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: activeSearchTab === 'latest' ? activeBackgroundColor : inactiveBackgroundColor,
                        color: activeSearchTab === 'latest' ? activeTextColor : inactiveTextColor,
                        borderBottom: activeSearchTab === 'latest' ? `2px solid ${theme === 'dark' ? '#8A9BA8' : '#394B59'}` : 'none',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => this.handleSearchTabChange('latest')}
                >
                    最新代币
                </div>
            </div>
        );
    };

    renderSearchPopup = () => {
        const { theme, activeSearchTab, hotTokens, latestTokens, loading, error } = this.state;
        const backgroundColor = theme === 'dark' ? '#1C2127' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
        const hoverBackgroundColor = theme === 'dark' ? '#2F343C' : '#F5F8FA';
        const secondaryTextColor = theme === 'dark' ? '#8A9BA8' : '#5C7080';
        const positiveColor = '#15B371';
        const negativeColor = '#DB3737';
        const currentTokens = activeSearchTab === 'hot' ? hotTokens : latestTokens;
        if (loading) {
            return (
                <div
                    ref={this.searchPopupRef}
                    style={{
                        width: '420px',
                        height: '400px',
                        backgroundColor: backgroundColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'absolute',
                        bottom: '30px',
                        right: '0',
                        zIndex: 1000,
                        userSelect: 'none'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: textColor
                    }}>
                        加载中...
                    </div>
                </div>
            );
        }
        if (error) {
            return (
                <div
                    ref={this.searchPopupRef}
                    style={{
                        width: '420px',
                        height: '400px',
                        backgroundColor: backgroundColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'absolute',
                        bottom: '30px',
                        right: '0',
                        zIndex: 1000,
                        userSelect: 'none'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: negativeColor
                    }}>
                        {error}
                    </div>
                </div>
            );
        }
        return (
            <div
                ref={this.searchPopupRef}
                style={{
                    width: '420px',
                    height: '400px',
                    backgroundColor: backgroundColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '6px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'absolute',
                    bottom: '30px',
                    right: '0',
                    zIndex: 1000,
                    userSelect: 'none'
                }}
                className={theme === 'dark' ? Classes.DARK : ''}
            >
                {this.renderCustomTabs()}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${theme === 'dark' ? '#5C7080' : '#BFCCD6'} ${theme === 'dark' ? '#30404D' : '#EBF1F5'}`,
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', userSelect: 'none' }}>
                        {currentTokens.map((token, index) => (
                            <div
                                key={`${token.symbol}-${index}`}
                                style={{
                                    padding: '10px 12px',
                                    color: textColor,
                                    backgroundColor: 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    minHeight: '50px',
                                    userSelect: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = hoverBackgroundColor;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onClick={() => this.handleTokenSelect(token.symbol)}
                            >
                                {this.renderTokenLogo(token.symbol)}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    minWidth: 0,
                                    userSelect: 'none'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1,
                                        minWidth: 0,
                                        marginRight: '12px',
                                        userSelect: 'none'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '2px'
                                        }}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                fontSize: '13px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {token.symbol}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: secondaryTextColor,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {token.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        textAlign: 'right',
                                        whiteSpace: 'nowrap',
                                        userSelect: 'none'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            marginBottom: '2px'
                                        }}>
                                            {token.price}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: token.change24h?.startsWith('+') ? positiveColor : negativeColor
                                        }}>
                                            {token.change24h}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { theme, currentTime, marqueeText, isSearchFocused, searchValue, loading, error } = this.state;
        const visibleMenuItems = this.getVisibleMenuItems();
        const backgroundColor = theme === 'dark' ? '#1C2127' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
        const inputBackgroundColor = theme === 'dark' ? '#2F343C' : '#FFFFFF';
        const inputBorderColor = theme === 'dark' ? '#5C7080' : '#BFCCD6';
        return (
            <div
                className={`bottom-bar ${theme === 'dark' ? 'bp4-dark' : 'bp4-light'}`}
                style={{
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: backgroundColor,
                    color: textColor,
                    borderTop: `1px solid ${borderColor}`,
                    fontSize: '12px',
                    fontFamily: 'Microsoft YaHei, SimSun, sans-serif',
                    minWidth: '500px',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                        paddingLeft: '8px',
                        overflow: 'hidden',
                        minWidth: '100px'
                    }}
                >
                    {visibleMenuItems.map((item) => (
                        <div key={item.key} style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                            <Popover
                                content={this.renderDropdownMenu(item.children || [])}
                                position="top-left"
                                minimal
                                captureDismiss={true}
                                interactionKind="click"
                                popoverClassName={`bottom-menu-popover ${theme === 'dark' ? Classes.DARK : ''}`}
                                modifiers={{
                                    preventOverflow: { enabled: true },
                                    flip: { enabled: true }
                                }}
                            >
                                <Button
                                    minimal
                                    text={item.label}
                                    style={{
                                        fontSize: '12px',
                                        padding: '0 10px',
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '25px',
                                        margin: '0 1px',
                                        borderRadius: '0',
                                        border: 'none',
                                        outline: 'none',
                                        boxShadow: 'none',
                                        color: textColor,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0
                                    }}
                                    className="bottom-menu-button"
                                />
                            </Popover>
                        </div>
                    ))}
                    {visibleMenuItems.length < this.leftMenuItems.length && (
                        <div style={{
                            position: 'relative',
                            display: 'inline-block',
                            flexShrink: 0,
                            height: '30px',
                            minHeight: '30px',
                            lineHeight: '25px',
                        }}>
                            <Popover
                                content={this.renderDropdownMenu(
                                    this.leftMenuItems.slice(visibleMenuItems.length).flatMap(item => item.children || [])
                                )}
                                position="top-left"
                                minimal
                                captureDismiss={true}
                                interactionKind="click"
                                popoverClassName={`bottom-menu-popover ${theme === 'dark' ? Classes.DARK : ''}`}
                                modifiers={{
                                    preventOverflow: { enabled: true },
                                    flip: { enabled: true }
                                }}
                            >
                                <Button
                                    minimal
                                    text="..."
                                    style={{
                                        fontSize: '12px',
                                        padding: '0 8px',
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '25px',
                                        margin: '0 1px',
                                        borderRadius: '0',
                                        border: 'none',
                                        outline: 'none',
                                        boxShadow: 'none',
                                        color: textColor,
                                        whiteSpace: 'nowrap'
                                    }}
                                />
                            </Popover>
                        </div>
                    )}
                </div>
                <div
                    style={{
                        flex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                        padding: '0 16px',
                        overflow: 'hidden',
                        position: 'relative',
                        minWidth: '200px'
                    }}
                >
                    <div
                        style={{
                            whiteSpace: 'nowrap',
                            animation: 'marquee 15s linear infinite',
                            color: textColor
                        }}
                    >
                        {loading ? '正在获取实时数据...' : error ? error : marqueeText}
                    </div>
                </div>
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                        paddingRight: '8px',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        minWidth: '150px',
                        flexShrink: 0,
                        position: 'relative'
                    }}
                >
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <InputGroup
                            small
                            placeholder="搜索代币..."
                            value={searchValue}
                            onChange={this.handleSearchChange}
                            onFocus={this.handleSearchFocus}
                            inputRef={this.searchInputRef}
                            style={{
                                width: '120px',
                                height: '20px',
                                fontSize: '12px',
                                flexShrink: 0,
                                backgroundColor: inputBackgroundColor,
                                border: `1px solid ${isSearchFocused ? (theme === 'dark' ? '#8A9BA8' : '#394B59') : inputBorderColor}`,
                                color: textColor,
                                borderRadius: '4px'
                            }}
                        />
                        {isSearchFocused && this.renderSearchPopup()}
                    </div>
                    {this.renderNetworkIndicator()}
                    {this.renderSettingsIcon()}
                    <div
                        style={{
                            color: textColor,
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}
                    >
                        {currentTime}
                    </div>
                </div>
                <style>
                    {`
                        @keyframes marquee {
                            0% { transform: translateX(100%); }
                            100% { transform: translateX(-100%); }
                        }
                    `}
                </style>
            </div>
        );
    }
}

export default withRouter(BottomBar);