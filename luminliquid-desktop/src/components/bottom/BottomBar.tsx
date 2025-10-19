import React from 'react';
import { InputGroup, Button, Popover, Menu, MenuItem } from '@blueprintjs/core';
import { themeManager } from '../../globals/theme/ThemeManager';

interface BottomBarState {
    theme: 'dark' | 'light';
    currentTime: string;
    marqueeText: string;
    windowWidth: number;
}

class BottomBar extends React.Component<{}, BottomBarState> {
    private timer: NodeJS.Timeout | null = null;
    private unsubscribe: (() => void) | null = null;
    private leftMenuItems = [
        {
            key: 'home',
            label: 'home',
            children: [{ key: 'dashboard', label: 'dashboard' }, { key: 'overview', label: 'overview' }]
        },
        {
            key: 'self-select',
            label: 'self-select',
            children: [{ key: 'add-stock', label: 'add-stock' }, { key: 'manage', label: 'manage' }]
        },
        {
            key: 'market',
            label: 'market',
            children: [{ key: 'stock-market', label: 'stock-market' }, { key: 'futures', label: 'futures' }]
        },
        {
            key: 'news',
            label: 'news',
            children: [{ key: 'latest-news', label: 'latest-news' }, { key: 'announcements', label: 'announcements' }]
        },
        {
            key: 'trade',
            label: 'trade',
            children: [{ key: 'buy', label: 'buy' }, { key: 'sell', label: 'sell' }]
        },
        {
            key: 'assets',
            label: 'assets',
            children: [{ key: 'balance', label: 'balance' }, { key: 'positions', label: 'positions' }]
        },
        {
            key: 'settings',
            label: 'settings',
            children: [{ key: 'preferences', label: 'preferences' }, { key: 'system', label: 'system' }]
        }
    ];
    constructor(props: {}) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            currentTime: new Date().toLocaleTimeString(),
            marqueeText: 'This is test new..............             This is test new..............',
            windowWidth: window.innerWidth
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
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    handleResize = () => {
        this.setState({ windowWidth: window.innerWidth });
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
    renderDropdownMenu = (items: any[]) => (
        <Menu style={{ minWidth: '120px', fontSize: '12px' }}>
            {items.map((item) => (
                <MenuItem
                    key={item.key}
                    text={item.label}
                    style={{ fontSize: '12px', padding: '4px 12px' }}
                />
            ))}
        </Menu>
    );
    render() {
        const { theme, currentTime, marqueeText } = this.state;
        const visibleMenuItems = this.getVisibleMenuItems();
        const backgroundColor = theme === 'dark' ? '#1C2127' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
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
                    minWidth: '500px'
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
                                position="top"
                                minimal
                                hoverOpenDelay={0}
                                interactionKind="hover-target"
                                popoverClassName="bottom-menu-popover"
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
                            position: 'relative', display: 'inline-block', flexShrink: 0,

                            height: '30px',
                            minHeight: '30px',
                            lineHeight: '25px',
                        }}>
                            <Popover
                                content={this.renderDropdownMenu(
                                    this.leftMenuItems.slice(visibleMenuItems.length)
                                )}
                                position="top"
                                minimal
                                hoverOpenDelay={0}
                                interactionKind="hover-target"
                                popoverClassName="bottom-menu-popover"
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
                        {marqueeText}
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
                        flexShrink: 0
                    }}
                >
                    <InputGroup
                        small
                        placeholder="Search..."
                        style={{
                            width: '120px',
                            height: '20px',
                            fontSize: '12px',
                            flexShrink: 0
                        }}
                    />

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