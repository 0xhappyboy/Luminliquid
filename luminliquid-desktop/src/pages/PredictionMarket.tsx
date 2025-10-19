import React from "react";
import {
  Menu,
  MenuItem,
  Icon,
  Button,
  ProgressBar
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";

interface PredictionMarketPageProps {
  children?: React.ReactNode;
}

interface PredictionMarketPageState {
  theme: 'dark' | 'light';
  containerHeight: number;
  selectedMenu: string;
  selectedSubMenu: string;
  selectedOption: string;
  expandedMenus: Set<string>;
  isCollapsed: boolean;
  currentPage: number;
  tableHeaderFixed: boolean;
  selectedFilter: string;
  expandedFilter: string | null;
  selectedTime: string;
  selectedMarket: PredictionMarket | null;
  isDetailDrawerOpen: boolean;
  betAmount: string;
  selectedOutcome: 'YES' | 'NO';
}

interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  volume: number;
  liquidity: number;
  endDate: string;
  probability: number;
  yesPrice: number;
  noPrice: number;
  yesShares: number;
  noShares: number;
  totalShares: number;
  resolution: 'OPEN' | 'YES' | 'NO' | 'INVALID';
  tags: string[];
  createdBy: string;
  createdAt: string;
  marketType: 'BINARY' | 'MULTIPLE_CHOICE';
  tradingFee: number;
  resolutionSource: string;
  historicalPrices: {
    timestamp: string;
    yesPrice: number;
    noPrice: number;
  }[];
}

class PredictionMarketPage extends React.Component<PredictionMarketPageProps, PredictionMarketPageState> {
  private unsubscribe: (() => void) | null = null;
  private containerRef: React.RefObject<HTMLDivElement | null>;
  private tableContainerRef: React.RefObject<HTMLDivElement | null>;
  private resizeObserver: ResizeObserver | null = null;

  private menuData = [
    {
      key: 'featured',
      icon: 'star',
      label: 'Featured Markets',
      children: [
        { key: 'trending', label: 'Trending' },
        { key: 'high-volume', label: 'High Volume' },
        { key: 'ending-soon', label: 'Ending Soon' }
      ]
    },
    {
      key: 'categories',
      icon: 'grouped-bar-chart',
      label: 'Categories',
      children: [
        { key: 'politics', label: 'Politics' },
        { key: 'sports', label: 'Sports' },
        { key: 'crypto', label: 'Crypto' },
        { key: 'entertainment', label: 'Entertainment' },
        { key: 'technology', label: 'Technology' },
        { key: 'science', label: 'Science' }
      ]
    },
    {
      key: 'my-markets',
      icon: 'person',
      label: 'My Markets',
      children: [
        { key: 'positions', label: 'My Positions' },
        { key: 'created', label: 'Markets Created' },
        { key: 'favorites', label: 'Favorites' }
      ]
    }
  ];

  private filterGroups = [
    {
      key: 'status',
      label: 'Status',
      icon: 'predictive-analysis',
      subButtons: [
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' }
      ]
    },
    {
      key: 'volume',
      label: 'Volume',
      icon: 'chart',
      subButtons: [
        { key: 'high', label: 'High' },
        { key: 'medium', label: 'Medium' },
        { key: 'low', label: 'Low' }
      ]
    },
    {
      key: 'time',
      label: 'Time',
      icon: 'time',
      subButtons: [
        { key: '24h', label: '24H' },
        { key: '7d', label: '7D' },
        { key: '30d', label: '30D' }
      ]
    }
  ];

  private timeOptions = [
    { key: '24h', label: 'Last 24 hours' },
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: 'all', label: 'All time' }
  ];

  private generatePredictionMarkets = (): PredictionMarket[] => {
    const markets: PredictionMarket[] = [];
    const categories = ['Politics', 'Sports', 'Crypto', 'Entertainment', 'Technology', 'Science'];
    const resolutions: ('OPEN' | 'YES' | 'NO' | 'INVALID')[] = ['OPEN', 'OPEN', 'OPEN', 'YES', 'NO'];

    const sampleTitles = [
      "Will Bitcoin reach $100,000 by end of 2024?",
      "Which party will win the next US presidential election?",
      "Will Taylor Swift release a new album in 2024?",
      "Will AI replace 50% of software jobs by 2030?",
      "Will humans land on Mars before 2030?",
      "Will Ethereum switch to proof-of-stake completely?",
      "Will the S&P 500 hit a new all-time high this year?",
      "Will there be a major earthquake in California in 2024?",
      "Will quantum computing achieve supremacy in 2024?",
      "Will electric vehicles outsell gasoline cars by 2025?"
    ];

    const sampleDescriptions = [
      "This market will resolve to YES if Bitcoin reaches $100,000 or higher before December 31, 2024, according to CoinGecko closing price.",
      "Market resolves based on the official election results. Inauguration date determines the outcome.",
      "Resolution based on official album release announcement from Taylor Swift or her record label.",
      "Based on Bureau of Labor Statistics data for software development jobs replaced by AI systems.",
      "Resolution based on successful manned mission to Mars confirmed by major space agencies.",
      "Complete transition to proof-of-stake consensus mechanism as confirmed by Ethereum Foundation.",
      "S&P 500 index reaching new all-time high confirmed by major financial data providers.",
      "Earthquake of magnitude 7.0 or higher in California confirmed by US Geological Survey.",
      "Quantum computer solving problem beyond capabilities of classical supercomputers.",
      "Global EV sales exceeding gasoline car sales according to International Energy Agency data."
    ];

    for (let i = 0; i < 500; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];
      const probability = 30 + Math.random() * 40; // 30-70% range
      const yesShares = Math.random() * 1000000;
      const noShares = Math.random() * 1000000;
      const totalShares = yesShares + noShares;

      markets.push({
        id: `market-${i}`,
        title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
        description: sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)],
        category,
        volume: Math.random() * 1000000,
        liquidity: Math.random() * 500000,
        endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability,
        yesPrice: probability / 100,
        noPrice: (100 - probability) / 100,
        yesShares,
        noShares,
        totalShares,
        resolution,
        tags: [category, resolution === 'OPEN' ? 'Active' : 'Resolved', 'Popular'],
        createdBy: `user${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        marketType: 'BINARY',
        tradingFee: 0.02,
        resolutionSource: "Official sources and verified data providers",
        historicalPrices: this.generateHistoricalPrices(probability / 100)
      });
    }

    return markets;
  };

  private generateHistoricalPrices = (currentYesPrice: number) => {
    const prices = [];
    let price = currentYesPrice - 0.1 + Math.random() * 0.2;

    for (let i = 30; i >= 0; i--) {
      const change = (Math.random() - 0.5) * 0.1;
      price = Math.max(0.01, Math.min(0.99, price + change));

      prices.push({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        yesPrice: price,
        noPrice: 1 - price
      });
    }

    return prices;
  };

  private predictionMarkets: PredictionMarket[] = this.generatePredictionMarkets();

  constructor(props: PredictionMarketPageProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement | null>();
    this.tableContainerRef = React.createRef<HTMLDivElement | null>();
    this.state = {
      theme: themeManager.getTheme(),
      containerHeight: 0,
      selectedMenu: 'featured',
      selectedSubMenu: 'trending',
      selectedOption: 'markets',
      expandedMenus: new Set(['featured']),
      isCollapsed: false,
      currentPage: 0,
      tableHeaderFixed: false,
      selectedFilter: '',
      expandedFilter: null,
      selectedTime: '24h',
      selectedMarket: null,
      isDetailDrawerOpen: false,
      betAmount: '100',
      selectedOutcome: 'YES'
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

  private handleMarketSelect = (market: PredictionMarket) => {
    this.setState({
      selectedMarket: market,
      isDetailDrawerOpen: true
    });
  };

  private handleCloseDetailDrawer = () => {
    this.setState({
      isDetailDrawerOpen: false,
      selectedMarket: null
    });
  };

  private handleBetAmountChange = (amount: string) => {
    this.setState({ betAmount: amount });
  };

  private handleOutcomeSelect = (outcome: 'YES' | 'NO') => {
    this.setState({ selectedOutcome: outcome });
  };

  private handlePlaceBet = () => {
    const { selectedMarket, betAmount, selectedOutcome } = this.state;
    if (!selectedMarket || !betAmount) return;

    console.log(`Placing ${selectedOutcome} bet of $${betAmount} on market: ${selectedMarket.title}`);
    alert(`Bet placed successfully! ${selectedOutcome} $${betAmount} on "${selectedMarket.title}"`);
  };

  private handleAddToWatchlist = () => {
    const { selectedMarket } = this.state;
    if (!selectedMarket) return;

    console.log(`Added to watchlist: ${selectedMarket.title}`);
    alert(`Added "${selectedMarket.title}" to watchlist`);
  };

  private handleShareMarket = () => {
    const { selectedMarket } = this.state;
    if (!selectedMarket) return;

    console.log(`Sharing market: ${selectedMarket.title}`);
    alert(`Share link copied to clipboard for "${selectedMarket.title}"`);
  };

  componentDidMount() {
    this.updateContainerHeight();
    window.addEventListener('resize', this.debouncedResize);
    this.unsubscribe = themeManager.subscribe(this.handleThemeChange);

    if (this.containerRef.current?.parentElement) {
      this.resizeObserver = new ResizeObserver(this.updateContainerHeight);
      this.resizeObserver.observe(this.containerRef.current.parentElement);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResize);
    if (this.unsubscribe) this.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
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
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: default;
      }
    
      .menu-item, .radio-option, .menu-item span, .radio-option span {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
      }
    
      .global-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .global-scrollbar::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        border-radius: 3px;
      }
      
      .global-scrollbar::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 3px;
      }
      
      .global-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
      }
      
      .menu-item-hover:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .menu-item-selected {
        background-color: ${selectedBgColor} !important;
        color: ${theme === 'dark' ? '#FFFFFF' : '#182026'} !important;
        font-weight: 600 !important;
        border-right: 3px solid ${primaryColor} !important;
      }
      
      .radio-option {
        transition: all 0.2s ease;
        border-radius: 6px;
        cursor: pointer;
      }
      
      .radio-option:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .radio-option.selected {
        background-color: ${selectedBgColor} !important;
        border-color: ${primaryColor} !important;
        color: ${theme === 'dark' ? '#FFFFFF' : '#182026'} !important;
      }

      .menu-item:focus {
        outline: none !important;
        box-shadow: ${focusShadow} !important;
        background-color: ${theme === 'dark' ? 'rgba(143, 153, 168, 0.15)' : 'rgba(95, 107, 124, 0.08)'} !important;
        border-color: ${focusColor} !important;
      }

      .radio-option:focus {
        outline: none !important;
        box-shadow: ${focusShadow} !important;
        border-color: ${focusColor} !important;
        background-color: ${theme === 'dark' ? 'rgba(143, 153, 168, 0.15)' : 'rgba(95, 107, 124, 0.08)'} !important;
      }

      .collapsed-menu-item {
        justify-content: center !important;
        padding: 12px 8px !important;
      }

      .collapsed-menu-item .menu-icon {
        margin: 0 !important;
      }

      .fixed-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        box-shadow: 0 2px 4px ${theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
      }

      .table-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      .table-scroll-container {
        flex: 1;
        overflow: auto;
        position: relative;
      }

      .filter-button {
        transition: all 0.2s ease;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'};
      }
      
      .filter-button:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .filter-button.selected {
        background-color: ${selectedBgColor} !important;
        border-color: ${primaryColor} !important;
        color: ${theme === 'dark' ? '#FFFFFF' : '#182026'} !important;
      }

      .probability-bar {
        height: 4px;
        border-radius: 2px;
        overflow: hidden;
        background: ${theme === 'dark' ? '#2D323D' : '#E1E5E9'};
      }

      .probability-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease;
      }
    `;
  };

  private handleMenuToggle = (menuKey: string) => {
    this.setState(prevState => {
      const newExpandedMenus = new Set(prevState.expandedMenus);
      if (newExpandedMenus.has(menuKey)) {
        newExpandedMenus.delete(menuKey);
      } else {
        newExpandedMenus.add(menuKey);
      }
      return { expandedMenus: newExpandedMenus };
    });
  };

  private handleMenuSelect = (menuKey: string, subMenuKey?: string) => {
    if (subMenuKey) {
      this.setState({
        selectedMenu: menuKey,
        selectedSubMenu: subMenuKey
      });
    } else {
      this.handleMenuToggle(menuKey);
      this.setState({ selectedMenu: menuKey });
    }
  };

  private handleOptionSelect = (optionKey: string) => {
    this.setState({ selectedOption: optionKey });
  };

  private toggleDrawer = () => {
    this.setState(prevState => ({
      isCollapsed: !prevState.isCollapsed
    }));
  };

  private handlePageChange = (newPage: number) => {
    this.setState({ currentPage: newPage });
  };

  private handleFilterSelect = (filterKey: string) => {
    this.setState({ selectedFilter: filterKey });
  };

  private formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  private formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  private getResolutionColor = (resolution: string, theme: 'dark' | 'light') => {
    switch (resolution) {
      case 'YES':
        return theme === 'dark' ? '#2E8B57' : '#238551';
      case 'NO':
        return theme === 'dark' ? '#DC143C' : '#C7223A';
      case 'INVALID':
        return theme === 'dark' ? '#8F99A8' : '#5F6B7C';
      default:
        return theme === 'dark' ? '#A7B6C2' : '#404854';
    }
  };

  private renderMarketDetailDrawer = () => {
    const { theme, selectedMarket, isDetailDrawerOpen, betAmount, selectedOutcome } = this.state;

    if (!selectedMarket || !isDetailDrawerOpen) return null;

    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
    const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
    const yesColor = theme === 'dark' ? '#2E8B57' : '#238551';
    const noColor = theme === 'dark' ? '#DC143C' : '#C7223A';

    const potentialPayout = selectedOutcome === 'YES'
      ? (parseFloat(betAmount) / selectedMarket.yesPrice).toFixed(2)
      : (parseFloat(betAmount) / selectedMarket.noPrice).toFixed(2);

    return (
      <div style={{
        width: '480px',
        backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
        borderLeft: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        flexShrink: 0
      }}>

        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: textColor
          }}>
            Market Details
          </h3>
          <Button
            minimal
            icon="cross"
            onClick={this.handleCloseDetailDrawer}
            style={{
              padding: '4px',
              color: theme === 'dark' ? '#8F99A8' : '#5F6B7C'
            }}
            title="Close drawer"
          />
        </div>


        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }} className="global-scrollbar">


          <div style={{
            backgroundColor: cardBg,
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedMarket.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F3F5',
                      color: secondaryTextColor,
                      borderRadius: '4px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  minimal
                  icon="star-empty"
                  onClick={this.handleAddToWatchlist}
                  title="Add to watchlist"
                />
                <Button
                  minimal
                  icon="share"
                  onClick={this.handleShareMarket}
                  title="Share market"
                />
              </div>
            </div>

            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: textColor,
              lineHeight: '1.4'
            }}>
              {selectedMarket.title}
            </h4>

            <p style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: textColor,
              marginBottom: '16px'
            }}>
              {selectedMarket.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: secondaryTextColor }}>End Date: </span>
                <span style={{ color: textColor, fontWeight: '600' }}>
                  {this.formatDate(selectedMarket.endDate)}
                </span>
              </div>
              <div>
                <span style={{ color: secondaryTextColor }}>Volume: </span>
                <span style={{ color: textColor, fontWeight: '600' }}>
                  {this.formatNumber(selectedMarket.volume)}
                </span>
              </div>
              <div>
                <span style={{ color: secondaryTextColor }}>Created By: </span>
                <span style={{ color: textColor, fontWeight: '600' }}>
                  {selectedMarket.createdBy}
                </span>
              </div>
              <div>
                <span style={{ color: secondaryTextColor }}>Trading Fee: </span>
                <span style={{ color: textColor, fontWeight: '600' }}>
                  {(selectedMarket.tradingFee * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>


          <div style={{
            backgroundColor: cardBg,
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', color: textColor }}>Current Prices</h4>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: selectedMarket.probability > 50 ? yesColor : noColor
              }}>
                {selectedMarket.probability.toFixed(1)}% Probability
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                padding: '12px',
                border: `2px solid ${yesColor}`,
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: secondaryTextColor, marginBottom: '4px' }}>YES</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: yesColor }}>
                  ${selectedMarket.yesPrice.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: secondaryTextColor }}>
                  {((selectedMarket.yesShares / selectedMarket.totalShares) * 100).toFixed(1)}% of shares
                </div>
              </div>

              <div style={{
                padding: '12px',
                border: `2px solid ${noColor}`,
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: secondaryTextColor, marginBottom: '4px' }}>NO</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: noColor }}>
                  ${selectedMarket.noPrice.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: secondaryTextColor }}>
                  {((selectedMarket.noShares / selectedMarket.totalShares) * 100).toFixed(1)}% of shares
                </div>
              </div>
            </div>
          </div>


          <div style={{
            backgroundColor: cardBg,
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: textColor }}>Market Liquidity</h4>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: yesColor, fontWeight: '600' }}>YES</span>
                <span style={{ fontSize: '12px', color: secondaryTextColor }}>
                  {this.formatNumber(selectedMarket.yesShares)} shares
                </span>
              </div>
              <ProgressBar
                value={selectedMarket.yesShares / selectedMarket.totalShares}
                intent="success"
                style={{ height: '8px', marginBottom: '12px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: noColor, fontWeight: '600' }}>NO</span>
                <span style={{ fontSize: '12px', color: secondaryTextColor }}>
                  {this.formatNumber(selectedMarket.noShares)} shares
                </span>
              </div>
              <ProgressBar
                value={selectedMarket.noShares / selectedMarket.totalShares}
                intent="danger"
                style={{ height: '8px' }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: secondaryTextColor
            }}>
              <span>Total Liquidity: {this.formatNumber(selectedMarket.liquidity)}</span>
              <span>Total Shares: {this.formatNumber(selectedMarket.totalShares)}</span>
            </div>
          </div>


          <div style={{
            backgroundColor: cardBg,
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: textColor }}>Place Bet</h4>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: secondaryTextColor, marginBottom: '8px' }}>Select Outcome:</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Button
                  large
                  fill
                  intent={selectedOutcome === 'YES' ? 'success' : 'none'}
                  onClick={() => this.handleOutcomeSelect('YES')}
                  style={{
                    border: `2px solid ${selectedOutcome === 'YES' ? yesColor : borderColor}`,
                    fontWeight: '600'
                  }}
                >
                  YES - ${selectedMarket.yesPrice.toFixed(2)}
                </Button>
                <Button
                  large
                  fill
                  intent={selectedOutcome === 'NO' ? 'danger' : 'none'}
                  onClick={() => this.handleOutcomeSelect('NO')}
                  style={{
                    border: `2px solid ${selectedOutcome === 'NO' ? noColor : borderColor}`,
                    fontWeight: '600'
                  }}
                >
                  NO - ${selectedMarket.noPrice.toFixed(2)}
                </Button>
              </div>

              <div style={{ fontSize: '13px', color: secondaryTextColor, marginBottom: '8px' }}>Bet Amount ($):</div>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => this.handleBetAmountChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '4px',
                  backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                  color: textColor,
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                min="1"
                step="1"
              />
            </div>

            <div style={{
              padding: '12px',
              backgroundColor: theme === 'dark' ? '#2D323D' : '#F8F9FA',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: secondaryTextColor }}>Potential Payout:</span>
                <span style={{ color: textColor, fontWeight: '600' }}>${potentialPayout}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: secondaryTextColor }}>Trading Fee ({(selectedMarket.tradingFee * 100).toFixed(1)}%):</span>
                <span style={{ color: textColor, fontWeight: '600' }}>
                  ${(parseFloat(betAmount) * selectedMarket.tradingFee).toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              large
              fill
              intent="primary"
              onClick={this.handlePlaceBet}
              style={{
                fontWeight: '700',
                fontSize: '14px'
              }}
            >
              Place Bet - ${betAmount}
            </Button>
          </div>


          <div style={{
            backgroundColor: cardBg,
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: textColor }}>Market Information</h4>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: secondaryTextColor }}>Market ID:</span>
                <span style={{ color: textColor }}>{selectedMarket.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: secondaryTextColor }}>Created:</span>
                <span style={{ color: textColor }}>{this.formatDate(selectedMarket.createdAt.split('T')[0])}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: secondaryTextColor }}>Market Type:</span>
                <span style={{ color: textColor }}>{selectedMarket.marketType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: secondaryTextColor }}>Resolution Source:</span>
                <span style={{ color: textColor }}>{selectedMarket.resolutionSource}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  private renderFilterButtons = () => {
    const { theme, selectedFilter, expandedFilter, selectedTime } = this.state;
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
    const activeBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';
    const subButtonActiveBg = theme === 'dark' ? '#2D3746' : '#F1F3F5';

    const handleMainButtonClick = (filterKey: string) => {
      this.setState({
        expandedFilter: expandedFilter === filterKey ? null : filterKey
      });
    };

    const handleSubButtonClick = (filterKey: string, subKey: string) => {
      this.setState({
        selectedFilter: `${filterKey}-${subKey}`,
      });
    };

    const handleTimeSelect = (timeKey: string) => {
      this.setState({
        selectedTime: timeKey,
        expandedFilter: null
      });
    };

    const handleResetAll = () => {
      this.setState({
        selectedFilter: '',
        selectedTime: '24h',
        expandedFilter: null
      });
    };

    const handleOutsideClick = () => {
      this.setState({ expandedFilter: null });
    };

    return (
      <div style={{
        padding: '5px 10px',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: theme === 'dark' ? '#0F1116' : '#F8F9FA',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>

          <div
            onClick={handleResetAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              border: `1px solid ${borderColor}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: theme === 'dark' ? '#E8EAED' : '#1A1D24'
            }}
          >
            <Icon icon="refresh" size={12} />
            <span>Reset</span>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              onClick={() => {
                this.setState({
                  expandedFilter: expandedFilter === 'time' ? null : 'time'
                });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                border: `1px solid ${expandedFilter === 'time' ? primaryColor : borderColor}`,
                backgroundColor: expandedFilter === 'time' ? activeBgColor : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: theme === 'dark' ? '#E8EAED' : '#1A1D24'
              }}
            >
              <Icon icon="time" size={12} />
              <span>{this.timeOptions.find(t => t.key === selectedTime)?.label || 'Last 24 hours'}</span>
              <Icon
                icon={expandedFilter === 'time' ? "chevron-up" : "chevron-down"}
                size={10}
                style={{ opacity: 0.7 }}
              />
            </div>

            {expandedFilter === 'time' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: theme === 'dark'
                    ? '0 4px 12px rgba(0,0,0,0.3)'
                    : '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 1001,
                  minWidth: '160px',
                  padding: '4px 0'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {this.timeOptions.map((time) => {
                  const isSelected = selectedTime === time.key;
                  return (
                    <div
                      key={time.key}
                      onClick={() => handleTimeSelect(time.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ?
                          (theme === 'dark' ? '#FFFFFF' : '#182026') :
                          (theme === 'dark' ? '#E8EAED' : '#1A1D24'),
                        backgroundColor: isSelected ? activeBgColor : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isSelected && (
                        <Icon icon="tick" size={12} color={primaryColor} />
                      )}
                      <span>{time.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {this.filterGroups.map((filter) => {
              const hasSubButtons = filter.subButtons && filter.subButtons.length > 0;
              const isExpanded = expandedFilter === filter.key;
              const isSelected = selectedFilter.startsWith(filter.key);
              const currentSubKey = isSelected ? selectedFilter.split('-')[1] : null;

              return (
                <div key={filter.key} style={{ position: 'relative' }}>
                  <div
                    onClick={() => handleMainButtonClick(filter.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: `1px solid ${isExpanded || isSelected ? primaryColor : borderColor}`,
                      backgroundColor: isExpanded || isSelected ? activeBgColor : 'transparent',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: isSelected ? '600' : '400',
                      color: isExpanded || isSelected ?
                        (theme === 'dark' ? '#FFFFFF' : '#182026') :
                        (theme === 'dark' ? '#E8EAED' : '#1A1D24'),
                      borderRight: hasSubButtons && isExpanded ? `1px solid ${borderColor}` : 'none',
                      userSelect: 'none'
                    }}>
                      <Icon
                        icon={filter.icon as any}
                        size={12}
                        color={isExpanded || isSelected ? primaryColor : undefined}
                      />
                      <span>{filter.label}</span>
                      {hasSubButtons && (
                        <Icon
                          icon={isExpanded ? "chevron-up" : "chevron-down"}
                          size={10}
                          style={{ marginLeft: '4px', opacity: 0.7 }}
                        />
                      )}
                    </div>

                    {hasSubButtons && isExpanded && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        {filter.subButtons.map((subButton, index) => {
                          const isSubSelected = currentSubKey === subButton.key;
                          return (
                            <div
                              key={subButton.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleSubButtonClick(filter.key, subButton.key);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 8px',
                                fontSize: '11px',
                                fontWeight: isSubSelected ? '600' : '400',
                                color: isSubSelected ?
                                  (theme === 'dark' ? '#FFFFFF' : '#182026') :
                                  (theme === 'dark' ? '#E8EAED' : '#1A1D24'),
                                backgroundColor: isSubSelected ? subButtonActiveBg : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '32px',
                                borderLeft: index > 0 ? `1px solid ${borderColor}` : 'none',
                                userSelect: 'none'
                              }}
                            >
                              {subButton.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: 'auto'
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Icon
                icon="search"
                size={12}
                color={theme === 'dark' ? '#8F99A8' : '#5F6B7C'}
                style={{
                  position: 'absolute',
                  left: '10px',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                placeholder="Search markets..."
                style={{
                  padding: '8px 12px 8px 30px',
                  fontSize: '13px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                  color: theme === 'dark' ? '#E8EAED' : '#1A1D24',
                  outline: 'none',
                  width: '200px',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = primaryColor;
                  e.target.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(143, 153, 168, 0.2)' : 'rgba(95, 107, 124, 0.1)'}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = borderColor;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {expandedFilter && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000
            }}
            onClick={handleOutsideClick}
          />
        )}
      </div>
    );
  };

  private renderVolumeStats = () => {
    const { theme } = this.state;
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    return (
      <div style={{
        padding: '10px 20px',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: theme === 'dark' ? '#0F1116' : '#F8F9FA',
        flexShrink: 0
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'center',
          justifyItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: secondaryTextColor
            }}>
              24H VOLUME:
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: textColor
            }}>
              $2.45M
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: secondaryTextColor
            }}>
              ACTIVE MARKETS:
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: textColor
            }}>
              1,248
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: secondaryTextColor
            }}>
              TOTAL LIQUIDITY:
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: textColor
            }}>
              $15.8M
            </span>
          </div>
        </div>
      </div>
    );
  };

  private renderLogoSection = () => {
    const { theme, isCollapsed } = this.state;
    const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';

    if (isCollapsed) {
      return (
        <div style={{
          padding: '16px 8px',
          borderBottom: `1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'}`,
          textAlign: 'center',
          flexShrink: 0
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: theme === 'dark' ? '#2D323D' : '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: primaryColor,
            fontSize: '16px',
            cursor: 'pointer',
            border: `1px solid ${theme === 'dark' ? '#3A4250' : '#E1E5E9'}`,
            transition: 'all 0.2s ease'
          }}
            onClick={this.toggleDrawer}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#3C4858' : '#E1E5E9';
              e.currentTarget.style.borderColor = primaryColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#2D323D' : '#F1F5F9';
              e.currentTarget.style.borderColor = theme === 'dark' ? '#3A4250' : '#E1E5E9';
            }}
            title="Open Menu">
            <Icon icon="menu" size={14} color={primaryColor} />
          </div>
        </div>
      );
    }

    return (
      <div style={{
        padding: '16px 12px',
        borderBottom: `1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'}`,
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: primaryColor,
            padding: '8px 12px'
          }}>
            Prediction Markets
          </div>
          <Button
            minimal
            icon="double-chevron-left"
            onClick={this.toggleDrawer}
            style={{
              padding: '4px',
              color: primaryColor
            }}
            title="Close Menu"
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {[
            { key: 'markets', label: 'Markets', icon: 'predictive-analysis' },
            { key: 'portfolio', label: 'Portfolio', icon: 'portfolio' },
            { key: 'create', label: 'Create Market', icon: 'add' }
          ].map((option) => (
            <div
              key={option.key}
              onClick={() => this.handleOptionSelect(option.key)}
              className={`radio-option ${this.state.selectedOption === option.key ? 'selected' : ''}`}
              tabIndex={0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                border: `1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'}`,
                fontSize: '13px',
                fontWeight: this.state.selectedOption === option.key ? '600' : '400',
                color: this.state.selectedOption === option.key ?
                  (theme === 'dark' ? '#FFFFFF' : '#182026') :
                  (theme === 'dark' ? '#E8EAED' : '#1A1D24'),
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              <Icon
                icon={option.icon as any}
                size={14}
                color={this.state.selectedOption === option.key ? primaryColor : undefined}
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  private renderMenuContent = () => {
    const { theme, selectedMenu, selectedSubMenu, expandedMenus, isCollapsed } = this.state;
    const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

    if (isCollapsed) {
      return (
        <div style={{ padding: '8px 0' }}>
          {this.menuData.map((menu) => (
            <div
              key={menu.key}
              onClick={() => this.handleMenuSelect(menu.key)}
              className={`menu-item menu-item-hover ${selectedMenu === menu.key ? 'menu-item-selected' : ''} collapsed-menu-item`}
              tabIndex={0}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: selectedMenu === menu.key ?
                  (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
                borderRight: selectedMenu === menu.key ? `3px solid ${primaryColor}` : '3px solid transparent',
                color: selectedMenu === menu.key ?
                  (theme === 'dark' ? '#FFFFFF' : '#182026') : textColor,
                transition: 'all 0.2s ease',
                outline: 'none',
                marginBottom: '4px',
              }}
              title={menu.label}
            >
              <Icon
                icon={menu.icon as any}
                size={16}
                className="menu-icon"
                color={selectedMenu === menu.key ? primaryColor : undefined}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ padding: '12px 0' }}>
        {this.menuData.map((menu) => {
          const isExpanded = expandedMenus.has(menu.key);
          const hasChildren = menu.children && menu.children.length > 0;

          return (
            <div key={menu.key}>
              <div
                onClick={() => this.handleMenuSelect(menu.key)}
                className={`menu-item menu-item-hover ${selectedMenu === menu.key ? 'menu-item-selected' : ''}`}
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: selectedMenu === menu.key ?
                    (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
                  borderRight: selectedMenu === menu.key ? `3px solid ${primaryColor}` : '3px solid transparent',
                  color: selectedMenu === menu.key ?
                    (theme === 'dark' ? '#FFFFFF' : '#182026') : textColor,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  marginBottom: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    icon={menu.icon as any}
                    size={16}
                    className="menu-icon"
                    color={selectedMenu === menu.key ? primaryColor : undefined}
                  />
                  <span>{menu.label}</span>
                </div>
                {hasChildren && (
                  <Icon
                    icon={isExpanded ? "chevron-up" : "chevron-down"}
                    size={12}
                    style={{ opacity: 0.7 }}
                  />
                )}
              </div>

              {hasChildren && isExpanded && (
                <div style={{ paddingLeft: '12px', marginBottom: '8px' }}>
                  {menu.children.map((child) => (
                    <div
                      key={child.key}
                      onClick={() => this.handleMenuSelect(menu.key, child.key)}
                      className={`menu-item menu-item-hover ${selectedSubMenu === child.key ? 'menu-item-selected' : ''}`}
                      tabIndex={0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px 8px 32px',
                        fontSize: '13px',
                        fontWeight: selectedSubMenu === child.key ? '600' : '400',
                        cursor: 'pointer',
                        backgroundColor: selectedSubMenu === child.key ?
                          (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
                        borderRight: selectedSubMenu === child.key ? `3px solid ${primaryColor}` : '3px solid transparent',
                        color: selectedSubMenu === child.key ?
                          (theme === 'dark' ? '#FFFFFF' : '#182026') : textColor,
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        marginBottom: '1px',
                      }}
                    >
                      <span>{child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  private renderMarketTable = () => {
    const { theme, tableHeaderFixed, containerHeight } = this.state;
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
    const headerBgColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';

    const tableHeaders = [
      { key: 'market', label: 'Market', width: '40%' },
      { key: 'volume', label: 'Volume', width: '12%' },
      { key: 'liquidity', label: 'Liquidity', width: '12%' },
      { key: 'endDate', label: 'End Date', width: '12%' },
      { key: 'probability', label: 'Probability', width: '12%' },
      { key: 'price', label: 'Price', width: '12%' }
    ];

    const renderProbabilityBar = (probability: number) => {
      const isHighProbability = probability > 70;
      const isLowProbability = probability < 30;

      let fillColor;
      if (isHighProbability) {
        fillColor = theme === 'dark' ? '#2E8B57' : '#238551';
      } else if (isLowProbability) {
        fillColor = theme === 'dark' ? '#DC143C' : '#C7223A';
      } else {
        fillColor = theme === 'dark' ? '#A7B6C2' : '#404854';
      }

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: textColor,
            minWidth: '30px'
          }}>
            {probability.toFixed(1)}%
          </span>
          <div className="probability-bar" style={{ flex: 1, maxWidth: '80px' }}>
            <div
              className="probability-fill"
              style={{
                width: `${probability}%`,
                backgroundColor: fillColor
              }}
            />
          </div>
        </div>
      );
    };

    const renderResolutionBadge = (resolution: string) => {
      const color = this.getResolutionColor(resolution, theme);
      const label = resolution === 'OPEN' ? 'Active' : resolution;

      return (
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: color,
          padding: '2px 6px',
          border: `1px solid ${color}`,
          borderRadius: '3px',
          textTransform: 'uppercase'
        }}>
          {label}
        </span>
      );
    };

    return (
      <div className="table-container" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div
          className="table-scroll-container global-scrollbar"
          ref={this.tableContainerRef}
          onScroll={this.handleTableScroll}
          style={{
            flex: 1,
            overflow: 'auto',
            height: '100%'
          }}
        >
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: headerBgColor,
                borderBottom: `2px solid ${borderColor}`,
                position: tableHeaderFixed ? 'sticky' : 'relative',
                top: 0,
                zIndex: 10
              }}>
                {tableHeaders.map(header => (
                  <th
                    key={header.key}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: secondaryTextColor,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: header.width,
                      borderBottom: `2px solid ${borderColor}`
                    }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {this.predictionMarkets.slice(0, 50).map((market, index) => (
                <tr
                  key={market.id}
                  onClick={() => this.handleMarketSelect(market)}
                  style={{
                    backgroundColor: index % 2 === 0 ?
                      (theme === 'dark' ? '#0F1116' : '#FFFFFF') :
                      (theme === 'dark' ? '#1A1D24' : '#F8F9FA'),
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2D323D' : '#F1F3F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ?
                      (theme === 'dark' ? '#0F1116' : '#FFFFFF') :
                      (theme === 'dark' ? '#1A1D24' : '#F8F9FA');
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: textColor,
                          lineHeight: '1.4'
                        }}>
                          {market.title}
                        </span>
                        {renderResolutionBadge(market.resolution)}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          color: secondaryTextColor,
                          padding: '2px 6px',
                          backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                          borderRadius: '3px'
                        }}>
                          {market.category}
                        </span>
                        {market.tags.slice(1).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            style={{
                              fontSize: '10px',
                              color: secondaryTextColor,
                              padding: '1px 4px',
                              border: `1px solid ${borderColor}`,
                              borderRadius: '2px'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: textColor
                    }}>
                      {this.formatNumber(market.volume)}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: textColor
                    }}>
                      {this.formatNumber(market.liquidity)}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '13px',
                      color: textColor
                    }}>
                      {this.formatDate(market.endDate)}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {renderProbabilityBar(market.probability)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          color: secondaryTextColor,
                          minWidth: '20px'
                        }}>
                          YES:
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme === 'dark' ? '#2E8B57' : '#238551'
                        }}>
                          ${market.yesPrice.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          color: secondaryTextColor,
                          minWidth: '20px'
                        }}>
                          NO:
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme === 'dark' ? '#DC143C' : '#C7223A'
                        }}>
                          ${market.noPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  render() {
    const { theme, containerHeight, isCollapsed, isDetailDrawerOpen } = this.state;
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#F8F9FA';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';

    return (
      <div
        ref={this.containerRef}
        style={{
          height: containerHeight,
          backgroundColor,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden'
        }}
      >
        <style>{this.applyGlobalTheme()}</style>

        <div
          style={{
            width: isCollapsed ? '60px' : '280px',
            backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
            borderRight: `1px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          {this.renderLogoSection()}
          <div style={{ flex: 1, overflow: 'auto' }} className="global-scrollbar">
            {this.renderMenuContent()}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0
          }}
        >
          {this.renderVolumeStats()}
          {this.renderFilterButtons()}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {this.renderMarketTable()}
          </div>
        </div>

        {isDetailDrawerOpen && this.renderMarketDetailDrawer()}
      </div>
    );
  }
}

export default PredictionMarketPage;