import React from 'react';
import {
  Button,
  Popover,
  Menu,
  MenuItem,
  Switch
} from '@blueprintjs/core';
import { themeManager } from '../../globals/theme/ThemeManager';
import { withRouter } from '../../WithRouter';
import pages from '../../globals/config/pages.json';
import { handleCloseWindow, handleMaximizeWindow, handleMinimizeWindow, handleRecoveryWindow } from '../../globals/commands/SystemCommand';

interface MenuItemData {
  key: string;
  label: string;
  children?: MenuItemData[];
}

interface TopMenuBarState {
  theme: 'dark' | 'light';
  windowWidth: number;
  isMaximized: boolean;
}

interface TopMenuBarProps {
  navigate: (path: string, options?: any) => void;
}

class TopMenuBar extends React.Component<TopMenuBarProps, TopMenuBarState> {
  private unsubscribe: (() => void) | null = null;
  constructor(props: TopMenuBarProps) {
    super(props);
    this.state = {
      theme: themeManager.getTheme(),
      windowWidth: window.innerWidth,
      isMaximized: false,
    };
  }

  handleMinimizeWindowButtonClick = () => {
    handleMinimizeWindow();
  }

  handleMaximizeOrRecoveryWindowButtonClick = () => {
    if (this.state.isMaximized) {
      handleRecoveryWindow();
      this.setState({ isMaximized: false });
    } else {
      handleMaximizeWindow();
      this.setState({ isMaximized: true });
    }
  }

  handleCloseWindowButtonClick = () => {
    handleCloseWindow();
  }

  toPage = (page: string) => {
    this.props.navigate(page);
  }

  handleResize = () => {
    this.setState({ windowWidth: window.innerWidth });
  };
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.unsubscribe = themeManager.subscribe((theme) => {
      this.setState({ theme });
    });
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  applyTheme = (theme: 'dark' | 'light') => {
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      html.classList.add('bp4-dark');
      html.classList.remove('bp4-light');
      body.style.backgroundColor = '#1C2127';
      body.style.color = '#F5F8FA';
    } else {
      html.classList.add('bp4-light');
      html.classList.remove('bp4-dark');
      body.style.backgroundColor = '#FFFFFF';
      body.style.color = '#182026';
    }
  };

  menuItems: MenuItemData[] = [
    {
      key: 'system', label: 'Sytem', children: [
        { key: 'login', label: 'login' }, { key: 'logout', label: 'logout' }
      ]
    },
    {
      key: 'quotes', label: 'quotes', children: [
        { key: 'self-selected', label: 'self-selected' }, { key: 'market-overview', label: 'market-overview' }
      ]
    },
    {
      key: 'market', label: 'market', children: [
        { key: 'kline-chart', label: 'kline-chart' }, { key: 'depth-chart', label: 'depth-chart' }
      ]
    },
    {
      key: 'analysis', label: 'analysis', children: [
        { key: 'company-analysis', label: 'company-analysis' }, { key: 'industry-analysis', label: 'industry-analysis' }
      ]
    },
    {
      key: 'trade', label: 'trade', children: [
        { key: 'stock-trade', label: 'stock-trade' }, { key: 'futures-trade', label: 'futures-trade' }
      ]
    },
    {
      key: 'ai', label: 'AI', children: [
        { key: 'ai-analysis', label: 'ai-analysis' }, { key: 'strategy-backtest', label: 'strategy-backtest' }
      ]
    },
    {
      key: 'tools', label: 'tools', children: [
        { key: 'calculator', label: 'calculator' }, { key: 'notepad', label: 'notepad' }
      ]
    },
    {
      key: 'news', label: 'news', children: [
        { key: 'financial-news', label: 'financial-news' }, { key: 'announcement', label: 'announcement' }
      ]
    },
    {
      key: 'help', label: 'help', children: [
        { key: 'user-manual', label: 'user-manual' }, { key: 'shortcut-keys', label: 'shortcut-keys' }
      ]
    },
    {
      key: 'decision', label: 'decision', children: [
        { key: 'investment-advice', label: 'investment-advice' }, { key: 'portfolio-manage', label: 'portfolio-manage' }
      ]
    }
  ];

  toggleTheme = () => {
    themeManager.toggleTheme();
    setTimeout(() => {
    }, 100);
  };

  renderDropdownMenu = (items: MenuItemData[]) => (
    <Menu style={{ minWidth: '120px', fontSize: '12px', marginTop: '0' }}>
      {items.map((item) => (
        <MenuItem
          key={item.key}
          text={item.label}
          style={{ fontSize: '12px', padding: '4px 12px' }}
        />
      ))}
    </Menu>
  );

  getVisibleMenuItems = () => {
    const { windowWidth } = this.state;
    const rightControlsWidth = 220;
    const availableWidth = windowWidth - rightControlsWidth;
    const itemWidth = 45;
    const maxVisibleItems = Math.floor(availableWidth / itemWidth);
    return this.menuItems.slice(0, Math.max(3, Math.min(10, maxVisibleItems)));
  };

  shouldShowCenterTitle = () => {
    const { windowWidth } = this.state;
    return windowWidth > 700;
  };

  static defaultProps = {
    title: '✨ Luminliquid',
  }

  render() {
    const { theme } = this.state;
    const visibleMenuItems = this.getVisibleMenuItems();
    const showCenterTitle = this.shouldShowCenterTitle();
    const { title } = this.props;

    return (
      <div
        className={`custom-top-navbar ${theme === 'dark' ? 'bp4-dark' : 'bp4-light'}`}
        style={{
          width: '100%',
          minWidth: '400px',
          backgroundColor: theme === 'dark' ? '#1C2127' : '#FFFFFF',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
          position: 'relative'
        }}
      >
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          height: '30px',
          paddingLeft: '8px',
          overflow: 'hidden',
          minWidth: '150px'
        }}>
          {visibleMenuItems.map((item) => (
            <div key={item.key} style={{ position: 'relative', display: 'inline-block' }}>
              <Popover
                content={this.renderDropdownMenu(item.children || [])}
                position="bottom"
                minimal
                hoverOpenDelay={0}
                interactionKind="hover-target"
                modifiers={{
                  offset: { enabled: true, options: { offset: [0, 0] } },
                  preventOverflow: { enabled: true, options: { boundary: document.body } }
                }}
                popoverClassName="menu-popover"
              >
                <Button
                  minimal
                  text={item.label}
                  style={{
                    fontSize: '12px',
                    padding: '0 10px',
                    height: '30px',
                    minHeight: '30px',
                    lineHeight: '30px',
                    margin: '0 1px',
                    borderRadius: '0',
                    border: 'none',
                    outline: 'none',
                    color: theme === 'dark' ? '#F5F8FA' : '#182026',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  className="menu-button"
                />
              </Popover>
            </div>
          ))}
          {visibleMenuItems.length < this.menuItems.length && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Popover
                content={this.renderDropdownMenu(
                  this.menuItems.slice(visibleMenuItems.length)
                )}
                position="bottom"
                minimal
                hoverOpenDelay={0}
                interactionKind="hover-target"
                modifiers={{
                  offset: { enabled: true, options: { offset: [0, 0] } },
                  preventOverflow: { enabled: true, options: { boundary: document.body } }
                }}
                popoverClassName="menu-popover"
              >
                <Button
                  minimal
                  text="..."
                  style={{
                    fontSize: '12px',
                    padding: '0 8px',
                    height: '30px',
                    minHeight: '30px',
                    lineHeight: '30px',
                    margin: '0 1px',
                    borderRadius: '0',
                    border: 'none',
                    outline: 'none',
                    color: theme === 'dark' ? '#F5F8FA' : '#182026'
                  }}
                />
              </Popover>
            </div>
          )}
        </div>
        {showCenterTitle && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: theme === 'dark' ? '#F5F8FA' : '#182026',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1
          }}>
            {title}
          </div>
        )}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          height: '30px',
          paddingRight: '8px',
          minWidth: '220px',
          backgroundColor: 'inherit',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '12px',
            fontSize: '12px',
            height: '22px',
            color: theme === 'dark' ? '#F5F8FA' : '#182026'
          }}>
            <Switch
              checked={theme === 'light'}
              onChange={this.toggleTheme}
              style={{ margin: 0 }}
              className="no-switch-focus"
            />
          </div>
          <Button
            minimal
            onClick={() => this.toPage(pages.profile.path)}
            icon="user"
            text="Profile"
            style={{
              height: '30px',
              minHeight: '30px',
              padding: '0 8px',
              margin: '0 4px',
              fontSize: '12px',
              color: theme === 'dark' ? '#F5F8FA' : '#182026',
              border: 'none',
              outline: 'none'
            }}
          />
          <Button
            minimal
            onClick={() => this.handleMinimizeWindowButtonClick()}
            icon="minus"
            style={{
              height: '30px',
              width: '28px',
              minHeight: '30px',
              minWidth: '28px',
              padding: 0,
              margin: '0 1px',
              color: theme === 'dark' ? '#F5F8FA' : '#182026',
              border: 'none',
              outline: 'none'
            }}
          />
          <Button
            minimal
            onClick={() => this.handleMaximizeOrRecoveryWindowButtonClick()}
            icon={this.state.isMaximized ? "minimize" : "square"}
            style={{
              height: '30px',
              width: '28px',
              minHeight: '30px',
              minWidth: '28px',
              padding: 0,
              margin: '0 1px',
              color: theme === 'dark' ? '#F5F8FA' : '#182026',
              border: 'none',
              outline: 'none'
            }}
          />
          <Button
            minimal
            onClick={() => this.handleCloseWindowButtonClick()}
            icon="cross"
            style={{
              height: '30px',
              width: '28px',
              minHeight: '30px',
              minWidth: '28px',
              padding: 0,
              margin: '0 1px',
              color: theme === 'dark' ? '#F5F8FA' : '#182026',
              border: 'none',
              outline: 'none'
            }}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(TopMenuBar);