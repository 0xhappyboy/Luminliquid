import React from 'react';
import {
    Button,
} from '@blueprintjs/core';
import { themeManager } from '../../globals/theme/ThemeManager';
import { withRouter } from '../../WithRouter';
import pages from '../../globals/config/pages.json';
import { handleMultiPanelWindow } from '../../globals/commands/WindowsCommand';

interface TopFunctionBarState {
    theme: 'dark' | 'light';
    windowWidth: number;
}

interface TopFunctionBarProps {
    navigate?: (path: string, options?: any) => void;
}

class TopFunctionBar extends React.Component<TopFunctionBarProps, TopFunctionBarState> {
    private unsubscribe: (() => void) | null = null;
    buttonGroups = [
        {
            type: 'single-row',
            buttons: [
                { key: pages.market.name, label: pages.market.name, icon: 'predictive-analysis' as const, page: pages.market.path },
                { key: pages.ordersplit.name, label: pages.ordersplit.name, icon: 'globe-network' as const, page: pages.ordersplit.path },
                { key: pages.arbitrage.name, label: pages.arbitrage.name, icon: 'exchange' as const, page: pages.arbitrage.path },
              
                      { key: 'multi_panel_window', label: 'MultiPanelWindow', icon: 'font' as const },
            ]
        },
        {
            type: 'single-row',
            buttons: [
                { key: pages.lend.name, label: pages.lend.name, icon: 'circle' as const, page: pages.lend.path },
                { key: pages.news.name, label: pages.news.name, icon: 'refresh' as const, page: pages.news.path },
                { key: pages.tradestrategy.name, label: pages.tradestrategy.name, icon: 'document' as const, page: pages.tradestrategy.path },
                { key: pages.tool.name, label: pages.tool.name, icon: 'font' as const, page: pages.tool.path },
                { key: pages.socialmonitor.name, label: pages.socialmonitor.name, icon: 'more' as const, page: pages.socialmonitor.path }
            ]
        },
        {
            type: 'double-row',
            buttons: [
                { key: 'test', label: 'test', icon: 'filter' as const },
                { key: 'test', label: 'test', icon: 'database' as const },
                { key: 'test', label: 'test', icon: 'pulse' as const },
                { key: 'test', label: 'test', icon: 'diamond' as const },
                { key: 'test', label: 'test', icon: 'numerical' as const },
                { key: 'test', label: 'test', icon: 'numerical' as const },
                { key: 'test', label: 'test', icon: 'grid' as const },
                { key: 'test', label: 'test', icon: 'dollar' as const },
                { key: 'test', label: 'test', icon: 'predictive-analysis' as const },
                { key: 'test', label: 'test', icon: 'dashboard' as const },
                { key: 'test', label: 'test', icon: 'numerical' as const },
                { key: 'test', label: 'test', icon: 'numerical' as const },
            ]
        },
        {
            type: 'single-row',
            buttons: [
                { key: pages.contractanalysis.name, label: pages.contractanalysis.name, icon: 'circle' as const, page: pages.contractanalysis.path },
                { key: pages.predictionmarket.name, label: pages.predictionmarket.name, icon: 'refresh' as const, page: pages.predictionmarket.path },
                { key: pages.networkstatus.name, label: pages.networkstatus.name, icon: 'document' as const, page: pages.networkstatus.path },
            ]
        },
        {
            type: 'double-row',
            buttons: [
                { key: 'test', label: 'test', icon: 'exchange' as const },
                { key: 'test', label: '(test', icon: 'document' as const },
                { key: 'test', label: 'test', icon: 'cloud' as const },
                { key: 'test', label: 'test', icon: 'all' as const },
                { key: 'test', label: 'test', icon: 'time' as const },
                { key: 'test', label: 'test', icon: 'time' as const },
                { key: 'test', label: 'test', icon: 'circle' as const },
                { key: 'test', label: 'test', icon: 'graph' as const },
                { key: 'test', label: 'test', icon: 'timeline-bar-chart' as const },
                { key: 'test', label: 'test', icon: 'dollar' as const },
                { key: 'test', label: 'test', icon: 'exchange' as const },
                { key: 'test', label: 'test', icon: 'time' as const },
            ]
        },
    ];

    constructor(props: TopFunctionBarProps) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            windowWidth: window.innerWidth
        };
    }
    handleResize = () => {
        this.setState({ windowWidth: window.innerWidth });
    };
    toPage = (page: string) => {
        this.props.navigate(page);
    }
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
    toggleTheme = () => {
        themeManager.toggleTheme();
    };

    handleBack = () => {
        window.history.back();
    };

    handleForward = () => {
        window.history.forward();
    };

    handleRefresh = () => {
        window.location.reload();
    };

    getVisibleGroups = () => {
        const { windowWidth } = this.state;

        if (windowWidth >= 1400) {
            return this.buttonGroups; // show 6 group
        } else if (windowWidth >= 1200) {
            return this.buttonGroups.slice(0, 5); // show 5 group
        } else if (windowWidth >= 1000) {
            return this.buttonGroups.slice(0, 3); // show 3 group
        } else if (windowWidth >= 800) {
            return this.buttonGroups.slice(0, 2); // show 2 group
        } else {
            return [this.buttonGroups[0]]; // show 1 group
        }
    };

    renderSingleRowButton = (button: any, index: number) => (
        <Button
            onClick={() => {
                if (button.key === 'multi_panel_window') {
                    handleMultiPanelWindow();
                } else {
                    button.page && this.toPage(button.page)
                }
            }}
            key={button.key}
            minimal
            icon={button.icon}
            text={button.label}
            style={{
                fontSize: '11px',
                padding: '4px 2px',
                minHeight: '36px',
                minWidth: '0',
                lineHeight: '14px',
                margin: '0 1px',
                borderRadius: '2px',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: this.state.theme === 'dark' ? '#F5F8FA' : '#182026',
                backgroundColor: this.state.theme === 'dark' ? '#2F343C' : '#F5F8FA',
                border: this.state.theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                flex: '1 1 0px',
                display: 'flex',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
            className="single-row-button"
        >
            <span className={`bp4-icon bp4-icon-${button.icon}`} style={{
                fontSize: '14px',
                margin: 0,
                flexShrink: 0
            }} />
            <span style={{
                fontSize: '10px',
                lineHeight: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
            }}>
                {button.label}
            </span>
        </Button>
    );

    renderDoubleRowButton = (button: any, index: number) => (
        <div
            key={button.key}
            style={{
                position: 'relative',
                zIndex: 1,
                margin: '1px',
                flex: '1 1 0px',
                minWidth: '0'
            }}
        >
            <Button
                minimal
                text={button.label}
                style={{
                    fontSize: '10px',
                    padding: '2px 4px',
                    width: '100%',
                    height: '20px',
                    minWidth: '0',
                    minHeight: '20px',
                    lineHeight: '12px',
                    borderRadius: '1px',
                    color: this.state.theme === 'dark' ? '#F5F8FA' : '#182026',
                    backgroundColor: this.state.theme === 'dark' ? '#2F343C' : '#F5F8FA',
                    border: this.state.theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                    flex: '1',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                className="double-row-button"
            />
        </div>
    );

    renderLeftButtonGroup = (group: any, groupIndex: number) => {
        const { theme } = this.state;
        return (
            <div
                key={`left-group-${groupIndex}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    width: '170px',
                    minWidth: '0',
                    height: '100%',
                    padding: '4px',
                    paddingRight: '4px',
                    paddingLeft: '0px',
                    borderRight: (theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5'),
                    position: 'relative',
                    zIndex: 0,
                    gap: '2px'
                }}
            >
                {group.buttons.map((button: any, index: number) => (
                    <Button
                        key={button.key}
                        minimal
                        icon={button.icon}
                        onClick={() => {
                            if (button.key === 'back') this.handleBack();
                            else if (button.key === 'forward') this.handleForward();
                            else if (button.key === 'refresh') this.handleRefresh();
                        }}
                        style={{
                            fontSize: '15px',
                            minHeight: '36px',
                            minWidth: '0',
                            lineHeight: '14px',
                            margin: '0 1px',
                            borderRadius: '2px',
                            height: '100%',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: this.state.theme === 'dark' ? '#F5F8FA' : '#182026',
                            backgroundColor: this.state.theme === 'dark' ? '#2F343C' : '#F5F8FA',
                            border: this.state.theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                            flex: '1 1 0px',
                            display: 'flex',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            padding: '4px 2px',
                        }}
                        title={
                            button.key === 'back' ? '返回上一页' :
                                button.key === 'forward' ? '前进下一页' :
                                    '刷新页面'
                        }
                    >
                    </Button>
                ))}
            </div>
        );
    };

    renderButtonGroup = (group: any, groupIndex: number) => {
        const { theme } = this.state;
        if (group.type === 'single-row') {
            return (
                <div
                    key={`group-${groupIndex}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: '1',
                        minWidth: '0',
                        height: '100%',
                        padding: '4px',
                        borderRight: groupIndex < this.buttonGroups.length - 1
                            ? (theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5')
                            : 'none',
                        position: 'relative',
                        zIndex: 0,
                        gap: '2px'
                    }}
                >
                    {group.buttons.map((button: any, index: number) => (
                        <React.Fragment key={button.key}>
                            {this.renderSingleRowButton(button, index)}
                        </React.Fragment>
                    ))}
                </div>
            );
        } else if (group.type === 'double-row') {
            // const firstRow = group.buttons.slice(0, 6);
            // const secondRow = group.buttons.slice(6, 12);
            // return (
            //     <div
            //         key={`group-${groupIndex}`}
            //         style={{
            //             display: 'flex',
            //             flexDirection: 'column',
            //             flex: '1',
            //             minWidth: '0',
            //             padding: '2px',
            //             borderRight: groupIndex < this.buttonGroups.length - 1
            //                 ? (theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5')
            //                 : 'none',
            //             position: 'relative',
            //             zIndex: 0,
            //             gap: '2px'
            //         }}
            //     >
            //         <div style={{
            //             display: 'flex',
            //             flex: '1',
            //             minHeight: '22px',
            //             position: 'relative',
            //             zIndex: 2,
            //             gap: '2px'
            //         }}>
            //             {firstRow.map((button: any, index: number) => (
            //                 this.renderDoubleRowButton(button, index)
            //             ))}
            //         </div>
            //         <div style={{
            //             display: 'flex',
            //             flex: '1',
            //             minHeight: '22px',
            //             position: 'relative',
            //             zIndex: 2,
            //             gap: '2px'
            //         }}>
            //             {secondRow.map((button: any, index: number) => (
            //                 this.renderDoubleRowButton(button, index)
            //             ))}
            //         </div>
            //     </div>
            // );
        }
        return null;
    };

    render() {
        const { theme } = this.state;
        const visibleGroups = this.getVisibleGroups();
        const leftButtonGroup = {
            type: 'single-row' as const,
            buttons: [
                { key: 'back', label: '', icon: 'chevron-left' as const, page: null },
                { key: 'forward', label: '', icon: 'chevron-right' as const, page: null },
                { key: 'refresh', label: '', icon: 'refresh' as const, page: null }
            ]
        };
        return (
            <div
                className={`button-row ${theme === 'dark' ? 'bp4-dark' : 'bp4-light'}`}
                style={{
                    width: '100%',
                    minWidth: '400px',
                    backgroundColor: theme === 'dark' ? '#1C2127' : '#FFFFFF',
                    padding: '0 8px',
                    borderBottom: theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                    display: 'flex',
                    alignItems: 'stretch',
                    justifyContent: 'space-between',
                    height: '60px',
                    overflow: 'hidden'
                }}
            >
                {this.renderLeftButtonGroup(leftButtonGroup, -1)}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: '1',
                        minWidth: '0',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                >
                    {visibleGroups.map((group, index) =>
                        this.renderButtonGroup(group, index)
                    )}
                </div>
            </div>
        );
    }
}

export default withRouter(TopFunctionBar);