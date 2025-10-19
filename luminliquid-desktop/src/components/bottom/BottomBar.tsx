import React from 'react';
import { InputGroup, Button, Popover, Menu, MenuItem, Classes } from '@blueprintjs/core';
import { themeManager } from '../../globals/theme/ThemeManager';

interface BottomBarState {
    theme: 'dark' | 'light';
    currentTime: string;
    marqueeText: string;
    windowWidth: number;
    isSearchFocused: boolean;
    searchValue: string;
    activeSearchTab: string;
}

interface TokenInfo {
    symbol: string;
    color: string;
    name: string;
    network: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    price?: string;
    change24h?: string;
}

class BottomBar extends React.Component<{}, BottomBarState> {
    private timer: NodeJS.Timeout | null = null;
    private unsubscribe: (() => void) | null = null;
    private searchInputRef: React.RefObject<HTMLInputElement> = React.createRef();
    private searchPopupRef: React.RefObject<HTMLDivElement> = React.createRef();
    
    // Search suggestions data
    private searchSuggestions = {
        hotTokens: [
            { 
                symbol: 'BTC/USDT', 
                color: '#F7931A', 
                name: 'Bitcoin', 
                network: 'Bitcoin',
                website: 'https://bitcoin.org',
                twitter: 'https://twitter.com/bitcoin',
                price: '$43,250.67',
                change24h: '+2.34%'
            },
            { 
                symbol: 'ETH/USDT', 
                color: '#627EEA', 
                name: 'Ethereum', 
                network: 'Ethereum',
                website: 'https://ethereum.org',
                twitter: 'https://twitter.com/ethereum',
                telegram: 'https://t.me/ethereum',
                price: '$2,345.89',
                change24h: '+1.78%'
            },
            { 
                symbol: 'BNB/USDT', 
                color: '#F3BA2F', 
                name: 'Binance Coin', 
                network: 'BSC',
                website: 'https://binance.org',
                twitter: 'https://twitter.com/binance',
                telegram: 'https://t.me/binanceexchange',
                price: '$312.45',
                change24h: '-0.56%'
            },
            { 
                symbol: 'XRP/USDT', 
                color: '#23292F', 
                name: 'Ripple', 
                network: 'XRP Ledger',
                website: 'https://ripple.com',
                twitter: 'https://twitter.com/Ripple',
                price: '$0.6234',
                change24h: '+3.21%'
            },
            { 
                symbol: 'ADA/USDT', 
                color: '#0033AD', 
                name: 'Cardano', 
                network: 'Cardano',
                website: 'https://cardano.org',
                twitter: 'https://twitter.com/Cardano',
                telegram: 'https://t.me/CardanoAnnouncements',
                price: '$0.4567',
                change24h: '+5.12%'
            },
            { 
                symbol: 'SOL/USDT', 
                color: '#00FFA3', 
                name: 'Solana', 
                network: 'Solana',
                website: 'https://solana.com',
                twitter: 'https://twitter.com/solana',
                telegram: 'https://t.me/solana',
                price: '$98.76',
                change24h: '+8.45%'
            },
            { 
                symbol: 'DOT/USDT', 
                color: '#E6007A', 
                name: 'Polkadot', 
                network: 'Polkadot',
                website: 'https://polkadot.network',
                twitter: 'https://twitter.com/Polkadot',
                telegram: 'https://t.me/PolkadotOfficial',
                price: '$7.234',
                change24h: '+1.23%'
            },
            { 
                symbol: 'DOGE/USDT', 
                color: '#C2A633', 
                name: 'Dogecoin', 
                network: 'Dogecoin',
                website: 'https://dogecoin.com',
                twitter: 'https://twitter.com/dogecoin',
                price: '$0.0891',
                change24h: '-2.34%'
            }
        ],
        latestTokens: [
            { 
                symbol: 'APE/USDT', 
                color: '#0052FF', 
                name: 'ApeCoin', 
                network: 'Ethereum',
                website: 'https://apecoin.com',
                twitter: 'https://twitter.com/apecoin',
                price: '$1.567',
                change24h: '+12.34%'
            },
            { 
                symbol: 'SAND/USDT', 
                color: '#00ADEF', 
                name: 'The Sandbox', 
                network: 'Ethereum',
                website: 'https://sandbox.game',
                twitter: 'https://twitter.com/TheSandboxGame',
                telegram: 'https://t.me/sandboxgame',
                price: '$0.4567',
                change24h: '+3.45%'
            },
            { 
                symbol: 'MANA/USDT', 
                color: '#FF2D55', 
                name: 'Decentraland', 
                network: 'Ethereum',
                website: 'https://decentraland.org',
                twitter: 'https://twitter.com/decentraland',
                price: '$0.3789',
                change24h: '+2.67%'
            },
            { 
                symbol: 'GALA/USDT', 
                color: '#00B1C9', 
                name: 'Gala', 
                network: 'Ethereum',
                website: 'https://gala.com',
                twitter: 'https://twitter.com/gogalagames',
                telegram: 'https://t.me/GoGalaGames',
                price: '$0.0234',
                change24h: '+15.78%'
            },
            { 
                symbol: 'ENJ/USDT', 
                color: '#624DBF', 
                name: 'Enjin Coin', 
                network: 'Ethereum',
                website: 'https://enjin.io',
                twitter: 'https://twitter.com/enjin',
                telegram: 'https://t.me/enjin_community',
                price: '$0.3456',
                change24h: '+4.56%'
            },
            { 
                symbol: 'AXS/USDT', 
                color: '#0055D5', 
                name: 'Axie Infinity', 
                network: 'Ethereum',
                website: 'https://axieinfinity.com',
                twitter: 'https://twitter.com/AxieInfinity',
                telegram: 'https://t.me/axieinfinity',
                price: '$7.890',
                change24h: '-1.23%'
            },
            { 
                symbol: 'IMX/USDT', 
                color: '#16C784', 
                name: 'Immutable X', 
                network: 'Ethereum L2',
                website: 'https://immutable.com',
                twitter: 'https://twitter.com/Immutable',
                telegram: 'https://t.me/immutablex',
                price: '$1.234',
                change24h: '+6.78%'
            },
            { 
                symbol: 'RNDR/USDT', 
                color: '#FF6B00', 
                name: 'Render Token', 
                network: 'Ethereum',
                website: 'https://rendertoken.com',
                twitter: 'https://twitter.com/rendertoken',
                price: '$3.456',
                change24h: '+9.12%'
            }
        ]
    };

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

    constructor(props: {}) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            currentTime: new Date().toLocaleTimeString(),
            marqueeText: 'This is test new..............             This is test new..............',
            windowWidth: window.innerWidth,
            isSearchFocused: false,
            searchValue: '',
            activeSearchTab: 'hot'
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
        
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.timer) {
            clearInterval(this.timer);
        }
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

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

    handleThemeChange = (event: any) => {
        const newTheme = event.detail?.theme ||
            (document.documentElement.classList.contains('bp4-dark') ? 'dark' : 'light');
        this.setState({ theme: newTheme });
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

    handleTokenSelect = (token: string) => {
        this.setState({ searchValue: token });
        console.log(`Selected token: ${token}`);
    };

    // Render social links icons
    renderSocialLinks = (token: TokenInfo) => {
        const { theme } = this.state;
        const iconColor = theme === 'dark' ? '#8A9BA8' : '#5C7080';
        const hoverColor = theme === 'dark' ? '#F5F8FA' : '#182026';

        return (
            <div style={{ display: 'flex', gap: '6px' }}>
                {token.website && (
                    <div
                        style={{
                            width: '14px',
                            height: '14px',
                            cursor: 'pointer',
                            color: iconColor,
                            transition: 'color 0.2s ease',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
                        onMouseLeave={(e) => e.currentTarget.style.color = iconColor}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(token.website, '_blank');
                        }}
                        title="Website"
                    >
                        🌐
                    </div>
                )}
                {token.twitter && (
                    <div
                        style={{
                            width: '14px',
                            height: '14px',
                            cursor: 'pointer',
                            color: iconColor,
                            transition: 'color 0.2s ease',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
                        onMouseLeave={(e) => e.currentTarget.style.color = iconColor}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(token.twitter, '_blank');
                        }}
                        title="Twitter"
                    >
                        🐦
                    </div>
                )}
                {token.telegram && (
                    <div
                        style={{
                            width: '14px',
                            height: '14px',
                            cursor: 'pointer',
                            color: iconColor,
                            transition: 'color 0.2s ease',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
                        onMouseLeave={(e) => e.currentTarget.style.color = iconColor}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(token.telegram, '_blank');
                        }}
                        title="Telegram"
                    >
                        📢
                    </div>
                )}
            </div>
        );
    };

    renderTokenLogo = (color: string, symbol: string) => {
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

    // Custom Tab component
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
                    Hot Tokens
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
                    Latest Tokens
                </div>
            </div>
        );
    };

    renderSearchPopup = () => {
        const { theme, activeSearchTab } = this.state;
        const backgroundColor = theme === 'dark' ? '#1C2127' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
        const hoverBackgroundColor = theme === 'dark' ? '#2F343C' : '#F5F8FA';
        const secondaryTextColor = theme === 'dark' ? '#8A9BA8' : '#5C7080';
        const positiveColor = '#15B371';
        const negativeColor = '#DB3737';

        const currentTokens = activeSearchTab === 'hot' 
            ? this.searchSuggestions.hotTokens 
            : this.searchSuggestions.latestTokens;

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
                                key={token.symbol}
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
                                {/* Logo area */}
                                <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none' }}>
                                    {this.renderTokenLogo(token.color, token.symbol)}
                                </div>
                                
                                {/* Main content area - horizontal layout */}
                                <div style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    minWidth: 0,
                                    userSelect: 'none'
                                }}>
                                    {/* Left: Token basic info */}
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
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '12px'
                                        }}>
                                            <div style={{ 
                                                fontSize: '11px', 
                                                color: secondaryTextColor,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                Network: {token.network}
                                            </div>
                                            {this.renderSocialLinks(token)}
                                        </div>
                                    </div>

                                    {/* Right: Price info */}
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
        const { theme, currentTime, marqueeText, isSearchFocused, searchValue } = this.state;
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
                {/* Left menu area */}
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

                {/* Middle marquee area */}
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
                        {marqueeText}
                    </div>
                </div>

                {/* Right search and time area */}
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
                            placeholder="Search..."
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
            </div>
        );
    }
}

export default BottomBar;