import React from 'react';
import CandleView from 'candleview';
import { themeManager } from '../globals/theme/ThemeManager';
import { overflowManager } from '../globals/theme/OverflowTypeManager';
import { TEST_CANDLEVIEW_DATA8 } from './TradePage/TestData/TestData_3';

interface MultiPanelPageProps {
    children?: React.ReactNode;
}

interface MultiPanelPageState {
    theme: 'dark' | 'light';
    horizontalSplit: number;
    verticalSplit: number;
    isDraggingHorizontal: boolean;
    isDraggingVertical: boolean;
}

class MultiPanelPage extends React.Component<MultiPanelPageProps, MultiPanelPageState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef = React.createRef<HTMLDivElement>();

    constructor(props: MultiPanelPageProps) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            horizontalSplit: 50,
            verticalSplit: 50,
            isDraggingHorizontal: false,
            isDraggingVertical: false,
        };
    }

    private handleThemeChange = (theme: 'dark' | 'light'): void => {
        this.setState({ theme });
    };

    private handleHorizontalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState({ isDraggingHorizontal: true });
        const handleMouseMove = (e: MouseEvent) => {
            if (!this.containerRef.current || !this.state.isDraggingHorizontal) return;
            const containerRect = this.containerRef.current.getBoundingClientRect();
            const relativeY = e.clientY - containerRect.top;
            const percentage = (relativeY / containerRect.height) * 100;
            const clampedPercentage = Math.max(30, Math.min(70, percentage));
            this.setState({ horizontalSplit: clampedPercentage });
        };
        const handleMouseUp = () => {
            this.setState({ isDraggingHorizontal: false });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    private handleVerticalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState({ isDraggingVertical: true });
        const handleMouseMove = (e: MouseEvent) => {
            if (!this.containerRef.current || !this.state.isDraggingVertical) return;
            const containerRect = this.containerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - containerRect.left;
            const percentage = (relativeX / containerRect.width) * 100;
            const clampedPercentage = Math.max(30, Math.min(70, percentage));
            this.setState({ verticalSplit: clampedPercentage });
        };
        const handleMouseUp = () => {
            this.setState({ isDraggingVertical: false });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    componentDidMount() {
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
        document.removeEventListener('dragover', (e) => e.preventDefault());
        document.removeEventListener('drop', (e) => e.preventDefault());
    }

    render() {
        const { theme, horizontalSplit, verticalSplit, isDraggingHorizontal, isDraggingVertical } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        overflowManager.setOverflow('auto');
        const handleColor = theme === 'dark' ? '#333' : '#ddd';
        const hoverHandleColor = theme === 'dark' ? '#555' : '#ccc';
        const renderPanel = (panelId: number) => (
            <div style={{
                height: '100%',
                width: '100%',
                backgroundColor,
                boxSizing: 'border-box',
                overflow: 'auto',
                position: 'relative',
            }}>
                <CandleView
                    height={'100%'}
                    data={TEST_CANDLEVIEW_DATA8}
                    title={`Panel ${panelId}`}
                    theme={theme}
                    i18n={'zh-cn'}
                    leftpanel={true}
                    toppanel={true}
                    // terminal={true}
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
        );
        return (
            <div
                ref={this.containerRef}
                style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor,
                    position: 'relative',
                    userSelect: 'none',
                }}
                onMouseLeave={() => {
                    if (isDraggingHorizontal || isDraggingVertical) {
                        this.setState({
                            isDraggingHorizontal: false,
                            isDraggingVertical: false
                        });
                    }
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${verticalSplit}%`,
                    height: `${horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                    borderRight: '1px solid transparent',
                    borderBottom: '1px solid transparent',
                }}>
                    {renderPanel(1)}
                </div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: `${verticalSplit}%`,
                    width: `${100 - verticalSplit}%`,
                    height: `${horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                    borderBottom: '1px solid transparent',
                }}>
                    {renderPanel(2)}
                </div>
                <div style={{
                    position: 'absolute',
                    top: `${horizontalSplit}%`,
                    left: 0,
                    width: `${verticalSplit}%`,
                    height: `${100 - horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                    borderRight: '1px solid transparent',
                }}>
                    {renderPanel(3)}
                </div>
                <div style={{
                    position: 'absolute',
                    top: `${horizontalSplit}%`,
                    left: `${verticalSplit}%`,
                    width: `${100 - verticalSplit}%`,
                    height: `${100 - horizontalSplit}%`,
                    minWidth: '30%',
                    minHeight: '30%',
                }}>
                    {renderPanel(4)}
                </div>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: `${verticalSplit}%`,
                        width: '4px',
                        height: '100%',
                        backgroundColor: isDraggingVertical ? hoverHandleColor : handleColor,
                        cursor: 'col-resize',
                        zIndex: 10,
                        transform: 'translateX(-2px)',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseDown={this.handleVerticalMouseDown}
                    onMouseEnter={() => !isDraggingVertical && this.setState({})}
                    onMouseLeave={() => !isDraggingVertical && this.setState({})}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: `${horizontalSplit}%`,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        backgroundColor: isDraggingHorizontal ? hoverHandleColor : handleColor,
                        cursor: 'row-resize',
                        zIndex: 10,
                        transform: 'translateY(-2px)',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseDown={this.handleHorizontalMouseDown}
                    onMouseEnter={() => !isDraggingHorizontal && this.setState({})}
                    onMouseLeave={() => !isDraggingHorizontal && this.setState({})}
                />
                {(isDraggingHorizontal || isDraggingVertical) && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000,
                        cursor: isDraggingHorizontal ? 'row-resize' : 'col-resize',
                    }} />
                )}
            </div>
        );
    }
}

export default MultiPanelPage;