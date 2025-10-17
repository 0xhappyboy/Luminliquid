import React from "react";
import {
  Menu,
  MenuItem,
  Icon,
  Button
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";

interface MarketPageProps {
  children?: React.ReactNode;
}

interface MarketPageState {
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
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  icon: string;
}

class MarketPage extends React.Component<MarketPageProps, MarketPageState> {
  private unsubscribe: (() => void) | null = null;
  private containerRef: React.RefObject<HTMLDivElement | null>;
  private tableContainerRef: React.RefObject<HTMLDivElement | null>;
  private resizeObserver: ResizeObserver | null = null;
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  private menuData = [
    {
      key: 'watchlist',
      icon: 'star',
      label: 'WatchList',
      children: [
        { key: 'multidimensional', label: 'Chart' },
        { key: 'dashboard', label: 'Dashbord' },
        { key: 'blockchain-rank', label: 'BlockchainRank' },
        { key: 'dex-rank', label: 'DEX Rank' },
        { key: 'new-pools', label: 'New Pools' }
      ]
    },
    {
      key: 'categories',
      icon: 'grouped-bar-chart',
      label: 'Class',
      children: [
        { key: 'ai-agents', label: 'AI' }
      ]
    },
    {
      key: 'chains',
      icon: 'graph',
      label: 'Chains',
      children: [
        { key: 'kasplex', label: 'Kasplex' },
        { key: 'gate-layer', label: 'Gate Layer' },
        { key: 'bnb-chain', label: 'BNB Chain' },
        { key: 'solana', label: 'Solana' },
        { key: 'ethereum', label: 'Ethereum' },
        { key: 'base', label: 'Base' },
        { key: 'arbitrum', label: 'Arbitrum' },
        { key: 'sul-network', label: 'Sul Network' },
        { key: 'hyperliquid', label: 'Hyperliquid' }
      ]
    }
  ];

  private filterGroups = [
    {
      key: 'trending',
      label: 'Trending',
      icon: 'trending-up',
      subButtons: [
        { key: '5m', label: '5M' },
        { key: '1h', label: '1H' },
        { key: '6h', label: '6H' },
        { key: '24h', label: '24H' }
      ]
    },
    {
      key: 'gainers',
      label: 'Gainers',
      icon: 'arrow-up',
      subButtons: [
        { key: '5m', label: '5M' },
        { key: '1h', label: '1H' },
        { key: '6h', label: '6H' },
        { key: '24h', label: '24H' }
      ]
    },
    {
      key: 'volume',
      label: 'Top Volume',
      icon: 'chart',
      subButtons: [
        { key: '5m', label: '5M' },
        { key: '1h', label: '1H' },
        { key: '6h', label: '6H' },
        { key: '24h', label: '24H' }
      ]
    },
    {
      key: 'txns',
      label: 'Txns',
      icon: 'exchange',
      subButtons: []
    },
    {
      key: 'new-pairs',
      label: 'New Pairs',
      icon: 'new-object',
      subButtons: []
    }
  ];

  private timeOptions = [
    { key: '5m', label: 'Last 5 minutes' },
    { key: '1h', label: 'Last hour' },
    { key: '6h', label: 'Last 6 hours' },
    { key: '24h', label: 'Last 24 hours' }
  ];


  private filterOptions = [
    { key: 'trending-1h', label: 'Trending 1H', icon: 'trending-up' },
    { key: 'trending-6h', label: 'Trending 6H', icon: 'trending-up' },
    { key: 'trending-24h', label: 'Trending 24H', icon: 'trending-up' },
    { key: 'top-gainers', label: 'Top Gainers', icon: 'arrow-up' },
    { key: 'new-pairs', label: 'New Pairs', icon: 'new-object' }
  ];

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
      console.log('Sub button clicked:', filterKey, subKey);
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
              borderRadius: '6px',
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
                borderRadius: '6px',
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
                  borderRadius: '6px',
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
                      borderRadius: '6px',
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
                placeholder="Search..."
                style={{
                  padding: '8px 12px 8px 30px',
                  fontSize: '13px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
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

  private generateMarketData = (): MarketData[] => {
    const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX", "AMD", "INTC"];
    const names = ["Apple", "Google", "Microsoft", "Amazon", "Tesla", "Meta", "NVIDIA", "Netflix", "AMD", "Intel"];
    const icons = ["mobile-phone", "globe", "desktop", "shopping-cart", "car", "people", "chip", "video", "ring", "office"];

    const data: MarketData[] = [];

    for (let i = 0; i < 1000; i++) {
      const symbolIndex = i % symbols.length;
      const basePrice = 50 + Math.random() * 450;
      const change = (Math.random() - 0.5) * 10;
      const changePercent = (change / basePrice) * 100;

      data.push({
        symbol: symbols[symbolIndex] + (Math.floor(i / symbols.length) > 0 ? `-${Math.floor(i / symbols.length)}` : ""),
        name: names[symbolIndex],
        price: basePrice,
        change: change,
        changePercent: changePercent,
        volume: Math.random() * 100000000,
        marketCap: Math.random() * 500000000000,
        icon: icons[symbolIndex]
      });
    }

    return data;
  };

  private marketData: MarketData[] = this.generateMarketData();

  constructor(props: MarketPageProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement | null>();
    this.tableContainerRef = React.createRef<HTMLDivElement | null>();
    this.state = {
      theme: themeManager.getTheme(),
      containerHeight: 0,
      selectedMenu: 'watchlist',
      selectedSubMenu: 'multidimensional',
      selectedOption: 'option1',
      expandedMenus: new Set(['watchlist']),
      isCollapsed: false,
      currentPage: 0,
      tableHeaderFixed: false,
      selectedFilter: '',
      expandedFilter: null,
      selectedTime: '24h'
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

  private updatePrices = (): void => {
    this.marketData = this.marketData.map(item => {
      const randomChange = (Math.random() - 0.5) * 2;
      const newPrice = Math.max(0.01, item.price + randomChange);
      const change = newPrice - (item.price - item.change);
      const changePercent = (change / (item.price - item.change)) * 100;

      return {
        ...item,
        price: newPrice,
        change: change,
        changePercent: changePercent
      };
    });

    this.forceUpdate();
  };

  componentDidMount() {
    this.updateContainerHeight();
    window.addEventListener('resize', this.debouncedResize);
    this.unsubscribe = themeManager.subscribe(this.handleThemeChange);

    if (this.containerRef.current?.parentElement) {
      this.resizeObserver = new ResizeObserver(this.updateContainerHeight);
      this.resizeObserver.observe(this.containerRef.current.parentElement);
    }


    this.priceUpdateInterval = setInterval(this.updatePrices, 2000);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResize);
    if (this.unsubscribe) this.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
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
              $10.010B
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
              24H TXNS:
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: textColor
            }}>
              25,658,288
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
              LATEST BLOCK:
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: textColor
            }}>
              374,033,085
            </span>
            <span style={{
              fontSize: '12px',
              color: secondaryTextColor
            }}>
              2s ago
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
            borderRadius: '6px',
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
            title="OpenMenu">
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
            fontSize: '14px',
            fontWeight: '600',
            color: primaryColor,
            padding: '8px 12px'
          }}>

          </div>
          <Button
            minimal
            icon="double-chevron-left"
            onClick={this.toggleDrawer}
            style={{
              padding: '4px',
              borderRadius: '4px',
              color: primaryColor
            }}
            title="CloseMenu"
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {[
            { key: 'option1', label: 'Chart', icon: 'chart' },
            { key: 'option2', label: 'Dashboard', icon: 'dashboard' },
            { key: 'option3', label: 'MarketAnalysis', icon: 'timeline-line-chart' }
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
                borderRadius: '6px',
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
                borderRadius: '0 4px 4px 0'
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
            <div key={menu.key} style={{ marginBottom: '4px' }}>
              <div
                onClick={() => this.handleMenuSelect(menu.key)}
                className={`menu-item menu-item-hover ${selectedMenu === menu.key ? 'menu-item-selected' : ''}`}
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
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
                  borderRadius: '0 6px 6px 0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    icon={menu.icon as any}
                    size={14}
                    color={selectedMenu === menu.key ? primaryColor : undefined}
                  />
                  <span style={{ fontSize: '14px' }}>{menu.label}</span>
                </div>
                {hasChildren && (
                  <Icon
                    icon={isExpanded ? "chevron-down" : "chevron-right"}
                    size={12}
                    color={selectedMenu === menu.key ? primaryColor : textColor}
                    style={{
                      transition: 'transform 0.2s ease',
                      opacity: 0.7
                    }}
                  />
                )}
              </div>

              {hasChildren && isExpanded && (
                <div style={{ marginTop: '2px' }}>
                  {menu.children.map((child) => (
                    <div
                      key={child.key}
                      onClick={() => this.handleMenuSelect(menu.key, child.key)}
                      className={`menu-item menu-item-hover ${selectedSubMenu === child.key ? 'menu-item-selected' : ''}`}
                      tabIndex={0}
                      style={{
                        padding: '8px 16px 8px 36px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        backgroundColor: selectedSubMenu === child.key ?
                          (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
                        color: selectedSubMenu === child.key ?
                          (theme === 'dark' ? '#FFFFFF' : '#182026') : textColor,
                        borderRight: selectedSubMenu === child.key ? `3px solid ${primaryColor}` : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        margin: '1px 0',
                        outline: 'none',
                        borderRadius: '0 6px 6px 0'
                      }}
                    >
                      {child.label}
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
    const { theme, currentPage, tableHeaderFixed } = this.state;
    const itemsPerPage = 100;
    const startIndex = currentPage * itemsPerPage;
    const currentData = this.marketData.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(this.marketData.length / itemsPerPage);

    const tableBg = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const headerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const rowHoverBg = theme === 'dark' ? '#2D323D' : '#F8F9FA';
    const positiveColor = '#2E8B57';
    const negativeColor = '#DC143C';

    const headerClass = tableHeaderFixed ? 'fixed-header' : '';

    return (
      <div className="table-container">
        <div
          ref={this.tableContainerRef}
          onScroll={this.handleTableScroll}
          className="table-scroll-container global-scrollbar"
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
                  borderBottom: `1px solid ${borderColor}`
                }}>Symbol</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${borderColor}`
                }}>Name</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${borderColor}`
                }}>Price</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${borderColor}`
                }}>Change</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${borderColor}`
                }}>Change %</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${borderColor}`
                }}>Volume</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${borderColor}`
                }}>Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr
                  key={startIndex + index}
                  style={{
                    borderBottom: `1px solid ${borderColor}`,
                    height: '42px',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = rowHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tableBg;
                  }}
                >
                  <td style={{
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Icon
                      icon={item.icon as any}
                      size={14}
                      color={theme === 'dark' ? '#A7B6C2' : '#404854'}
                    />
                    <span style={{ fontWeight: '600' }}>{item.symbol}</span>
                  </td>
                  <td style={{ padding: '8px 16px' }}>{item.name}</td>
                  <td style={{
                    padding: '8px 16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td style={{
                    padding: '8px 16px',
                    textAlign: 'right',
                    color: item.change >= 0 ? positiveColor : negativeColor,
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    {item.change >= 0 ? '+' : ''}${Math.abs(item.change).toFixed(2)}
                  </td>
                  <td style={{
                    padding: '8px 16px',
                    textAlign: 'right',
                    color: item.changePercent >= 0 ? positiveColor : negativeColor,
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </td>
                  <td style={{
                    padding: '8px 16px',
                    textAlign: 'right',
                    fontFamily: 'monospace'
                  }}>
                    {this.formatNumber(item.volume)}
                  </td>
                  <td style={{
                    padding: '8px 16px',
                    textAlign: 'right',
                    fontFamily: 'monospace'
                  }}>
                    {this.formatNumber(item.marketCap)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div style={{
          padding: '5px 25px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: headerBg,
          flexShrink: 0
        }}>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, this.marketData.length)} of {this.marketData.length}
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
      </div>
    );
  };

  render() {
    const { containerHeight, theme, isCollapsed } = this.state;
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const sidebarBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';

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

        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          height: '100%'
        }}>
          <div
            style={{
              width: isCollapsed ? '60px' : '205px',
              backgroundColor: sidebarBg,
              borderRight: `1px solid ${borderColor}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
              height: '100%',
              transition: 'width 0.3s ease'
            }}
          >
            {this.renderLogoSection()}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0
              }}
              className="global-scrollbar"
            >
              {this.renderMenuContent()}
            </div>
            {!isCollapsed && (
              <div style={{
                padding: '12px 16px',
                borderTop: `1px solid ${borderColor}`,
                fontSize: '11px',
                opacity: 0.7,
                flexShrink: 0
              }}>
                <div style={{ marginBottom: '4px' }}></div>
                <div>v1.0.0</div>
              </div>
            )}
          </div>


          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: backgroundColor,
            height: '100%',
            overflow: 'hidden',
            minWidth: 0
          }}>

            <div style={{ flexShrink: 0 }}>
              {this.renderVolumeStats()}
            </div>


            <div style={{ flexShrink: 0 }}>
              {this.renderFilterButtons()}
            </div>


            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden'
            }}>
              {this.renderMarketTable()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MarketPage;