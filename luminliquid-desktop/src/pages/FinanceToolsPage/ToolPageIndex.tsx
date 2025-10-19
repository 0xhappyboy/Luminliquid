import React from "react";
import {
  Menu,
  MenuItem,
  Icon,
  Button
} from "@blueprintjs/core";
import { themeManager } from "../../globals/theme/ThemeManager";

interface FinanceToolsPageIndexProps {
  children?: React.ReactNode;
}

interface FinanceToolsPageIndexState {
  theme: 'dark' | 'light';
  containerHeight: number;
  selectedMenu: string;
  selectedSubMenu: string;
  selectedTool: string;
  expandedMenus: Set<string>;
  isCollapsed: boolean;
  currentPage: number;
  tableHeaderFixed: boolean;
  selectedFilter: string;
  expandedFilter: string | null;
  selectedTime: string;
}

interface ToolData {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  popularity: number;
  lastUsed: string;
}

class FinanceToolsPageIndex extends React.Component<FinanceToolsPageIndexProps, FinanceToolsPageIndexState> {
  private unsubscribe: (() => void) | null = null;
  private containerRef: React.RefObject<HTMLDivElement | null>;
  private tableContainerRef: React.RefObject<HTMLDivElement | null>;
  private resizeObserver: ResizeObserver | null = null;

  private menuData = [
    {
      key: 'blockchain',
      icon: 'graph',
      label: 'Blockchain Tools',
      children: [
        { key: 'wallet-analyzer', label: 'Wallet Analyzer' },
        { key: 'token-scanner', label: 'Token Scanner' },
        { key: 'smart-contract', label: 'Smart Contract Analysis' },
        { key: 'gas-tracker', label: 'Gas Fee Tracker' },
        { key: 'defi-analytics', label: 'DeFi Analytics' },
        { key: 'nft-analyzer', label: 'NFT Analyzer' }
      ]
    },
    {
      key: 'stocks',
      icon: 'timeline-line-chart',
      label: 'Stock Tools',
      children: [
        { key: 'screener', label: 'Stock Screener' },
        { key: 'technical-analysis', label: 'Technical Analysis' },
        { key: 'fundamental-analysis', label: 'Fundamental Analysis' },
        { key: 'options-calculator', label: 'Options Calculator' },
        { key: 'dividend-analyzer', label: 'Dividend Analyzer' },
        { key: 'portfolio-backtest', label: 'Portfolio Backtest' }
      ]
    },
    {
      key: 'futures',
      icon: 'exchange',
      label: 'Futures Tools',
      children: [
        { key: 'margin-calculator', label: 'Margin Calculator' },
        { key: 'hedge-calculator', label: 'Hedge Calculator' },
        { key: 'volatility-analysis', label: 'Volatility Analysis' },
        { key: 'roll-yield-calculator', label: 'Roll Yield Calculator' },
        { key: 'term-structure', label: 'Term Structure Analysis' }
      ]
    },
    {
      key: 'forex',
      icon: 'dollar',
      label: 'Forex Tools',
      children: [
        { key: 'pip-calculator', label: 'Pip Calculator' },
        { key: 'position-size', label: 'Position Size Calculator' },
        { key: 'correlation-matrix', label: 'Correlation Matrix' },
        { key: 'carry-trade', label: 'Carry Trade Analysis' }
      ]
    },
    {
      key: 'crypto',
      icon: 'bitcoin',
      label: 'Cryptocurrency',
      children: [
        { key: 'arbitrage-finder', label: 'Arbitrage Finder' },
        { key: 'yield-farming', label: 'Yield Farming Calculator' },
        { key: 'staking-calculator', label: 'Staking Calculator' },
        { key: 'liquidity-pool', label: 'Liquidity Pool Analysis' }
      ]
    },
    {
      key: 'analytics',
      icon: 'predictive-analysis',
      label: 'Advanced Analytics',
      children: [
        { key: 'risk-management', label: 'Risk Management' },
        { key: 'portfolio-optimizer', label: 'Portfolio Optimizer' },
        { key: 'monte-carlo', label: 'Monte Carlo Simulation' },
        { key: 'black-scholes', label: 'Black-Scholes Model' },
        { key: 'var-calculator', label: 'VaR Calculator' }
      ]
    }
  ];

  private filterGroups = [
    {
      key: 'popularity',
      label: 'Popular Tools',
      icon: 'star',
      subButtons: [
        { key: 'all', label: 'All' },
        { key: 'high', label: 'High Popularity' },
        { key: 'medium', label: 'Medium' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      icon: 'grouped-bar-chart',
      subButtons: [
        { key: 'blockchain', label: 'Blockchain' },
        { key: 'stocks', label: 'Stocks' },
        { key: 'futures', label: 'Futures' },
        { key: 'forex', label: 'Forex' }
      ]
    },
    {
      key: 'complexity',
      label: 'Complexity',
      icon: 'layers',
      subButtons: [
        { key: 'beginner', label: 'Beginner' },
        { key: 'intermediate', label: 'Intermediate' },
        { key: 'advanced', label: 'Advanced' }
      ]
    },
    {
      key: 'recent',
      label: 'Recently Used',
      icon: 'history',
      subButtons: []
    },
    {
      key: 'favorites',
      label: 'Favorites',
      icon: 'heart',
      subButtons: []
    }
  ];

  private timeOptions = [
    { key: '1h', label: 'Last 1 Hour' },
    { key: '24h', label: 'Last 24 Hours' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' }
  ];

  private generateToolData = (): ToolData[] => {
    const tools: ToolData[] = [
      // Blockchain Tools
      { id: '1', name: 'Smart Contract Security Scan', category: 'blockchain', description: 'Detect security vulnerabilities and risks in smart contracts', icon: 'shield', popularity: 95, lastUsed: '2 hours ago' },
      { id: '2', name: 'Token Liquidity Analysis', category: 'blockchain', description: 'Analyze token liquidity and trading pairs in DEX', icon: 'flow-review', popularity: 88, lastUsed: '1 day ago' },
      { id: '3', name: 'Gas Optimization Calculator', category: 'blockchain', description: 'Calculate optimal gas fees and transaction timing', icon: 'gas-station', popularity: 92, lastUsed: '5 hours ago' },

      // Stock Tools
      { id: '4', name: 'Technical Indicator Analyzer', category: 'stocks', description: 'Comprehensive analysis and signal generation of multiple technical indicators', icon: 'chart', popularity: 89, lastUsed: '3 hours ago' },
      { id: '5', name: 'Fundamental Scoring System', category: 'stocks', description: 'Company fundamental assessment based on financial data', icon: 'document', popularity: 85, lastUsed: '1 day ago' },
      { id: '6', name: 'Options Strategy Builder', category: 'stocks', description: 'Visual construction and backtesting of options trading strategies', icon: 'polygon-filter', popularity: 78, lastUsed: '2 days ago' },

      // Futures Tools
      { id: '7', name: 'Futures Spread Analysis', category: 'futures', description: 'Analyze spreads and arbitrage opportunities between different contracts', icon: 'comparison', popularity: 82, lastUsed: '6 hours ago' },
      { id: '8', name: 'Margin Risk Monitoring', category: 'futures', description: 'Real-time monitoring of margin levels and risk exposure', icon: 'warning-sign', popularity: 91, lastUsed: '4 hours ago' },

      // Forex Tools
      { id: '9', name: 'Currency Pair Correlation Analysis', category: 'forex', description: 'Analyze correlations and联动 effects between currency pairs', icon: 'git-repo', popularity: 76, lastUsed: '3 days ago' },
      { id: '10', name: 'Economic Calendar Analyzer', category: 'forex', description: 'Analysis tool for economic events impact on exchange rates', icon: 'calendar', popularity: 84, lastUsed: '1 day ago' },

      // Cryptocurrency Tools
      { id: '11', name: 'Cross-Exchange Arbitrage', category: 'crypto', description: 'Discover price difference opportunities across different exchanges', icon: 'arrows-horizontal', popularity: 90, lastUsed: '2 hours ago' },
      { id: '12', name: 'DeFi Yield Comparison', category: 'crypto', description: 'Compare yields and risks of different DeFi protocols', icon: 'percentage', popularity: 87, lastUsed: '8 hours ago' },

      // Advanced Analytics Tools
      { id: '13', name: 'Portfolio Risk Analysis', category: 'analytics', description: 'Multi-asset portfolio risk measurement and stress testing', icon: 'pie-chart', popularity: 83, lastUsed: '1 day ago' },
      { id: '14', name: 'Monte Carlo Simulator', category: 'analytics', description: 'Investment return prediction based on stochastic simulation', icon: 'random', popularity: 79, lastUsed: '2 days ago' },
      { id: '15', name: 'VaR Risk Calculation', category: 'analytics', description: 'Calculate Value at Risk and Expected Shortfall', icon: 'calculator', popularity: 86, lastUsed: '6 hours ago' }
    ];

    return tools;
  };

  private toolData: ToolData[] = this.generateToolData();

  constructor(props: FinanceToolsPageIndexProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement | null>();
    this.tableContainerRef = React.createRef<HTMLDivElement | null>();
    this.state = {
      theme: themeManager.getTheme(),
      containerHeight: 0,
      selectedMenu: 'blockchain',
      selectedSubMenu: 'wallet-analyzer',
      selectedTool: '',
      expandedMenus: new Set(['blockchain']),
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
      
      .tool-card {
        transition: all 0.2s ease;
        border-radius: 6px;
        cursor: pointer;
      }
      
      .tool-card:hover {
        background-color: ${hoverBgColor} !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
      }
      
      .tool-card.selected {
        background-color: ${selectedBgColor} !important;
        border-color: ${primaryColor} !important;
        color: ${theme === 'dark' ? '#FFFFFF' : '#182026'} !important;
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

  private handleToolSelect = (toolId: string) => {
    this.setState({ selectedTool: toolId });
  };

  private toggleDrawer = () => {
    this.setState(prevState => ({
      isCollapsed: !prevState.isCollapsed
    }));
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
            title="Expand Menu">
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
            Financial Tools Center
          </div>
          <Button
            minimal
            icon="double-chevron-left"
            onClick={this.toggleDrawer}
            style={{
              padding: '4px',
              color: primaryColor
            }}
            title="Collapse Menu"
          />
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

  private renderToolCards = () => {
    const { theme, selectedTool } = this.state;
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    const filteredTools = this.toolData.filter(tool => {
      if (this.state.selectedFilter) {
        const [filterType, filterValue] = this.state.selectedFilter.split('-');
        switch (filterType) {
          case 'category':
            return tool.category === filterValue;
          case 'popularity':
            if (filterValue === 'high') return tool.popularity >= 85;
            if (filterValue === 'medium') return tool.popularity >= 70 && tool.popularity < 85;
            return true;
          default:
            return true;
        }
      }
      return true;
    });

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        padding: '16px',
        overflow: 'auto'
      }}>
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={`tool-card ${selectedTool === tool.id ? 'selected' : ''}`}
            onClick={() => this.handleToolSelect(tool.id)}
            style={{
              padding: '16px',
              border: `1px solid ${borderColor}`,
              backgroundColor: cardBg,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon
                    icon={tool.icon as any}
                    size={14}
                    color={theme === 'dark' ? '#A7B6C2' : '#404854'}
                  />
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: textColor,
                    marginBottom: '2px'
                  }}>
                    {tool.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: secondaryTextColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {tool.category}
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: secondaryTextColor
              }}>
                <Icon icon="star" size={10} />
                <span>{tool.popularity}%</span>
              </div>
            </div>

            <div style={{
              fontSize: '12px',
              color: secondaryTextColor,
              lineHeight: '1.4',
              marginBottom: '12px',
              minHeight: '34px'
            }}>
              {tool.description}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: secondaryTextColor
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon icon="time" size={10} />
                <span>{tool.lastUsed}</span>
              </div>
              <div style={{
                padding: '2px 6px',
                backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                borderRadius: '3px',
                fontSize: '10px',
                color: secondaryTextColor
              }}>
                ID: {tool.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  private renderTable = () => {
    const { theme, tableHeaderFixed } = this.state;
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const headerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    const columns = [
      { key: 'name', label: 'Tool Name', width: '25%' },
      { key: 'category', label: 'Category', width: '15%' },
      { key: 'description', label: 'Description', width: '35%' },
      { key: 'popularity', label: 'Popularity', width: '10%' },
      { key: 'lastUsed', label: 'Last Used', width: '15%' }
    ];

    const filteredTools = this.toolData.filter(tool => {
      if (this.state.selectedFilter) {
        const [filterType, filterValue] = this.state.selectedFilter.split('-');
        switch (filterType) {
          case 'category':
            return tool.category === filterValue;
          case 'popularity':
            if (filterValue === 'high') return tool.popularity >= 85;
            if (filterValue === 'medium') return tool.popularity >= 70 && tool.popularity < 85;
            return true;
          default:
            return true;
        }
      }
      return true;
    });

    return (
      <div className="table-container">
        <div
          className={`table-header ${tableHeaderFixed ? 'fixed-header' : ''}`}
          style={{
            display: 'flex',
            padding: '12px 16px',
            backgroundColor: headerBg,
            borderBottom: `1px solid ${borderColor}`,
            fontSize: '12px',
            fontWeight: '600',
            color: secondaryTextColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {columns.map(column => (
            <div
              key={column.key}
              style={{
                width: column.width,
                padding: '0 8px'
              }}
            >
              {column.label}
            </div>
          ))}
        </div>

        <div
          className="table-scroll-container global-scrollbar"
          ref={this.tableContainerRef}
          onScroll={this.handleTableScroll}
          style={{
            backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF'
          }}
        >
          {filteredTools.map((tool, index) => (
            <div
              key={tool.id}
              className={`table-row ${this.state.selectedTool === tool.id ? 'selected' : ''}`}
              onClick={() => this.handleToolSelect(tool.id)}
              style={{
                display: 'flex',
                padding: '12px 16px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: this.state.selectedTool === tool.id ?
                  (theme === 'dark' ? '#2D3746' : '#F1F5F9') :
                  (index % 2 === 0 ?
                    (theme === 'dark' ? '#0F1116' : '#FFFFFF') :
                    (theme === 'dark' ? '#14171F' : '#F8F9FA')),
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ width: '25%', padding: '0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon
                    icon={tool.icon as any}
                    size={12}
                    color={secondaryTextColor}
                  />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: textColor
                  }}>
                    {tool.name}
                  </span>
                </div>
              </div>

              <div style={{ width: '15%', padding: '0 8px' }}>
                <span style={{
                  fontSize: '12px',
                  color: secondaryTextColor,
                  textTransform: 'capitalize'
                }}>
                  {tool.category}
                </span>
              </div>

              <div style={{ width: '35%', padding: '0 8px' }}>
                <span style={{
                  fontSize: '12px',
                  color: secondaryTextColor,
                  lineHeight: '1.4'
                }}>
                  {tool.description}
                </span>
              </div>

              <div style={{ width: '10%', padding: '0 8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: tool.popularity >= 85 ? '#2E7D32' : tool.popularity >= 70 ? '#ED6C02' : '#D32F2F'
                }}>
                  <Icon icon="star" size={10} />
                  <span>{tool.popularity}%</span>
                </div>
              </div>

              <div style={{ width: '15%', padding: '0 8px' }}>
                <span style={{
                  fontSize: '12px',
                  color: secondaryTextColor
                }}>
                  {tool.lastUsed}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  render() {
    const { theme, containerHeight, isCollapsed } = this.state;
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#F8F9FA';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';

    return (
      <div
        ref={this.containerRef}
        style={{
          height: containerHeight,
          backgroundColor: backgroundColor,
          display: 'flex',
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
            flexShrink: 0
          }}
        >
          {this.renderLogoSection()}
          {this.renderMenuContent()}
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
          <div
            style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: '400px',
                backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                borderRight: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderBottom: `1px solid ${borderColor}`,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme === 'dark' ? '#E8EAED' : '#1A1D24',
                  flexShrink: 0
                }}
              >
                Financial Tools List
              </div>
              <div
                style={{
                  flex: 1,
                  overflow: 'auto'
                }}
                className="global-scrollbar"
              >
                {this.renderToolCards()}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF'
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderBottom: `1px solid ${borderColor}`,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme === 'dark' ? '#E8EAED' : '#1A1D24',
                  flexShrink: 0
                }}
              >
                Detailed View
              </div>
              <div
                style={{
                  flex: 1,
                  overflow: 'hidden'
                }}
              >
                {this.renderTable()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FinanceToolsPageIndex;