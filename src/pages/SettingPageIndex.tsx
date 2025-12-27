import React from "react";
import { themeManager } from "../globals/theme/ThemeManager";

interface SettingPageIndexProps {
  children?: React.ReactNode;
}

interface SettingPageIndexState {
  theme: 'dark' | 'light';
  language: 'en' | 'zh';
  klineMode: 'red-up' | 'green-up';
  notifications: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  priceAlerts: boolean;
  riskWarning: boolean;
  advancedCharts: boolean;
  compactMode: boolean;
  selectedMenu: string;
  isCollapsed: boolean;
}

class SettingPageIndex extends React.Component<SettingPageIndexProps, SettingPageIndexState> {
  private unsubscribe: (() => void) | null = null;
  private containerRef: React.RefObject<HTMLDivElement | null>;

  private menuItems = [
    {
      key: 'general',
      icon: '⚙️',
      label: 'General Settings',
      label_zh: '通用设置'
    },
    {
      key: 'trading',
      icon: '📈',
      label: 'Trading Preferences',
      label_zh: '交易偏好'
    },
    {
      key: 'appearance',
      icon: '🎨',
      label: 'Appearance',
      label_zh: '外观设置'
    },
    {
      key: 'notifications',
      icon: '🔔',
      label: 'Notifications',
      label_zh: '通知设置'
    },
    {
      key: 'security',
      icon: '🔒',
      label: 'Security',
      label_zh: '安全设置'
    },
    {
      key: 'about',
      icon: 'ℹ️',
      label: 'About',
      label_zh: '关于'
    }
  ];

  private refreshIntervals = [
    { value: 10, label: '10s' },
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 300, label: '5m' }
  ];

  private sessionTimeouts = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '240', label: '4 hours' }
  ];

  constructor(props: SettingPageIndexProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement | null>();
    this.state = {
      theme: themeManager.getTheme(),
      language: 'en',
      klineMode: 'red-up',
      notifications: true,
      soundEnabled: true,
      autoRefresh: true,
      refreshInterval: 30,
      priceAlerts: true,
      riskWarning: true,
      advancedCharts: false,
      compactMode: false,
      selectedMenu: 'general',
      isCollapsed: false
    };
  }

  private handleThemeChange = (theme: 'dark' | 'light'): void => {
    this.setState({ theme });
    themeManager.setTheme(theme);
  };

  private handleLanguageChange = (language: 'en' | 'zh') => {
    this.setState({ language });
  };

  private handleKlineModeChange = (klineMode: 'red-up' | 'green-up') => {
    this.setState({ klineMode });
  };

  private handleSwitchChange = (key: keyof SettingPageIndexState, value: boolean) => {
    this.setState({ [key]: value } as any);
  };

  private handleRefreshIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ refreshInterval: parseInt(e.target.value) });
  };

  private handleMenuSelect = (menuKey: string) => {
    this.setState({ selectedMenu: menuKey });
  };

  private toggleDrawer = () => {
    this.setState(prevState => ({
      isCollapsed: !prevState.isCollapsed
    }));
  };

  private resetToDefaults = () => {
    this.setState({
      language: 'en',
      klineMode: 'red-up',
      notifications: true,
      soundEnabled: true,
      autoRefresh: true,
      refreshInterval: 30,
      priceAlerts: true,
      riskWarning: true,
      advancedCharts: false,
      compactMode: false
    });
  };

  componentDidMount() {
    this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
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
      .settings-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .settings-scrollbar::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        border-radius: 3px;
      }
      
      .settings-scrollbar::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 3px;
      }
      
      .settings-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
      }
      
      .settings-menu-item {
        transition: all 0.2s ease;
        cursor: pointer;
        outline: none;
      }
      
      .settings-menu-item:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .settings-menu-item.selected {
        background-color: ${selectedBgColor} !important;
        border-right: 3px solid ${primaryColor} !important;
      }
      
      .settings-menu-item:focus {
        outline: none !important;
        box-shadow: ${focusShadow} !important;
      }
      
      .settings-card {
        background: ${theme === 'dark' ? '#1A1D24' : '#FFFFFF'};
        border: 1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'};
        border-radius: 8px;
        transition: all 0.2s ease;
      }
      
      .settings-card:hover {
        border-color: ${theme === 'dark' ? '#3C4858' : '#C4C9D1'};
      }
      
      .kline-preview {
        border: 1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'};
        border-radius: 4px;
        overflow: hidden;
      }
      
      .kline-up {
        background-color: ${theme === 'dark' ? '#2E8B57' : '#90EE90'};
      }
      
      .kline-down {
        background-color: ${theme === 'dark' ? '#DC143C' : '#FFB6C1'};
      }

      .settings-select {
        background: ${theme === 'dark' ? '#1A1D24' : '#FFFFFF'};
        border: 1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'};
        color: ${theme === 'dark' ? '#E8EAED' : '#1A1D24'};
        padding: 8px 12px;
        border-radius: 4px;
        outline: none;
        min-width: 100px;
        font-size: 13px;
      }

      .settings-select:focus {
        border-color: ${focusColor};
        box-shadow: ${focusShadow};
      }

      .settings-button {
        padding: 8px 16px;
        border: 1px solid ${theme === 'dark' ? '#2D323D' : '#E1E5E9'};
        background: ${theme === 'dark' ? '#1A1D24' : '#FFFFFF'};
        color: ${theme === 'dark' ? '#E8EAED' : '#1A1D24'};
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s ease;
      }

      .settings-button:hover {
        background: ${theme === 'dark' ? '#2D3746' : '#F1F3F5'};
      }

      .settings-button.primary {
        background: ${primaryColor};
        color: ${theme === 'dark' ? '#0F1116' : '#FFFFFF'};
        border-color: ${primaryColor};
      }

      .settings-button.warning {
        background: ${theme === 'dark' ? '#DB3737' : '#FF7373'};
        color: white;
        border-color: ${theme === 'dark' ? '#DB3737' : '#FF7373'};
      }

      .switch-container {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }

      .switch-checkbox {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .switch-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${theme === 'dark' ? '#2D323D' : '#E1E5E9'};
        transition: .4s;
        border-radius: 24px;
      }

      .switch-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      .switch-checkbox:checked + .switch-slider {
        background-color: ${primaryColor};
      }

      .switch-checkbox:checked + .switch-slider:before {
        transform: translateX(20px);
      }

      .radio-container {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .radio-input {
        display: none;
      }

      .radio-custom {
        width: 16px;
        height: 16px;
        border: 2px solid ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 50%;
        position: relative;
        transition: all 0.2s ease;
      }

      .radio-input:checked + .radio-custom {
        border-color: ${primaryColor};
      }

      .radio-input:checked + .radio-custom:after {
        content: '';
        width: 8px;
        height: 8px;
        background: ${primaryColor};
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    `;
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
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.background = theme === 'dark' ? '#3C4858' : '#E1E5E9';
              e.currentTarget.style.borderColor = primaryColor;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.background = theme === 'dark' ? '#2D323D' : '#F1F5F9';
              e.currentTarget.style.borderColor = theme === 'dark' ? '#3A4250' : '#E1E5E9';
            }}
            title="Open Menu">
            ≡
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
            {this.state.language === 'en' ? 'Settings' : '设置'}
          </div>
          <button
            onClick={this.toggleDrawer}
            className="settings-button"
            style={{
              padding: '4px 8px',
              minWidth: 'auto'
            }}
            title="Close Menu"
          >
            ‹‹
          </button>
        </div>
      </div>
    );
  };

  private renderMenuContent = () => {
    const { theme, selectedMenu, isCollapsed, language } = this.state;
    const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

    if (isCollapsed) {
      return (
        <div style={{ padding: '8px 0' }}>
          {this.menuItems.map((menu) => (
            <div
              key={menu.key}
              onClick={() => this.handleMenuSelect(menu.key)}
              className={`settings-menu-item ${selectedMenu === menu.key ? 'selected' : ''}`}
              tabIndex={0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: selectedMenu === menu.key ?
                  (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
                borderRight: selectedMenu === menu.key ? `3px solid ${primaryColor}` : '3px solid transparent',
                color: selectedMenu === menu.key ?
                  (theme === 'dark' ? '#FFFFFF' : '#182026') : textColor,
                marginBottom: '4px',
              }}
              title={language === 'en' ? menu.label : menu.label_zh}
            >
              {menu.icon}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ padding: '12px 0' }}>
        {this.menuItems.map((menu) => (
          <div
            key={menu.key}
            onClick={() => this.handleMenuSelect(menu.key)}
            className={`settings-menu-item ${selectedMenu === menu.key ? 'selected' : ''}`}
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: selectedMenu === menu.key ?
                (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
              borderRight: selectedMenu === menu.key ? `3px solid ${primaryColor}` : '3px solid transparent',
              color: selectedMenu === menu.key ?
                (theme === 'dark' ? '#FFFFFF' : '#182026') : textColor,
              marginBottom: '2px',
            }}
          >
            <span>{menu.icon}</span>
            <span>{language === 'en' ? menu.label : menu.label_zh}</span>
          </div>
        ))}
      </div>
    );
  };

  private CustomSwitch = ({ checked, onChange, id }: { checked: boolean; onChange: (checked: boolean) => void; id: string }) => {
    return (
      <label className="switch-container">
        <input
          type="checkbox"
          className="switch-checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          id={id}
        />
        <span className="switch-slider" />
      </label>
    );
  };

  private CustomRadio = ({ checked, onChange, value, label, name }: { checked: boolean; onChange: (value: string) => void; value: string; label: string; name: string }) => {
    return (
      <label className="radio-container">
        <input
          type="radio"
          className="radio-input"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="radio-custom" />
        <span>{label}</span>
      </label>
    );
  };

  private renderGeneralSettings = () => {
    const { theme, language, autoRefresh, refreshInterval, soundEnabled, compactMode } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: textColor, marginBottom: '20px' }}>
            {language === 'en' ? 'General Settings' : '通用设置'}
          </h3>
          
          <div className="settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'en' ? 'Language' : '语言设置'}
                </div>
                <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Choose your preferred language' : '选择您偏好的语言'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <this.CustomRadio
                  name="language"
                  value="en"
                  label="English"
                  checked={language === 'en'}
                  onChange={(value) => this.handleLanguageChange(value as 'en' | 'zh')}
                />
                <this.CustomRadio
                  name="language"
                  value="zh"
                  label="中文"
                  checked={language === 'zh'}
                  onChange={(value) => this.handleLanguageChange(value as 'en' | 'zh')}
                />
              </div>
            </div>
          </div>

          <div className="settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'en' ? 'Auto Refresh' : '自动刷新'}
                </div>
                <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Automatically refresh market data' : '自动刷新市场数据'}
                </div>
              </div>
              <this.CustomSwitch
                checked={autoRefresh}
                onChange={(checked) => this.handleSwitchChange('autoRefresh', checked)}
                id="autoRefresh"
              />
            </div>

            {autoRefresh && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Refresh interval:' : '刷新间隔:'}
                </span>
                <select
                  value={refreshInterval}
                  onChange={this.handleRefreshIntervalChange}
                  className="settings-select"
                >
                  {this.refreshIntervals.map(interval => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'en' ? 'Sound Effects' : '音效设置'}
                </div>
                <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Enable sound notifications' : '启用声音通知'}
                </div>
              </div>
              <this.CustomSwitch
                checked={soundEnabled}
                onChange={(checked) => this.handleSwitchChange('soundEnabled', checked)}
                id="soundEnabled"
              />
            </div>
          </div>

          <div className="settings-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'en' ? 'Compact Mode' : '紧凑模式'}
                </div>
                <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Use compact layout for better space utilization' : '使用紧凑布局以更好地利用空间'}
                </div>
              </div>
              <this.CustomSwitch
                checked={compactMode}
                onChange={(checked) => this.handleSwitchChange('compactMode', checked)}
                id="compactMode"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  private renderTradingSettings = () => {
    const { theme, language, klineMode, priceAlerts, riskWarning } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: textColor, marginBottom: '20px' }}>
            {language === 'en' ? 'Trading Preferences' : '交易偏好'}
          </h3>
          
          <div className="settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                {language === 'en' ? 'K-line Color Scheme' : 'K线颜色方案'}
              </div>
              <div style={{ color: secondaryTextColor, fontSize: '13px', marginBottom: '15px' }}>
                {language === 'en' ? 'Choose your preferred color scheme for candlestick charts' : '选择您偏好的K线图颜色方案'}
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div>
                  <this.CustomRadio
                    name="klineMode"
                    value="red-up"
                    label={language === 'en' ? 'Red Up / Green Down' : '红涨绿跌'}
                    checked={klineMode === 'red-up'}
                    onChange={(value) => this.handleKlineModeChange(value as 'red-up' | 'green-up')}
                  />
                  <div className="kline-preview" style={{ marginTop: '8px', width: '120px', height: '60px' }}>
                    <div style={{ display: 'flex', height: '100%' }}>
                      <div className="kline-up" style={{ flex: 1, margin: '2px' }}></div>
                      <div className="kline-down" style={{ flex: 1, margin: '2px' }}></div>
                    </div>
                  </div>
                </div>
                <div>
                  <this.CustomRadio
                    name="klineMode"
                    value="green-up"
                    label={language === 'en' ? 'Green Up / Red Down' : '绿涨红跌'}
                    checked={klineMode === 'green-up'}
                    onChange={(value) => this.handleKlineModeChange(value as 'red-up' | 'green-up')}
                  />
                  <div className="kline-preview" style={{ marginTop: '8px', width: '120px', height: '60px' }}>
                    <div style={{ display: 'flex', height: '100%' }}>
                      <div className="kline-down" style={{ flex: 1, margin: '2px' }}></div>
                      <div className="kline-up" style={{ flex: 1, margin: '2px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'en' ? 'Price Alerts' : '价格提醒'}
                </div>
                <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Receive notifications for price movements' : '接收价格变动通知'}
                </div>
              </div>
              <this.CustomSwitch
                checked={priceAlerts}
                onChange={(checked) => this.handleSwitchChange('priceAlerts', checked)}
                id="priceAlerts"
              />
            </div>
          </div>

          <div className="settings-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'en' ? 'Risk Warnings' : '风险警告'}
                </div>
                <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Show risk warning messages' : '显示风险警告信息'}
                </div>
              </div>
              <this.CustomSwitch
                checked={riskWarning}
                onChange={(checked) => this.handleSwitchChange('riskWarning', checked)}
                id="riskWarning"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  private renderAppearanceSettings = () => {
    const { theme, language, advancedCharts } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: textColor, marginBottom: '20px' }}>
            {language === 'en' ? 'Appearance Settings' : '外观设置'}
          </h3>
          
          <div className="settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                {language === 'en' ? 'Theme Mode' : '主题模式'}
              </div>
              <div style={{ color: secondaryTextColor, fontSize: '13px', marginBottom: '15px' }}>
                {language === 'en' ? 'Choose between dark and light theme' : '选择深色或浅色主题'}
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div
                  onClick={() => this.handleThemeChange('dark')}
                  style={{
                    padding: '15px',
                    border: `2px solid ${theme === 'dark' ? '#A7B6C2' : '#2D323D'}`,
                    borderRadius: '8px',
                    backgroundColor: '#1A1D24',
                    cursor: 'pointer',
                    flex: 1,
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ color: '#E8EAED', fontWeight: '600', marginBottom: '8px' }}>
                    {language === 'en' ? 'Dark' : '深色'}
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '60px', 
                    backgroundColor: '#0F1116',
                    border: '1px solid #2D323D',
                    borderRadius: '4px'
                  }}></div>
                </div>
                
                <div
                  onClick={() => this.handleThemeChange('light')}
                  style={{
                    padding: '15px',
                    border: `2px solid ${theme === 'light' ? '#404854' : '#E1E5E9'}`,
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    flex: 1,
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ color: '#1A1D24', fontWeight: '600', marginBottom: '8px' }}>
                    {language === 'en' ? 'Light' : '浅色'}
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '60px', 
                    backgroundColor: '#F8F9FA',
                    border: '1px solid #E1E5E9',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'en' ? 'Advanced Charts' : '高级图表'}
                </div>
                <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                  {language === 'en' ? 'Enable advanced charting tools and indicators' : '启用高级图表工具和指标'}
                </div>
              </div>
              <this.CustomSwitch
                checked={advancedCharts}
                onChange={(checked) => this.handleSwitchChange('advancedCharts', checked)}
                id="advancedCharts"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  private renderNotificationSettings = () => {
    const { theme, language, notifications } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: textColor, marginBottom: '20px' }}>
          {language === 'en' ? 'Notification Settings' : '通知设置'}
        </h3>
        
        <div className="settings-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                {language === 'en' ? 'Enable Notifications' : '启用通知'}
              </div>
              <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                {language === 'en' ? 'Receive browser notifications' : '接收浏览器通知'}
              </div>
            </div>
            <this.CustomSwitch
              checked={notifications}
              onChange={(checked) => this.handleSwitchChange('notifications', checked)}
              id="notifications"
            />
          </div>
        </div>
      </div>
    );
  };

  private renderSecuritySettings = () => {
    const { theme, language } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: textColor, marginBottom: '20px' }}>
          {language === 'en' ? 'Security Settings' : '安全设置'}
        </h3>
        
        <div className="settings-card" style={{ padding: '20px', marginBottom: '15px' }}>
          <div style={{ color: textColor, fontWeight: '600', marginBottom: '10px' }}>
            {language === 'en' ? 'Session Timeout' : '会话超时'}
          </div>
          <div style={{ color: secondaryTextColor, fontSize: '13px', marginBottom: '15px' }}>
            {language === 'en' ? 'Automatically log out after period of inactivity' : '在无操作一段时间后自动登出'}
          </div>
          <select 
            defaultValue="30" 
            className="settings-select"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => console.log(e.target.value)}
          >
            {this.sessionTimeouts.map(timeout => (
              <option key={timeout.value} value={timeout.value}>
                {timeout.label}
              </option>
            ))}
          </select>
        </div>

        <div className="settings-card" style={{ padding: '20px' }}>
          <div style={{ color: textColor, fontWeight: '600', marginBottom: '10px' }}>
            {language === 'en' ? 'Two-Factor Authentication' : '双重认证'}
          </div>
          <div style={{ color: secondaryTextColor, fontSize: '13px', marginBottom: '15px' }}>
            {language === 'en' ? 'Add an extra layer of security to your account' : '为您的账户增加额外的安全层'}
          </div>
          <button className="settings-button primary">
            {language === 'en' ? 'Enable 2FA' : '启用双重认证'}
          </button>
        </div>
      </div>
    );
  };

  private renderAbout = () => {
    const { theme, language } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: textColor, marginBottom: '20px' }}>
          {language === 'en' ? 'About' : '关于'}
        </h3>
        
        <div className="settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📊</div>
            <div style={{ color: textColor, fontWeight: '600', fontSize: '18px', margin: '15px 0 10px 0' }}>
              Trading Terminal
            </div>
            <div style={{ color: secondaryTextColor, marginBottom: '20px' }}>
              Version 1.0.0
            </div>
            <div style={{ color: secondaryTextColor, fontSize: '13px', lineHeight: '1.5' }}>
              {language === 'en' 
                ? 'Professional trading platform with real-time market data and advanced charting tools.'
                : '专业的交易平台，提供实时市场数据和高级图表工具。'}
            </div>
          </div>
        </div>

        <div className="settings-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: textColor, fontWeight: '600', marginBottom: '4px' }}>
                {language === 'en' ? 'Reset to Defaults' : '恢复默认设置'}
              </div>
              <div style={{ color: secondaryTextColor, fontSize: '13px' }}>
                {language === 'en' ? 'Reset all settings to default values' : '将所有设置恢复为默认值'}
              </div>
            </div>
            <button 
              className="settings-button warning"
              onClick={this.resetToDefaults}
            >
              {language === 'en' ? 'Reset' : '重置'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  private renderContent = () => {
    const { selectedMenu } = this.state;

    switch (selectedMenu) {
      case 'general':
        return this.renderGeneralSettings();
      case 'trading':
        return this.renderTradingSettings();
      case 'appearance':
        return this.renderAppearanceSettings();
      case 'notifications':
        return this.renderNotificationSettings();
      case 'security':
        return this.renderSecuritySettings();
      case 'about':
        return this.renderAbout();
      default:
        return this.renderGeneralSettings();
    }
  };

  render() {
    const { theme, isCollapsed } = this.state;
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const sidebarBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';

    return (
      <div
        ref={this.containerRef}
        style={{
          height: '100%',
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
          overflow: 'hidden',
          height: '100%'
        }}>
          {/* Sidebar */}
          <div
            style={{
              width: isCollapsed ? '60px' : '220px',
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
              className="settings-scrollbar"
            >
              {this.renderMenuContent()}
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: backgroundColor,
            height: '100%',
            overflow: 'hidden',
            minWidth: 0
          }}>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0
              }}
              className="settings-scrollbar"
            >
              {this.renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SettingPageIndex;