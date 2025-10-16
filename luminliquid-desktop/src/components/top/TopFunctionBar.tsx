import React from 'react';
import {
    Button,
    Switch,
    Popover,
    Menu,
    MenuItem
} from '@blueprintjs/core';
import { themeManager } from '../../globals/theme/ThemeManager';

interface ButtonRowState {
    theme: 'dark' | 'light';
    windowWidth: number;
}

class ButtonRow extends React.Component<{}, ButtonRowState> {
    handleResize = () => {
        this.setState({ windowWidth: window.innerWidth });
    };

    private unsubscribe: (() => void) | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            windowWidth: window.innerWidth
        };
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

    buttonGroups = [
        {
            type: 'single-row',
            buttons: [
                { key: 'test', label: 'test', icon: 'predictive-analysis' as const },
                { key: 'test', label: 'test', icon: 'globe-network' as const },
                { key: 'test', label: 'test', icon: 'exchange' as const },
                { key: 'test', label: 'test', icon: 'pulse' as const },
                { key: 'test', label: 'test', icon: 'flash' as const }
            ]
        },
        {
            type: 'single-row',
            buttons: [
                { key: 'test', label: 'test', icon: 'circle' as const },
                { key: 'test', label: 'test)', icon: 'refresh' as const },
                { key: 'test', label: 'test', icon: 'document' as const },
                { key: 'test', label: 'test', icon: 'font' as const },
                { key: 'test', label: 'test', icon: 'more' as const }
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
                { key: 'test', label: 'test', icon: 'circle' as const },
                { key: 'test', label: 'test)', icon: 'refresh' as const },
                { key: 'test', label: 'test', icon: 'document' as const },
                { key: 'test', label: 'test', icon: 'font' as const },
                { key: 'test', label: 'test', icon: 'more' as const }
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
            key={button.key}
            minimal
            icon={button.icon}
            text={button.label}
            style={{
                fontSize: '11px',
                padding: '2px 6px',
                minHeight: 'auto',
                minWidth: 'auto',
                lineHeight: '16px',
                margin: '0 1px',
                borderRadius: '2px',
                marginRight: '5px',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                color: this.state.theme === 'dark' ? '#F5F8FA' : '#182026',
                backgroundColor: this.state.theme === 'dark' ? '#2F343C' : '#F5F8FA',
                border: this.state.theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                flex: '1'
            }}
        >
            <span className={`bp4-icon bp4-icon-${button.icon}`} style={{
                fontSize: '12px',
                margin: 0,
                marginRight: '0px !important'
            }} />
            <span style={{
                fontSize: '10px',
                lineHeight: '10px'
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
                margin: '1px'
            }}
        >
            <Button
                minimal
                text={button.label}
                style={{
                    fontSize: '10px',
                    padding: '1px 3px',
                    width: '55px',
                    height: '20px',
                    minWidth: '45px',
                    minHeight: '20px',
                    lineHeight: '12px',
                    borderRadius: '1px',
                    marginRight: '5px',

                    paddingLeft: '10px',
                    color: this.state.theme === 'dark' ? '#F5F8FA' : '#182026',
                    backgroundColor: this.state.theme === 'dark' ? '#2F343C' : '#F5F8FA',
                    border: this.state.theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5',
                    flex: '0 0 auto',
                    position: 'relative',
                    zIndex: 1
                }}
                className="double-row-button"
            />
        </div>
    );

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
                        padding: '5px 4px',
                        paddingLeft: '10px',
                        borderRight: groupIndex < this.buttonGroups.length - 1
                            ? (theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5')
                            : 'none',
                        position: 'relative',
                        zIndex: 0
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
            const firstRow = group.buttons.slice(0, 6);
            const secondRow = group.buttons.slice(6, 12);

            return (
                <div
                    key={`group-${groupIndex}`}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '1',
                        minWidth: '0',
                        padding: '2px 4px',
                        borderRight: groupIndex < this.buttonGroups.length - 1
                            ? (theme === 'dark' ? '1px solid #394B59' : '1px solid #DCE0E5')
                            : 'none',
                        position: 'relative',
                        zIndex: 0
                    }}
                >
                    <div style={{
                        display: 'flex',
                        flex: '1',
                        marginBottom: '2px',
                        position: 'relative',
                        zIndex: 2 
                    }}>
                        {firstRow.map((button: any, index: number) => (
                            this.renderDoubleRowButton(button, index)
                        ))}
                    </div>
                    <div style={{
                        display: 'flex',
                        flex: '1',
                        marginTop: '2px',
                        position: 'relative',
                        zIndex: 2 
                    }}>
                        {secondRow.map((button: any, index: number) => (
                            this.renderDoubleRowButton(button, index)
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    render() {
        const { theme } = this.state;
        const visibleGroups = this.getVisibleGroups();

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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: '1',
                        minWidth: '0',
                        height: '100%'
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

export default ButtonRow;