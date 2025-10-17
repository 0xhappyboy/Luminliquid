import React from 'react';
import { Card, Elevation, Tag, InputGroup, ProgressBar, Switch } from '@blueprintjs/core';
import ReactECharts from 'echarts-for-react';
import { themeManager } from '../../globals/theme/ThemeManager';
import NewsPanel from './NewsPanel';
import EventsPanel from './EventsPanel';
import RiskIndicator from './RiskIndicator';

interface ArbitrageOpportunity {
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

interface ArbitrageDiscoveryState {
    theme: 'dark' | 'light';
    opportunities: ArbitrageOpportunity[];
    searchQuery: string;
    autoRefresh: boolean;
    selectedOpportunity: string | null;
    containerHeight: number;
    showRightPanel: boolean;
    containerWidth: number;
}

class ArbitrageDiscoveryDashboard extends React.Component<{}, ArbitrageDiscoveryState> {
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
                }
            ]
        };
    }

    componentDidMount() {
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


    getPieChartOption = (allocation: { buy: number; sell: number; fees: number }) => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const backgroundColor = 'transparent';

        return {
            backgroundColor,
            textStyle: {
                color: textColor,
                fontSize: 8
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}%',
                textStyle: {
                    fontSize: 9
                }
            },
            series: [{
                name: 'Allocation',
                type: 'pie',
                radius: ['45%', '65%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}\n{c}%',
                    fontSize: 7,
                    lineHeight: 10,
                    color: textColor
                },
                labelLine: {
                    length: 4,
                    length2: 6,
                    smooth: true
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 8,
                        fontWeight: 'bold'
                    }
                },
                data: [
                    {
                        value: allocation.buy,
                        name: 'Buy',
                        itemStyle: { color: '#0F9D58' }
                    },
                    {
                        value: allocation.sell,
                        name: 'Sell',
                        itemStyle: { color: '#DB4437' }
                    },
                    {
                        value: allocation.fees,
                        name: 'Fees',
                        itemStyle: { color: '#F4B400' }
                    }
                ]
            }]
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

    renderOpportunityCard = (opportunity: ArbitrageOpportunity) => {
        const { theme, selectedOpportunity } = this.state;
        const isSelected = selectedOpportunity === opportunity.id;
        const cardBackground = theme === 'dark' ? '#30404D' : '#FFFFFF';
        const borderColor = isSelected ?
            (theme === 'dark' ? '#48AFF0' : '#137CBD') :
            (theme === 'dark' ? '#5C7080' : '#E1E8ED');

        return (
            <Card
                key={opportunity.id}
                elevation={Elevation.TWO}
                interactive
                style={{
                    marginBottom: '8px',
                    backgroundColor: cardBackground,
                    border: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    padding: '8px'
                }}
                onClick={() => this.setState({ selectedOpportunity: opportunity.id })}
            >
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {opportunity.name}
                                    </h4>
                                    <Tag
                                        minimal
                                        style={{
                                            fontSize: '7px',
                                            padding: '1px 3px',
                                            color: this.getStatusColor(opportunity.status)
                                        }}
                                    >
                                        {opportunity.status.toUpperCase()}
                                    </Tag>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', marginBottom: '2px' }}>
                                    <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Buy:</span>
                                    <span style={{ fontWeight: '600' }}>
                                        {opportunity.assets.buy.asset} @ {opportunity.assets.buy.exchange}
                                    </span>
                                    <span>{this.formatCurrency(opportunity.assets.buy.price)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', marginBottom: '4px' }}>
                                    <span style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Sell:</span>
                                    <span style={{ fontWeight: '600' }}>
                                        {opportunity.assets.sell.asset} @ {opportunity.assets.sell.exchange}
                                    </span>
                                    <span>{this.formatCurrency(opportunity.assets.sell.price)}</span>
                                </div>
                            </div>
                        </div>


                        <div style={{ height: '25px', marginBottom: '4px' }}>
                            <ReactECharts
                                option={this.getPerformanceChartOption(opportunity.performanceData.hourly)}
                                style={{ height: '25px' }}
                                opts={{ renderer: 'svg' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag
                                    minimal
                                    style={{
                                        fontSize: '7px',
                                        padding: '1px 3px',
                                        color: this.getRiskLevelColor(opportunity.riskLevel)
                                    }}
                                >
                                    {opportunity.riskLevel.toUpperCase()}
                                </Tag>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    {opportunity.networks.slice(0, 2).map(network => (
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
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <span>Slippage: {opportunity.slippage}%</span>
                                <span>Gas: {this.formatCurrency(opportunity.gasCost)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', marginBottom: '1px' }}>
                                <span>Confidence</span>
                                <span>{opportunity.confidence}%</span>
                            </div>
                            <ProgressBar
                                value={opportunity.confidence / 100}
                                intent={opportunity.confidence > 80 ? 'success' : opportunity.confidence > 60 ? 'warning' : 'danger'}
                                style={{ height: '3px' }}
                            />
                        </div>

                        <div style={{ marginTop: '4px', fontSize: '7px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080', textAlign: 'right' }}>
                            Updated: {opportunity.lastUpdated}
                        </div>
                    </div>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            position: 'relative'
                        }}>
                            <ReactECharts
                                option={this.getPieChartOption(opportunity.allocation)}
                                style={{ width: '70px', height: '70px' }}
                                opts={{
                                    renderer: 'svg',
                                    width: 70,
                                    height: 70
                                }}
                            />
                        </div>
                        <div style={{
                            fontSize: '8px',
                            fontWeight: '600',
                            color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                            marginTop: '2px',
                            textAlign: 'center'
                        }}>
                            Allocation
                        </div>
                    </div>
                </div>
                <div style={{
                    marginTop: '6px',
                    padding: '4px 6px',
                    backgroundColor: theme === 'dark' ? '#202B33' : '#F5F8FA',
                    borderRadius: '3px',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#0F9D58' }}>
                        Profit Potential: +{opportunity.profitPotential}% • Timeframe: {opportunity.timeframe}
                    </span>
                </div>
            </Card>
        );
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
                borderRight: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                display: 'flex',
                flexDirection: 'column',
                height: containerHeight
            }}>

                <div style={{
                    padding: '12px',
                    borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Arbitrage Opportunities</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Switch
                            checked={autoRefresh}
                            onChange={this.handleAutoRefreshChange}
                            label="Auto Refresh"
                            style={{ margin: 0, fontSize: '10px' }}
                        />
                        <InputGroup
                            small
                            leftIcon="search"
                            placeholder="Search opportunities..."
                            value={searchQuery}
                            onChange={(e) => this.setState({ searchQuery: e.target.value })}
                            style={{ width: '160px', fontSize: '10px' }}
                        />
                    </div>
                </div>
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    overflowX: 'hidden' as const,
                    padding: '8px',
                    ...scrollbarStyles
                }}>
                    {filteredOpportunities.map(this.renderOpportunityCard)}
                </div>
            </div>
        );
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
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            />
                            <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            /> <RiskIndicator
                                theme={theme}
                                label="Total Exposure"
                                value="$2.45M"
                            />
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
                            <RiskIndicator theme={theme} label="24h Volume" value="$4.2M" />
                            <RiskIndicator theme={theme} label="Failed Trades" value="3" />
                            <RiskIndicator theme={theme} label="Slippage Avg" value="0.12%" />
                            <RiskIndicator theme={theme} label="Gas Used" value="124.5 ETH" />
                            <RiskIndicator theme={theme} label="Active Chains" value="6" />
                            <RiskIndicator theme={theme} label="Last Update" value="14:35:22" />
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

export default ArbitrageDiscoveryDashboard;