import React from "react";
import {
  Menu,
  MenuItem,
  Icon,
  Button
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";

interface MarketDataTableProps {
  children?: React.ReactNode;
}

interface MarketDataTableState {
  theme: 'dark' | 'light';
  containerHeight: number;
  selectedMenu: string;
  selectedSubMenu: string;
  selectedOption: string;
  expandedMenus: Set<string>;
  isCollapsed: boolean;
}

class MarketDataTable extends React.Component<MarketDataTableProps, MarketDataTableState> {
  private unsubscribe: (() => void) | null = null;
  private containerRef: React.RefObject<HTMLDivElement | null>;
  private resizeObserver: ResizeObserver | null = null;

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

  constructor(props: MarketDataTableProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement | null>();
    this.state = {
      theme: themeManager.getTheme(),
      containerHeight: 0,
      selectedMenu: 'watchlist',
      selectedSubMenu: 'multidimensional',
      selectedOption: 'option1',
      expandedMenus: new Set(['watchlist']),
      isCollapsed: false
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
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: primaryColor,
            padding: '8px 12px'
          }}>
            Menu
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
            backgroundColor: backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme === 'dark' ? '#5A6270' : '#A8AFB8',
            fontSize: '16px',
            height: '100%',
            overflow: 'auto'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Icon icon="application" size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <div style={{ fontSize: '18px', marginBottom: '8px' }}></div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MarketDataTable;