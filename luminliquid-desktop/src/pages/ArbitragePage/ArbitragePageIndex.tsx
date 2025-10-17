import React from 'react';
import { Card, Elevation, Tag, InputGroup, ProgressBar, Switch, Button } from '@blueprintjs/core';
import ReactECharts from 'echarts-for-react';
import { themeManager } from '../../globals/theme/ThemeManager';
import NewsPanel from './NewsPanel';
import EventsPanel from './EventsPanel';
import RiskIndicator from './RiskIndicator';
import { overflowManager } from '../../globals/theme/OverflowTypeManager';

interface ArbitragePageIndexOpportunity {
    id: string;
    name: string;
    status: 'active' | 'pending' | 'expired';
    profitPotential: number;
    riskLevel: 'low' | 'medium' | 'high';
    timeframe: string;
    networks: string[];
    assets: {
        buy: { asset: string; exchange: string; price: number };
        sell: { asset: string; exchange: string; price: number };
    };
    volume: number;
    slippage: number;
    gasCost: number;
    lastUpdated: string;
    confidence: number;
    performanceData: {
        hourly: number[];
        daily: number[];
    };
    allocation: {
        buy: number;
        sell: number;
        fees: number;
    };
}

interface ArbitragePageIndexState {
    theme: 'dark' | 'light';
    opportunities: ArbitragePageIndexOpportunity[];
    searchQuery: string;
    autoRefresh: boolean;
    selectedOpportunity: string | null;
    containerHeight: number;
    showRightPanel: boolean;
    containerWidth: number;
    expandedCards: Set<string>;
}

class ArbitragePageIndex extends React.Component<{}, ArbitragePageIndexState> {
    private unsubscribe: (() => void) | null = null;
    private refreshInterval: NodeJS.Timeout | null = null;
    private containerRef = React.createRef<HTMLDivElement>();
    private resizeObserver: ResizeObserver | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            searchQuery: '',
            autoRefresh: true,
            selectedOpportunity: null,
            containerHeight: 0,
            showRightPanel: true,
            containerWidth: 0,
            expandedCards: new Set(),
            opportunities: [
                {
                    id: '1',
                    name: 'ETH Tri-Arbitrage',
                    status: 'active',
                    profitPotential: 2.45,
                    riskLevel: 'medium',
                    timeframe: '5min',
                    networks: ['Ethereum', 'Binance', 'Polygon'],
                    assets: {
                        buy: { asset: 'ETH', exchange: 'Uniswap', price: 3245.67 },
                        sell: { asset: 'ETH', exchange: 'Binance', price: 3320.45 }
                    },
                    volume: 1250000,
                    slippage: 0.15,
                    gasCost: 45.20,
                    lastUpdated: '14:30:25',
                    confidence: 85,
                    performanceData: {
                        hourly: [1.2, 1.8, 2.1, 1.9, 2.3, 2.4, 2.1, 2.5],
                        daily: [1.5, 2.1, 1.8, 2.3, 2.0, 2.4, 2.2, 2.5, 2.3, 2.1, 2.4, 2.45]
                    },
                    allocation: {
                        buy: 65,
                        sell: 30,
                        fees: 5
                    }
                },
                {
                    id: '2',
                    name: 'BTC Cross-Exchange',
                    status: 'active',
                    profitPotential: 1.89,
                    riskLevel: 'low',
                    timeframe: '3min',
                    networks: ['Bitcoin', 'Lightning'],
                    assets: {
                        buy: { asset: 'BTC', exchange: 'Coinbase', price: 67432.10 },
                        sell: { asset: 'BTC', exchange: 'Kraken', price: 68520.35 }
                    },
                    volume: 8500000,
                    slippage: 0.08,
                    gasCost: 12.50,
                    lastUpdated: '14:28:10',
                    confidence: 92,
                    performanceData: {
                        hourly: [0.8, 1.2, 1.5, 1.4, 1.6, 1.7, 1.8, 1.9],
                        daily: [1.0, 1.3, 1.5, 1.6, 1.7, 1.8, 1.8, 1.85, 1.87, 1.88, 1.89, 1.89]
                    },
                    allocation: {
                        buy: 70,
                        sell: 25,
                        fees: 5
                    }
                },
                {
                    id: '3',
                    name: 'DeFi Yield Loop',
                    status: 'pending',
                    profitPotential: 3.25,
                    riskLevel: 'high',
                    timeframe: '15min',
                    networks: ['Ethereum', 'Avalanche', 'Arbitrum'],
                    assets: {
                        buy: { asset: 'USDC', exchange: 'Curve', price: 1.001 },
                        sell: { asset: 'USDT', exchange: 'SushiSwap', price: 1.034 }
                    },
                    volume: 450000,
                    slippage: 0.35,
                    gasCost: 78.90,
                    lastUpdated: '14:25:45',
                    confidence: 68,
                    performanceData: {
                        hourly: [2.1, 2.5, 2.8, 2.9, 3.0, 3.1, 3.2, 3.25],
                        daily: [1.8, 2.2, 2.5, 2.7, 2.9, 3.0, 3.1, 3.15, 3.2, 3.22, 3.24, 3.25]
                    },
                    allocation: {
                        buy: 60,
                        sell: 35,
                        fees: 5
                    }
                },
                {
                    id: '4',
                    name: 'Stablecoin Arb',
                    status: 'active',
                    profitPotential: 0.45,
                    riskLevel: 'low',
                    timeframe: '1min',
                    networks: ['Polygon', 'Optimism'],
                    assets: {
                        buy: { asset: 'DAI', exchange: 'Aave', price: 0.998 },
                        sell: { asset: 'USDC', exchange: 'Balancer', price: 1.002 }
                    },
                    volume: 2500000,
                    slippage: 0.05,
                    gasCost: 5.80,
                    lastUpdated: '14:22:30',
                    confidence: 95,
                    performanceData: {
                        hourly: [0.3, 0.35, 0.38, 0.4, 0.42, 0.43, 0.44, 0.45],
                        daily: [0.25, 0.3, 0.33, 0.36, 0.39, 0.41, 0.43, 0.44, 0.445, 0.448, 0.449, 0.45]
                    },
                    allocation: {
                        buy: 75,
                        sell: 20,
                        fees: 5
                    }
                },

                {
                    id: '5',
                    name: 'Stablecoin Arb',
                    status: 'active',
                    profitPotential: 0.45,
                    riskLevel: 'low',
                    timeframe: '1min',
                    networks: ['Polygon', 'Optimism'],
                    assets: {
                        buy: { asset: 'DAI', exchange: 'Aave', price: 0.998 },
                        sell: { asset: 'USDC', exchange: 'Balancer', price: 1.002 }
                    },
                    volume: 2500000,
                    slippage: 0.05,
                    gasCost: 5.80,
                    lastUpdated: '14:22:30',
                    confidence: 95,
                    performanceData: {
                        hourly: [0.3, 0.35, 0.38, 0.4, 0.42, 0.43, 0.44, 0.45],
                        daily: [0.25, 0.3, 0.33, 0.36, 0.39, 0.41, 0.43, 0.44, 0.445, 0.448, 0.449, 0.45]
                    },
                    allocation: {
                        buy: 75,
                        sell: 20,
                        fees: 5
                    }
                },
            ]
        };
    }

    componentDidMount() {
        overflowManager.setOverflow('hidden');
        this.unsubscribe = themeManager.subscribe((theme) => {
            this.setState({ theme });
        });
        this.updateContainerHeight();
        window.addEventListener('resize', this.updateContainerHeight);
        window.addEventListener('resize', this.updateContainerWidth);
        if (this.containerRef.current && this.containerRef.current.parentElement) {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateContainerHeight();
                this.updateContainerWidth();
            });
            this.resizeObserver.observe(this.containerRef.current.parentElement);
        }
        if (this.state.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        window.removeEventListener('resize', this.updateContainerHeight);
    }

    updateContainerWidth = () => {
        if (this.containerRef.current) {
            const width = this.containerRef.current.clientWidth;
            this.setState({
                containerWidth: width,
                showRightPanel: width > 800
            });
        }
    };

    updateContainerHeight = () => {
        if (this.containerRef.current && this.containerRef.current.parentElement) {
            const parentHeight = this.containerRef.current.parentElement.clientHeight;
            this.setState({ containerHeight: parentHeight });
        }
    };

    startAutoRefresh = () => {
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 5000);
    };

    refreshData = () => {
        console.log('Refreshing arbitrage data...');
    };

    handleAutoRefreshChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const autoRefresh = event.target.checked;
        this.setState({ autoRefresh });

        if (autoRefresh) {
            this.startAutoRefresh();
        } else if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    };

    formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    getStatusColor = (status: string): string => {
        switch (status) {
            case 'active': return '#0F9D58';
            case 'pending': return '#F4B400';
            case 'expired': return '#DB4437';
            default: return '#9AA0A6';
        }
    };

    getRiskLevelColor = (riskLevel: string): string => {
        switch (riskLevel) {
            case 'low': return '#0F9D58';
            case 'medium': return '#F4B400';
            case 'high': return '#DB4437';
            default: return '#9AA0A6';
        }
    };

    getNetworkColor = (network: string): string => {
        const colors: { [key: string]: string } = {
            'Ethereum': '#627EEA',
            'Binance': '#F3BA2F',
            'Polygon': '#8247E5',
            'Avalanche': '#E84142',
            'Arbitrum': '#28A0F0',
            'Optimism': '#FF0420',
            'Bitcoin': '#F7931A',
            'Lightning': '#8A2BE2'
        };
        return colors[network] || '#9AA0A6';
    };

    getScrollbarStyles = () => {
        const { theme } = this.state;
        const trackColor = theme === 'dark' ? '#30404D' : '#EBF1F5';
        const thumbColor = theme === 'dark' ? '#5C7080' : '#8A9BA8';
        const thumbHoverColor = theme === 'dark' ? '#738694' : '#A7B6C2';

        return {
            /* Webkit browsers (Chrome, Safari) */
            '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px'
            },
            '&::-webkit-scrollbar-track': {
                background: trackColor,
                borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
                background: thumbColor,
                borderRadius: '3px',
                '&:hover': {
                    background: thumbHoverColor
                }
            },
            /* Firefox */
            scrollbarWidth: 'thin' as const,
            scrollbarColor: `${thumbColor} ${trackColor}`
        };
    };

    getPerformanceChartOption = (performanceData: number[]) => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const backgroundColor = 'transparent';

        return {
            backgroundColor,
            textStyle: { color: textColor, fontSize: 8 },
            grid: {
                left: '2%',
                right: '2%',
                top: '5%',
                bottom: '5%',
                containLabel: false
            },
            xAxis: {
                type: 'category',
                show: false,
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                show: false
            },
            series: [{
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    width: 1.5,
                    color: '#0F9D58'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(15, 157, 88, 0.3)'
                        }, {
                            offset: 1, color: 'rgba(15, 157, 88, 0.05)'
                        }]
                    }
                },
                data: performanceData
            }]
        };
    };

    renderLeftPanel = () => {
        const { theme, containerHeight, searchQuery, autoRefresh, opportunities, showRightPanel } = this.state;
        const scrollbarStyles = this.getScrollbarStyles();
        const filteredOpportunities = opportunities.filter(opp =>
            opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.assets.buy.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.assets.sell.asset.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div style={{
                flex: showRightPanel ? '0 0 50%' : '1',
                minWidth: showRightPanel ? '600px' : '800px',
                maxWidth: showRightPanel ? '50%' : '100%',
                borderRight: showRightPanel ? `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                height: containerHeight,
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box'
            }}>

                <div style={{
                    padding: '12px',
                    borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                        Arbitrage Opportunities
                        {!showRightPanel && (
                            <span style={{
                                fontSize: '11px',
                                color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                                marginLeft: '8px'
                            }}>
                            </span>
                        )}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Switch
                            checked={this.state.autoRefresh}
                            onChange={this.handleAutoRefreshChange}
                            label="Auto Refresh"
                            style={{ margin: 0, fontSize: '10px' }}
                        />
                        <InputGroup
                            small
                            leftIcon="search"
                            placeholder="Search opportunities..."
                            value={this.state.searchQuery}
                            onChange={(e) => this.setState({ searchQuery: e.target.value })}
                            style={{ width: '160px', fontSize: '10px' }}
                        />
                    </div>
                </div>


                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    overflowX: 'hidden',
                    padding: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    alignContent: 'start',
                    ...this.getScrollbarStyles()
                }}>
                    {this.state.opportunities
                        .filter(opp =>
                            opp.name.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
                            opp.assets.buy.asset.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
                            opp.assets.sell.asset.toLowerCase().includes(this.state.searchQuery.toLowerCase())
                        )
                        .map(this.renderOpportunityCard)}
                </div>
            </div>
        );
    };

    renderOpportunityCard = (opportunity: ArbitragePageIndexOpportunity) => {
        const { theme } = this.state;
        const getRiskStyle = (riskLevel: string) => {
            const baseStyle = {
                padding: '6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500' as const
            };
            switch (riskLevel) {
                case 'low':
                    return {
                        ...baseStyle,
                        backgroundColor: theme === 'dark' ? 'rgba(15, 157, 88, 0.15)' : 'rgba(15, 157, 88, 0.08)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(15, 157, 88, 0.4)' : 'rgba(15, 157, 88, 0.3)'}`,
                        color: theme === 'dark' ? '#48C78E' : '#0F9D58'
                    };
                case 'medium':
                    return {
                        ...baseStyle,
                        backgroundColor: theme === 'dark' ? 'rgba(244, 180, 0, 0.15)' : 'rgba(244, 180, 0, 0.08)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(244, 180, 0, 0.4)' : 'rgba(244, 180, 0, 0.3)'}`,
                        color: theme === 'dark' ? '#FFD24D' : '#B38700'
                    };
                case 'high':
                    return {
                        ...baseStyle,
                        backgroundColor: theme === 'dark' ? 'rgba(219, 68, 55, 0.15)' : 'rgba(219, 68, 55, 0.08)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(219, 68, 55, 0.4)' : 'rgba(219, 68, 55, 0.3)'}`,
                        color: theme === 'dark' ? '#FF6B6B' : '#DB4437'
                    };
                default:
                    return baseStyle;
            }
        };
        const getRiskText = (riskLevel: string) => {
            switch (riskLevel) {
                case 'low': return '低风险 - 相对安全';
                case 'medium': return '中等风险 - 建议监控';
                case 'high': return '高风险 - 谨慎操作';
                default: return '';
            }
        };
        return (
            <Card
                key={opportunity.id}
                elevation={Elevation.TWO}
                style={{
                    margin: 0,
                    backgroundColor: theme === 'dark' ? '#30404D' : '#FFFFFF',
                    border: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                    padding: '12px',
                    height: 'auto',
                    minHeight: '330px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                    minHeight: '40px'
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '4px',
                            flexWrap: 'wrap'
                        }}>
                            <h4 style={{
                                margin: 0,
                                fontSize: '13px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: '1.2'
                            }}>
                                {opportunity.name}
                            </h4>
                            <Tag
                                minimal
                                style={{
                                    fontSize: '9px',
                                    padding: '1px 4px',
                                    color: this.getStatusColor(opportunity.status)
                                }}
                            >
                                {opportunity.status.toUpperCase()}
                            </Tag>
                            <Tag
                                minimal
                                style={{
                                    fontSize: '9px',
                                    padding: '1px 4px',
                                    color: this.getRiskLevelColor(opportunity.riskLevel)
                                }}
                            >
                                {opportunity.riskLevel.toUpperCase()}
                            </Tag>
                        </div>


                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '2px',
                            fontSize: '11px',
                            marginBottom: '6px',
                            lineHeight: '1.3'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Buy:</span>
                                <span style={{ fontWeight: '600' }}>{opportunity.assets.buy.asset}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Price:</span>
                                <span>{this.formatCurrency(opportunity.assets.buy.price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Sell:</span>
                                <span style={{ fontWeight: '600' }}>{opportunity.assets.sell.asset}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Price:</span>
                                <span>{this.formatCurrency(opportunity.assets.sell.price)}</span>
                            </div>
                        </div>
                    </div>
                </div>


                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    fontSize: '10px',
                    marginBottom: '6px',
                    lineHeight: '1.3'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Profit</div>
                        <div style={{ fontWeight: '600', color: '#0F9D58' }}>+{opportunity.profitPotential}%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Gas Cost</div>
                        <div style={{ fontWeight: '600' }}>{this.formatCurrency(opportunity.gasCost)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Volume</div>
                        <div style={{ fontWeight: '600' }}>{this.formatCurrency(opportunity.volume)}</div>
                    </div>
                </div>


                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    minHeight: '20px'
                }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                        {opportunity.networks.slice(0, 3).map(network => (
                            <div
                                key={network}
                                style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    backgroundColor: this.getNetworkColor(network)
                                }}
                                title={network}
                            />
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '9px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>
                            Confidence
                        </span>
                        <ProgressBar
                            value={opportunity.confidence / 100}
                            intent={opportunity.confidence > 80 ? 'success' : opportunity.confidence > 60 ? 'warning' : 'danger'}
                            style={{ height: '3px', width: '30px' }}
                        />
                        <span style={{ fontSize: '9px', fontWeight: '600' }}>
                            {opportunity.confidence}%
                        </span>
                    </div>
                </div>


                <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '8px',
                    justifyContent: 'space-between',
                    padding: '6px',
                    backgroundColor: theme === 'dark' ? 'rgba(92, 112, 128, 0.2)' : 'rgba(235, 241, 245, 0.6)',
                    borderRadius: '4px',
                    minHeight: '32px'
                }}>
                    <Button
                        small
                        minimal
                        intent="success"
                        icon="arrow-up"
                        text="买入详情"
                        style={{
                            fontSize: '9px',
                            flex: 1,
                            padding: '2px 4px',
                            backgroundColor: theme === 'dark' ? 'rgba(15, 157, 88, 0.1)' : 'rgba(15, 157, 88, 0.05)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(15, 157, 88, 0.3)' : 'rgba(15, 157, 88, 0.2)'}`,
                            color: theme === 'dark' ? '#48C78E' : '#0F9D58',
                            minWidth: '60px'
                        }}
                    />
                    <Button
                        small
                        minimal
                        intent="danger"
                        icon="arrow-down"
                        text="卖出详情"
                        style={{
                            fontSize: '9px',
                            flex: 1,
                            padding: '2px 4px',
                            backgroundColor: theme === 'dark' ? 'rgba(219, 68, 55, 0.1)' : 'rgba(219, 68, 55, 0.05)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(219, 68, 55, 0.3)' : 'rgba(219, 68, 55, 0.2)'}`,
                            color: theme === 'dark' ? '#FF6B6B' : '#DB4437',
                            minWidth: '60px'
                        }}
                    />
                    <Button
                        small
                        minimal
                        intent="primary"
                        icon="trending-up"
                        text="执行套利"
                        style={{
                            fontSize: '9px',
                            flex: 1,
                            padding: '2px 4px',
                            backgroundColor: theme === 'dark' ? 'rgba(66, 133, 244, 0.1)' : 'rgba(66, 133, 244, 0.05)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(66, 133, 244, 0.3)' : 'rgba(66, 133, 244, 0.2)'}`,
                            color: theme === 'dark' ? '#64B5F6' : '#4285F4',
                            minWidth: '60px'
                        }}
                    />
                </div>


                <div style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: theme === 'dark' ? 'rgba(16, 22, 26, 0.3)' : 'rgba(245, 248, 250, 0.6)',
                    borderRadius: '4px',
                    border: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'hidden',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                        fontSize: '10px',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                    }}>
                        <div>
                            <div style={{
                                color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                                marginBottom: '1px',
                                whiteSpace: 'nowrap',
                                fontSize: '9px'
                            }}>
                                spread
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '10px' }}>
                                {((opportunity.assets.sell.price - opportunity.assets.buy.price) / opportunity.assets.buy.price * 100).toFixed(2)}%
                            </div>
                        </div>
                        <div>
                            <div style={{
                                color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                                marginBottom: '1px',
                                whiteSpace: 'nowrap',
                                fontSize: '9px'
                            }}>
                                net income
                            </div>
                            <div style={{ fontWeight: '600', color: '#0F9D58', fontSize: '10px' }}>
                                {this.formatCurrency(opportunity.volume * opportunity.profitPotential / 100)}
                            </div>
                        </div>
                    </div>


                    <div style={{
                        marginBottom: '8px',
                        fontSize: '10px',
                        lineHeight: '1.3'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2px'
                        }}>
                            <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080', fontSize: '9px' }}>滑点:</span>
                            <span style={{ fontWeight: '600', fontSize: '10px' }}>{opportunity.slippage}%</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2px'
                        }}>
                            <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080', fontSize: '9px' }}>时间窗口:</span>
                            <span style={{ fontWeight: '600', fontSize: '10px' }}>{opportunity.timeframe}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080', fontSize: '9px' }}>网络:</span>
                            <span style={{
                                fontWeight: '600',
                                fontSize: '9px',
                                textAlign: 'right',
                                maxWidth: '60%',
                                wordBreak: 'break-all'
                            }}>
                                {opportunity.networks.join(', ')}
                            </span>
                        </div>
                    </div>


                    <div style={{
                        ...getRiskStyle(opportunity.riskLevel),
                        marginTop: 'auto',
                        padding: '4px',
                        fontSize: '9px',
                        lineHeight: '1.2'
                    }}>
                        <div style={{
                            color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                            marginBottom: '1px',
                            fontSize: '8px'
                        }}>
                            risk assessment: {opportunity.riskLevel.toUpperCase()}
                        </div>
                        <div style={{ fontWeight: '500' }}>
                            {getRiskText(opportunity.riskLevel)}
                        </div>
                    </div>
                </div>
            </Card>
        );
    };




    getCompactPerformanceChartOption = (performanceData: number[]) => {
        const { theme } = this.state;

        return {
            backgroundColor: 'transparent',
            grid: {
                left: '0%',
                right: '0%',
                top: '0%',
                bottom: '0%',
                containLabel: false
            },
            xAxis: {
                type: 'category',
                show: false
            },
            yAxis: {
                type: 'value',
                show: false
            },
            series: [{
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    width: 1,
                    color: '#0F9D58'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(15, 157, 88, 0.3)'
                        }, {
                            offset: 1, color: 'rgba(15, 157, 88, 0.05)'
                        }]
                    }
                },
                data: performanceData
            }]
        };
    };

    renderRightPanel = () => {
        const { theme, containerHeight } = this.state;
        const scrollbarStyles = this.getScrollbarStyles();
        const headerHeight = 35;
        const panelHeight = containerHeight / 3;
        return (
            <div style={{
                flex: '0 0 50%',
                display: 'flex',
                flexDirection: 'column',
                height: containerHeight || '100vh',
                overflow: 'hidden',
                backgroundColor: theme === 'dark' ? '#202B33' : '#F5F8FA'
            }}>
                <div style={{
                    flex: '0 0 33.333%',
                    display: 'flex',
                    minHeight: 0,
                    borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`
                }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`
                    }}>
                        <NewsPanel
                            theme={theme}
                            headerHeight={headerHeight}
                            scrollbarStyles={scrollbarStyles}
                            panelHeight={panelHeight}
                        />
                    </div>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <EventsPanel
                            theme={theme}
                            headerHeight={headerHeight}
                            scrollbarStyles={scrollbarStyles}
                            panelHeight={panelHeight}
                        />
                    </div>
                </div>
                <div style={{
                    flex: '0 0 33.333%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`
                }}>
                    <div style={{
                        height: `${headerHeight}px`,
                        padding: '8px 12px',
                        borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0,
                        backgroundColor: theme === 'dark' ? '#30404D' : '#EBF1F5'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>Trading Signals</h3>
                        <span style={{ fontSize: '9px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>
                            Auto-refresh
                        </span>
                    </div>
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        overflowX: 'hidden' as const,
                        minHeight: 0,
                        ...scrollbarStyles
                    }}>

                        {[
                            { id: 1, type: 'ARB', pair: 'ETH/USDT', exchanges: 'Binance→Kraken', spread: 0.45, timestamp: '14:35:22', confidence: 92 },
                            { id: 2, type: 'MM', pair: 'BTC/USD', exchanges: 'Coinbase Pro', spread: 0.12, timestamp: '14:34:15', confidence: 88 },
                            { id: 3, type: 'TREND', pair: 'SOL/USD', exchanges: 'FTX', spread: 1.23, timestamp: '14:33:08', confidence: 85 },
                            { id: 4, type: 'ARB', pair: 'ADA/USDT', exchanges: 'Huobi→OKX', spread: 0.67, timestamp: '14:32:45', confidence: 78 },
                            { id: 5, type: 'BREAKOUT', pair: 'DOT/USD', exchanges: 'Kraken', spread: 2.15, timestamp: '14:31:30', confidence: 91 },
                            { id: 6, type: 'ARB', pair: 'LINK/USDT', exchanges: 'Gate.io→MEXC', spread: 0.89, timestamp: '14:30:22', confidence: 83 },
                            { id: 7, type: 'REVERSAL', pair: 'AVAX/USD', exchanges: 'Crypto.com', spread: 1.45, timestamp: '14:29:15', confidence: 76 },
                            { id: 8, type: 'ARB', pair: 'MATIC/USDT', exchanges: 'KuCoin→Bybit', spread: 0.56, timestamp: '14:28:08', confidence: 87 }
                        ].map(signal => (
                            <div key={signal.id} style={{
                                padding: '6px 8px',
                                borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                                fontSize: '10px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{
                                            padding: '1px 4px',
                                            backgroundColor: signal.type === 'ARB' ? '#0F9D58' :
                                                signal.type === 'MM' ? '#4285F4' : '#F4B400',
                                            color: 'white',
                                            borderRadius: '3px',
                                            fontSize: '8px',
                                            fontWeight: '600'
                                        }}>
                                            {signal.type}
                                        </span>
                                        <span style={{ fontWeight: '600' }}>{signal.pair}</span>
                                    </div>
                                    <span style={{
                                        fontSize: '9px',
                                        color: '#0F9D58',
                                        fontWeight: '600'
                                    }}>
                                        +{signal.spread}%
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>
                                        {signal.exchanges}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '8px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>
                                            {signal.timestamp}
                                        </span>
                                        <div style={{
                                            width: '20px',
                                            height: '4px',
                                            backgroundColor: theme === 'dark' ? '#5C7080' : '#E1E8ED',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${signal.confidence}%`,
                                                height: '100%',
                                                backgroundColor: signal.confidence > 80 ? '#0F9D58' :
                                                    signal.confidence > 70 ? '#F4B400' : '#DB4437'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{
                    flex: '0 0 33.333%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}>
                    <div style={{
                        height: `${headerHeight}px`,
                        padding: '8px 12px',
                        borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0,
                        backgroundColor: theme === 'dark' ? '#30404D' : '#EBF1F5'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>Risk & System</h3>
                        <span style={{ fontSize: '9px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>
                            All Systems Normal
                        </span>
                    </div>
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        overflowX: 'hidden' as const,
                        minHeight: 0,
                        padding: '6px',
                        ...scrollbarStyles
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gridTemplateRows: 'repeat(6, 1fr)',
                            gap: '4px',
                            fontSize: '9px',
                            height: '100%'
                        }}>
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '3px',
                            marginTop: '6px',
                            padding: '4px 0',
                            borderTop: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                            fontSize: '8px'
                        }}>
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M" change={'123'} trend={'up'} status={'warning'} />
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '6px',
                            padding: '4px 0',
                            borderTop: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                            fontSize: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Risk Level:</span>
                                <span style={{
                                    fontWeight: '600',
                                    color: '#F4B400'
                                }}>
                                    MEDIUM
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>System:</span>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: '#0F9D58',
                                    animation: 'pulse 2s infinite'
                                }} />
                                <span style={{ fontWeight: '600', color: '#0F9D58' }}>STABLE</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    };

    render() {
        overflowManager.setOverflow('hidden');
        const { containerHeight, showRightPanel } = this.state;
        return (
            <div
                ref={this.containerRef}
                style={{
                    padding: '0',
                    backgroundColor: this.state.theme === 'dark' ? '#2F343C' : '#FFFFFF',
                    minHeight: '100vh',
                    color: this.state.theme === 'dark' ? '#F5F8FA' : '#182026',
                    display: 'flex',
                    height: containerHeight || '100vh',
                    minWidth: '800px',
                    maxWidth: '100vw',
                    overflow: 'hidden'
                }}
            >
                {this.renderLeftPanel()}
                {showRightPanel && this.renderRightPanel()}
            </div>
        );
    }
}

export default ArbitragePageIndex;