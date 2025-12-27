import React from "react";
import {
    Menu,
    MenuItem,
    Icon,
    Button,
    Card,
    Elevation
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";

interface TradeStrategyPageIndexProps {
    children?: React.ReactNode;
}

interface TradeStrategyPageIndexState {
    theme: 'dark' | 'light';
    containerHeight: number;
    selectedMenu: string;
    selectedStrategy: string | null;
    isCollapsed: boolean;
    nodes: StrategyNode[];
    connections: Connection[];
    selectedNodes: string[];
    zoom: number;
    pan: { x: number; y: number };
    isDragging: boolean;
    dragStart: { x: number; y: number };
}

interface StrategyNode {
    id: string;
    type: 'trigger' | 'condition' | 'action' | 'filter' | 'risk' | 'entry' | 'exit';
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    parameters: { [key: string]: any };
    color: string;
}

interface Connection {
    id: string;
    sourceId: string;
    targetId: string;
    sourcePort: string;
    targetPort: string;
}

class TradeStrategyPageIndex extends React.Component<TradeStrategyPageIndexProps, TradeStrategyPageIndexState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef: React.RefObject<HTMLDivElement | null>;
    private canvasRef: React.RefObject<HTMLDivElement | null>;
    private resizeObserver: ResizeObserver | null = null;

    private nodeTemplates = [
        {
            type: 'trigger',
            category: 'Triggers',
            items: [
                { id: 'price-cross', label: 'Price Cross', icon: 'timeline-line-chart', color: '#2E8B57' },
                { id: 'volume-spike', label: 'Volume Spike', icon: 'pulse', color: '#FF6B6B' },
                { id: 'time-based', label: 'Time Based', icon: 'time', color: '#4ECDC4' },
                { id: 'indicator-signal', label: 'Indicator Signal', icon: 'predictive-analysis', color: '#45B7D1' }
            ]
        },
        {
            type: 'condition',
            category: 'Conditions',
            items: [
                { id: 'market-condition', label: 'Market Condition', icon: 'globe-network', color: '#96CEB4' },
                { id: 'volatility-check', label: 'Volatility Check', icon: 'changes', color: '#FECA57' },
                { id: 'liquidity-check', label: 'Liquidity Check', icon: 'flow-review', color: '#FF9FF3' },
                { id: 'correlation-check', label: 'Correlation Check', icon: 'graph-remove', color: '#54A0FF' }
            ]
        },
        {
            type: 'action',
            category: 'Actions',
            items: [
                { id: 'market-order', label: 'Market Order', icon: 'exchange', color: '#5F27CD' },
                { id: 'limit-order', label: 'Limit Order', icon: 'dollar', color: '#00D2D3' },
                { id: 'stop-order', label: 'Stop Order', icon: 'stop', color: '#FF9F43' },
                { id: 'oco-order', label: 'OCO Order', icon: 'multi-select', color: '#EE5A24' }
            ]
        },
        {
            type: 'risk',
            category: 'Risk Management',
            items: [
                { id: 'position-sizing', label: 'Position Sizing', icon: 'scale', color: '#A3CB38' },
                { id: 'stop-loss', label: 'Stop Loss', icon: 'shield', color: '#ED4C67' },
                { id: 'take-profit', label: 'Take Profit', icon: 'trophy', color: '#009432' },
                { id: 'trailing-stop', label: 'Trailing Stop', icon: 'follow', color: '#0652DD' }
            ]
        }
    ];

    private strategyTemplates = [
        { id: 'mean-reversion', name: 'Mean Reversion', description: 'Buy low, sell high strategy' },
        { id: 'momentum', name: 'Momentum Trading', description: 'Follow the trend' },
        { id: 'arbitrage', name: 'Arbitrage', description: 'Exploit price differences' },
        { id: 'grid-trading', name: 'Grid Trading', description: 'Systematic position scaling' },
        { id: 'martingale', name: 'Martingale', description: 'Double down on losses' }
    ];

    constructor(props: TradeStrategyPageIndexProps) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement | null>();
        this.canvasRef = React.createRef<HTMLDivElement | null>();
        this.state = {
            theme: themeManager.getTheme(),
            containerHeight: 0,
            selectedMenu: 'templates',
            selectedStrategy: null,
            isCollapsed: false,
            nodes: [],
            connections: [],
            selectedNodes: [],
            zoom: 1,
            pan: { x: 0, y: 0 },
            isDragging: false,
            dragStart: { x: 0, y: 0 }
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

    private handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomSpeed = 0.001;
        const newZoom = this.state.zoom * (1 - e.deltaY * zoomSpeed);
        this.setState({ zoom: Math.max(0.1, Math.min(3, newZoom)) });
    };

    private handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            this.setState({
                isDragging: true,
                dragStart: { x: e.clientX - this.state.pan.x, y: e.clientY - this.state.pan.y }
            });
        }
    };

    private handleMouseMove = (e: React.MouseEvent) => {
        if (this.state.isDragging) {
            this.setState({
                pan: {
                    x: e.clientX - this.state.dragStart.x,
                    y: e.clientY - this.state.dragStart.y
                }
            });
        }
    };

    private handleMouseUp = () => {
        this.setState({ isDragging: false });
    };

    private addNode = (template: any, x: number, y: number) => {
        const newNode: StrategyNode = {
            id: `node-${Date.now()}`,
            type: template.type,
            label: template.label,
            x: (x - this.state.pan.x) / this.state.zoom,
            y: (y - this.state.pan.y) / this.state.zoom,
            width: 120,
            height: 60,
            parameters: {},
            color: template.color
        };
        this.setState(prevState => ({
            nodes: [...prevState.nodes, newNode]
        }));
    };

    private deleteSelectedNodes = () => {
        this.setState(prevState => ({
            nodes: prevState.nodes.filter(node => !prevState.selectedNodes.includes(node.id)),
            connections: prevState.connections.filter(
                conn => !prevState.selectedNodes.includes(conn.sourceId) &&
                    !prevState.selectedNodes.includes(conn.targetId)
            ),
            selectedNodes: []
        }));
    };

    private loadTemplate = (templateId: string) => {
        // 这里加载预定义的策略模板
        const templateNodes: StrategyNode[] = [];
        const templateConnections: Connection[] = [];

        // 示例模板节点
        if (templateId === 'mean-reversion') {
            templateNodes.push(
                {
                    id: 'trigger-1',
                    type: 'trigger',
                    label: 'Price Deviation',
                    x: 100, y: 100,
                    width: 120, height: 60,
                    parameters: { threshold: 2 },
                    color: '#2E8B57'
                },
                {
                    id: 'condition-1',
                    type: 'condition',
                    label: 'Volatility Check',
                    x: 300, y: 100,
                    width: 120, height: 60,
                    parameters: { maxVolatility: 0.5 },
                    color: '#FECA57'
                },
                {
                    id: 'action-1',
                    type: 'action',
                    label: 'Limit Order',
                    x: 500, y: 100,
                    width: 120, height: 60,
                    parameters: { orderType: 'limit' },
                    color: '#5F27CD'
                }
            );
            templateConnections.push(
                { id: 'conn-1', sourceId: 'trigger-1', targetId: 'condition-1', sourcePort: 'output', targetPort: 'input' },
                { id: 'conn-2', sourceId: 'condition-1', targetId: 'action-1', sourcePort: 'output', targetPort: 'input' }
            );
        }

        this.setState({
            nodes: templateNodes,
            connections: templateConnections,
            selectedStrategy: templateId
        });
    };

    private renderLeftPanel = () => {
        const { theme, selectedMenu, isCollapsed } = this.state;
        const backgroundColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const activeBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';

        if (isCollapsed) {
            return (
                <div style={{
                    width: '60px',
                    backgroundColor,
                    borderRight: `1px solid ${borderColor}`,
                    padding: '8px 4px'
                }}>
                    {['templates', 'nodes', 'properties'].map(menu => (
                        <div
                            key={menu}
                            className={`menu-item menu-item-hover ${selectedMenu === menu ? 'menu-item-selected' : ''}`}
                            style={{
                                padding: '12px 8px',
                                marginBottom: '4px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: selectedMenu === menu ? activeBgColor : 'transparent',
                                border: `1px solid ${selectedMenu === menu ? primaryColor : 'transparent'}`,
                                borderRadius: '4px',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => this.setState({ selectedMenu: menu })}
                        >
                            <Icon
                                icon={this.getMenuIcon(menu)}
                                size={16}
                                color={selectedMenu === menu ? primaryColor : textColor}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div style={{
                width: '280px',
                backgroundColor,
                borderRight: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
                    <h3 style={{ margin: '0 0 16px 0', color: textColor }}>Strategy Editor</h3>
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '16px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '4px',
                        padding: '2px',
                        backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF'
                    }}>
                        {['templates', 'nodes', 'properties'].map(menu => (
                            <button
                                key={menu}
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    fontWeight: selectedMenu === menu ? '600' : '400',
                                    border: 'none',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedMenu === menu ? activeBgColor : 'transparent',
                                    color: selectedMenu === menu ?
                                        (theme === 'dark' ? '#FFFFFF' : '#182026') : textColor,
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onClick={() => this.setState({ selectedMenu: menu })}
                            >
                                {this.getMenuLabel(menu)}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '16px'
                }}>
                    {this.renderMenuContent()}
                </div>
            </div>
        );
    };


    private getMenuIcon = (menu: string) => {
        switch (menu) {
            case 'templates': return 'application';
            case 'nodes': return 'graph';
            case 'properties': return 'cog';
            default: return 'dot';
        }
    };

    private getMenuLabel = (menu: string) => {
        switch (menu) {
            case 'templates': return 'Templates';
            case 'nodes': return 'Nodes';
            case 'properties': return 'Properties';
            default: return menu;
        }
    };

    private renderMenuContent = () => {
        const { selectedMenu, theme } = this.state;
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const activeBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';

        switch (selectedMenu) {
            case 'templates':
                return (
                    <div>
                        <h4 style={{ color: textColor, marginBottom: '12px' }}>Strategy Templates</h4>
                        {this.strategyTemplates.map(template => (
                            <div
                                key={template.id}
                                style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                                    transition: 'all 0.2s ease',
                                }}
                                className="menu-item-hover"
                                onClick={() => this.loadTemplate(template.id)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
                                    e.currentTarget.style.borderColor = primaryColor;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
                                    e.currentTarget.style.borderColor = borderColor;
                                }}
                            >
                                <div style={{
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    color: textColor,
                                    fontSize: '13px'
                                }}>
                                    {template.name}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    opacity: 0.7,
                                    color: textColor
                                }}>
                                    {template.description}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'nodes':
                return (
                    <div>
                        <h4 style={{ color: textColor, marginBottom: '12px' }}>Node Library</h4>
                        {this.nodeTemplates.map(category => (
                            <div key={category.type} style={{ marginBottom: '16px' }}>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    marginBottom: '8px',
                                    opacity: 0.7,
                                    color: textColor
                                }}>
                                    {category.category}
                                </div>
                                {category.items.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('application/node-type', JSON.stringify(item));
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            marginBottom: '4px',
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: '4px',
                                            cursor: 'grab',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                                            color: textColor,
                                            transition: 'all 0.2s ease',
                                        }}
                                        className="menu-item-hover"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
                                            e.currentTarget.style.borderColor = primaryColor;
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
                                            e.currentTarget.style.borderColor = borderColor;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <Icon icon={item.icon as any} color={item.color} />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                );

            case 'properties':
                return (
                    <div>
                        <h4 style={{ color: textColor, marginBottom: '12px' }}>Properties</h4>
                        {this.renderPropertiesPanel()}
                    </div>
                );

            default:
                return null;
        }
    };

    private renderPropertiesPanel = () => {
        const { selectedNodes, nodes, theme } = this.state;
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';

        if (selectedNodes.length === 0) {
            return <div style={{ color: textColor, opacity: 0.7 }}>Select a node to edit properties</div>;
        }

        const selectedNode = nodes.find(node => node.id === selectedNodes[0]);
        if (!selectedNode) return null;

        return (
            <div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                        Node Label
                    </label>
                    <input
                        type="text"
                        value={selectedNode.label}
                        onChange={(e) => {
                            this.setState(prevState => ({
                                nodes: prevState.nodes.map(node =>
                                    node.id === selectedNode.id ? { ...node, label: e.target.value } : node
                                )
                            }));
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '4px',
                            backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                            color: textColor
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                        Parameters
                    </label>
                    {Object.entries(selectedNode.parameters).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>{key}</div>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => {
                                    this.setState(prevState => ({
                                        nodes: prevState.nodes.map(node =>
                                            node.id === selectedNode.id ? {
                                                ...node,
                                                parameters: { ...node.parameters, [key]: e.target.value }
                                            } : node
                                        )
                                    }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '4px',
                                    backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                                    color: textColor,
                                    fontSize: '12px'
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    private renderCanvas = () => {
        const { theme, nodes, connections, zoom, pan, selectedNodes } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const gridColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';

        return (
            <div
                ref={this.canvasRef}
                style={{
                    flex: 1,
                    backgroundColor,
                    backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: this.state.isDragging ? 'grabbing' : 'grab'
                }}
                onWheel={this.handleWheel}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseUp}
                onDrop={(e) => {
                    e.preventDefault();
                    const nodeData = JSON.parse(e.dataTransfer.getData('application/node-type'));
                    this.addNode(nodeData, e.clientX, e.clientY);
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* 渲染连接线 */}
                    {connections.map(conn => {
                        const sourceNode = nodes.find(n => n.id === conn.sourceId);
                        const targetNode = nodes.find(n => n.id === conn.targetId);
                        if (!sourceNode || !targetNode) return null;

                        const startX = sourceNode.x + sourceNode.width;
                        const startY = sourceNode.y + sourceNode.height / 2;
                        const endX = targetNode.x;
                        const endY = targetNode.y + targetNode.height / 2;

                        return (
                            <svg
                                key={conn.id}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none'
                                }}
                            >
                                <path
                                    d={`M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`}
                                    stroke={theme === 'dark' ? '#5A6270' : '#C4C9D1'}
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrowhead)"
                                />
                            </svg>
                        );
                    })}

                    {/* 渲染节点 */}
                    {nodes.map(node => (
                        <div
                            key={node.id}
                            style={{
                                position: 'absolute',
                                left: node.x,
                                top: node.y,
                                width: node.width,
                                height: node.height,
                                backgroundColor: node.color,
                                border: `2px solid ${selectedNodes.includes(node.id) ? '#2D74FF' : 'transparent'}`,
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'white',
                                textAlign: 'center',
                                userSelect: 'none'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.setState(prevState => ({
                                    selectedNodes: prevState.selectedNodes.includes(node.id) ? [] : [node.id]
                                }));
                            }}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/node-move', node.id);
                            }}
                        >
                            <Icon icon={this.getNodeIcon(node.type)} size={14} style={{ marginBottom: '4px' }} />
                            <div>{node.label}</div>
                        </div>
                    ))}
                </div>

                {/* 箭头标记定义 */}
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 10 3.5, 0 7"
                                fill={theme === 'dark' ? '#5A6270' : '#C4C9D1'}
                            />
                        </marker>
                    </defs>
                </svg>
            </div>
        );
    };

    private getNodeIcon = (type: string) => {
        switch (type) {
            case 'trigger': return 'play';
            case 'condition': return 'filter';
            case 'action': return 'exchange';
            case 'risk': return 'shield';
            default: return 'dot';
        }
    };

    private renderRightPanel = () => {
        const { theme, selectedStrategy } = this.state;
        const backgroundColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';

        return (
            <div style={{
                width: '300px',
                backgroundColor,
                borderLeft: `1px solid ${borderColor}`,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div>
                    <h4 style={{ color: textColor, marginBottom: '12px' }}>Strategy Info</h4>
                    <div style={{
                        fontSize: '13px',
                        marginBottom: '8px',
                        color: textColor
                    }}>
                        <strong>Name:</strong> {selectedStrategy || 'Untitled Strategy'}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        marginBottom: '8px',
                        color: textColor
                    }}>
                        <strong>Nodes:</strong> {this.state.nodes.length}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: textColor
                    }}>
                        <strong>Connections:</strong> {this.state.connections.length}
                    </div>
                </div>

                <div>
                    <h4 style={{ color: textColor, marginBottom: '12px' }}>Performance</h4>
                    <div style={{
                        padding: '12px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px',
                            color: textColor
                        }}>
                            <span>Win Rate:</span>
                            <span>62.5%</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px',
                            color: textColor
                        }}>
                            <span>Profit Factor:</span>
                            <span>1.45</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px',
                            color: textColor
                        }}>
                            <span>Max Drawdown:</span>
                            <span>-12.3%</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: textColor
                        }}>
                            <span>Sharpe Ratio:</span>
                            <span>1.82</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 style={{ color: textColor, marginBottom: '12px' }}>Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button
                            intent="primary"
                            text="Save Strategy"
                            style={{
                                border: `1px solid ${borderColor}`
                            }}
                        />
                        <Button
                            text="Export"
                            style={{
                                border: `1px solid ${borderColor}`,
                                color: textColor
                            }}
                        />
                        <Button
                            text="Backtest"
                            style={{
                                border: `1px solid ${borderColor}`,
                                color: textColor
                            }}
                        />
                        <Button
                            intent="danger"
                            text="Delete Selected"
                            onClick={this.deleteSelectedNodes}
                            style={{
                                border: `1px solid ${borderColor}`
                            }}
                        />
                    </div>
                </div>

                <div>
                    <h4 style={{ color: textColor, marginBottom: '12px' }}>Quick Stats</h4>
                    <div style={{
                        fontSize: '11px',
                        opacity: 0.7,
                        color: textColor
                    }}>
                        <div>Last Modified: Now</div>
                        <div>Version: 1.0</div>
                        <div>Complexity: Medium</div>
                    </div>
                </div>
            </div>
        );
    };

    private renderToolbar = () => {
        const { theme, zoom, selectedNodes, selectedMenu } = this.state;
        const backgroundColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const activeBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

        return (
            <div style={{
                padding: '8px 16px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* 缩放按钮组 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <Button
                            small
                            minimal
                            icon="zoom-out"
                            style={{
                                padding: '6px 8px',
                                borderRight: `1px solid ${borderColor}`,
                                borderRadius: 0,
                                color: textColor
                            }}
                            onClick={() => this.setState({ zoom: Math.max(0.1, zoom - 0.1) })}
                        />
                        <div style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: textColor,
                            minWidth: '50px',
                            textAlign: 'center',
                            backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                            borderRight: `1px solid ${borderColor}`
                        }}>
                            {Math.round(zoom * 100)}%
                        </div>
                        <Button
                            small
                            minimal
                            icon="zoom-in"
                            style={{
                                padding: '6px 8px',
                                borderRadius: 0,
                                color: textColor
                            }}
                            onClick={() => this.setState({ zoom: Math.min(3, zoom + 0.1) })}
                        />
                    </div>

                    {/* 重置视图按钮 */}
                    <Button
                        small
                        minimal
                        icon="home"
                        style={{
                            padding: '6px 8px',
                            border: `1px solid ${borderColor}`,
                            color: textColor
                        }}
                        onClick={() => this.setState({ zoom: 1, pan: { x: 0, y: 0 } })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '12px',
                        opacity: 0.7,
                        color: textColor
                    }}>
                        {selectedNodes.length} node(s) selected
                    </span>

                    <Button
                        small
                        minimal
                        icon="layout-auto"
                        text="Auto Layout"
                        style={{
                            border: `1px solid ${borderColor}`,
                            color: textColor
                        }}
                    />

                    <Button
                        small
                        minimal
                        icon="clean"
                        text="Clear All"
                        style={{
                            border: `1px solid ${borderColor}`,
                            color: textColor
                        }}
                    />
                </div>
            </div>
        );
    };


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
      .strategy-editor-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .strategy-editor-scrollbar::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        border-radius: 3px;
      }
      
      .strategy-editor-scrollbar::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 3px;
      }
      
      .strategy-editor-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
      }
      
      .node-item {
        transition: all 0.2s ease;
        cursor: grab;
      }
      
      .node-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      
      .connection-path {
        transition: stroke 0.2s ease;
      }
      
      .connection-path:hover {
        stroke: ${primaryColor} !important;
        stroke-width: 3px !important;
      }
    `;
    };

    render() {
        const { containerHeight, theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';

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

                {this.renderToolbar()}

                <div style={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden',
                    height: '100%'
                }}>
                    {this.renderLeftPanel()}

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {this.renderCanvas()}
                    </div>

                    {this.renderRightPanel()}
                </div>
            </div>
        );
    }
}

export default TradeStrategyPageIndex;