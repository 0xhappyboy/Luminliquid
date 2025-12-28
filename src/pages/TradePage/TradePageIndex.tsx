import React from 'react';
import { HTMLTable } from '@blueprintjs/core';
// import '../styles/TradePage.css';
import { overflowManager } from '../../globals/theme/OverflowTypeManager';
import { TEST_CANDLEVIEW_DATA8 } from './TestData/TestData_3';
import CandleView from 'candleview';
import { themeManager } from "../../globals/theme/ThemeManager";

interface TradePageProps {
    children?: React.ReactNode;
}

interface TradePageState {
    theme: 'dark' | 'light';
    containerHeight: number;
}

class TradePage extends React.Component<TradePageProps, TradePageState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef: React.RefObject<HTMLDivElement | null>;
    private resizeObserver: ResizeObserver | null = null;
    constructor(props: TradePageProps) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement | null>();
        const searchParams = new URLSearchParams(window.location.search);
        const exchange = searchParams.get('exchange') || '';
        const symbol = searchParams.get('symbol') || '';
        this.state = {
            theme: themeManager.getTheme(),
            containerHeight: 0
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

    private applyGlobalTheme = () => {
        const { theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const scrollbarTrack = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const scrollbarThumb = theme === 'dark' ? '#5A6270' : '#C4C9D1';
        const scrollbarThumbHover = theme === 'dark' ? '#767E8C' : '#A8AFB8';
        return `
      .trade-page-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .trade-page-scrollbar::-webkit-scrollbar-track {
        background: ${scrollbarTrack};
        border-radius: 3px;
      }
      .trade-page-scrollbar::-webkit-scrollbar-thumb {
        background: ${scrollbarThumb};
        border-radius: 3px;
      }
      .trade-page-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${scrollbarThumbHover};
      }
      .trade-page-container {
        background-color: ${backgroundColor};
        height: 100%;
        overflow: hidden;
      }
    `;
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

    render() {
        const { containerHeight, theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        overflowManager.setOverflow('auto');
        return (
            <div
                ref={this.containerRef}
                style={{
                    height: containerHeight > 0 ? `${containerHeight}px` : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor,
                    overflow: 'hidden'
                }}
            >
                <style>{this.applyGlobalTheme()}</style>
                <div
                    className="trade-page-scrollbar"
                    style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <CandleView
                        data={TEST_CANDLEVIEW_DATA8}
                        title='Test'
                        theme={theme}
                        i18n={'zh-cn'}
                        leftpanel={true}
                        toppanel={true}
                        terminal={true}
                        ai={true}
                        timezone='America/New_York'
                        timeframe='1m'
                        aiconfigs={[
                            {
                                proxyUrl: 'http://localhost:3000/api',
                                brand: 'aliyun',
                                model: 'qwen-turbo',
                            },
                            {
                                proxyUrl: 'http://localhost:3000/api',
                                brand: 'deepseek',
                                model: 'deepseek-chat',
                            },
                            {
                                proxyUrl: 'http://localhost:3000/api',
                                brand: 'deepseek',
                                model: 'deepseek-chat-lite',
                            },
                        ]}
                    />
                </div>
            </div>
        );
    }
}

export default TradePage;