import React from 'react';
import { Card, Elevation, ProgressBar, Button, Tag, HTMLTable } from '@blueprintjs/core';
import ReactECharts from 'echarts-for-react';
import { themeManager } from '../globals/theme/ThemeManager';

interface TransactionRecord {
    id: string;
    date: string;
    type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
    asset: string;
    amount: number;
    price: number;
    total: number;
    status: 'completed' | 'pending' | 'failed';
    network: string;
}

interface RiskAnalysis {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
    valueAtRisk: number;
    stressTest: {
        scenario: string;
        impact: number;
    }[];
}

interface ProfitLossAnalysis {
    realized: number;
    unrealized: number;
    totalGainLoss: number;
    byAsset: {
        asset: string;
        gainLoss: number;
        percentage: number;
        network: string;
    }[];
}

interface NetworkData {
    name: string;
    totalBalance: number;
    availableBalance: number;
    investedAmount: number;
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
    riskLevel: 'low' | 'medium' | 'high';
    portfolioDistribution: {
        stocks: number;
        bonds: number;
        crypto: number;
        cash: number;
        others: number;
    };
    profitLoss: ProfitLossAnalysis;
    risk: RiskAnalysis;
}

interface WalletAnalysisState {
    theme: 'dark' | 'light';
    networks: NetworkData[];
    transactions: TransactionRecord[];
    selectedNetwork: string;
}

class WalletAnalysisDashboard extends React.Component<{}, WalletAnalysisState> {
    private unsubscribe: (() => void) | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
            selectedNetwork: 'all',
            networks: [
                {
                    name: 'Ethereum Mainnet',
                    totalBalance: 85430.25,
                    availableBalance: 15430.25,
                    investedAmount: 70000.00,
                    dailyChange: 1.89,
                    weeklyChange: 4.23,
                    monthlyChange: 15.67,
                    riskLevel: 'high',
                    portfolioDistribution: { stocks: 35, bonds: 15, crypto: 40, cash: 5, others: 5 },
                    profitLoss: {
                        realized: 8920.50,
                        unrealized: 5630.25,
                        totalGainLoss: 14550.75,
                        byAsset: [
                            { asset: 'ETH', gainLoss: 6230.25, percentage: 18.5, network: 'Ethereum' },
                            { asset: 'UNI', gainLoss: 2150.75, percentage: 12.3, network: 'Ethereum' },
                            { asset: 'LINK', gainLoss: 890.50, percentage: 8.7, network: 'Ethereum' },
                            { asset: 'AAVE', gainLoss: 1280.25, percentage: 15.2, network: 'Ethereum' }
                        ]
                    },
                    risk: {
                        volatility: 22.8,
                        sharpeRatio: 1.08,
                        maxDrawdown: -18.5,
                        beta: 1.25,
                        valueAtRisk: -12450.75,
                        stressTest: [
                            { scenario: 'Gas Spike', impact: -3250.50 },
                            { scenario: 'DeFi Hack', impact: -8560.25 }
                        ]
                    }
                },
                {
                    name: 'Binance Smart Chain',
                    totalBalance: 28750.60,
                    availableBalance: 5750.60,
                    investedAmount: 23000.00,
                    dailyChange: 3.45,
                    weeklyChange: 7.89,
                    monthlyChange: 22.34,
                    riskLevel: 'medium',
                    portfolioDistribution: { stocks: 25, bonds: 20, crypto: 45, cash: 5, others: 5 },
                    profitLoss: {
                        realized: 4230.80,
                        unrealized: 1850.40,
                        totalGainLoss: 6081.20,
                        byAsset: [
                            { asset: 'BNB', gainLoss: 2850.60, percentage: 25.7, network: 'BSC' },
                            { asset: 'CAKE', gainLoss: 1230.45, percentage: 18.9, network: 'BSC' },
                            { asset: 'BUSD', gainLoss: 450.25, percentage: 2.1, network: 'BSC' }
                        ]
                    },
                    risk: {
                        volatility: 16.3,
                        sharpeRatio: 1.45,
                        maxDrawdown: -12.8,
                        beta: 0.95,
                        valueAtRisk: -5230.80,
                        stressTest: [
                            { scenario: 'Bridge Attack', impact: -6850.25 },
                            { scenario: 'Validator Issue', impact: -3120.60 }
                        ]
                    }
                },
                {
                    name: 'Polygon',
                    totalBalance: 15240.90,
                    availableBalance: 3240.90,
                    investedAmount: 12000.00,
                    dailyChange: 2.12,
                    weeklyChange: 5.43,
                    monthlyChange: 18.76,
                    riskLevel: 'medium',
                    portfolioDistribution: { stocks: 20, bonds: 25, crypto: 40, cash: 10, others: 5 },
                    profitLoss: {
                        realized: 2460.25,
                        unrealized: 950.65,
                        totalGainLoss: 3410.90,
                        byAsset: [
                            { asset: 'MATIC', gainLoss: 1850.40, percentage: 15.8, network: 'Polygon' },
                            { asset: 'QUICK', gainLoss: 610.25, percentage: 12.3, network: 'Polygon' }
                        ]
                    },
                    risk: {
                        volatility: 14.2,
                        sharpeRatio: 1.32,
                        maxDrawdown: -10.5,
                        beta: 0.88,
                        valueAtRisk: -2850.40,
                        stressTest: [
                            { scenario: 'Network Congestion', impact: -1850.75 },
                            { scenario: 'Liquidity Crisis', impact: -2420.30 }
                        ]
                    }
                },
                {
                    name: 'Avalanche',
                    totalBalance: 18920.45,
                    availableBalance: 4920.45,
                    investedAmount: 14000.00,
                    dailyChange: 4.23,
                    weeklyChange: 9.12,
                    monthlyChange: 28.45,
                    riskLevel: 'high',
                    portfolioDistribution: { stocks: 15, bonds: 20, crypto: 55, cash: 5, others: 5 },
                    profitLoss: {
                        realized: 3120.80,
                        unrealized: 1699.65,
                        totalGainLoss: 4820.45,
                        byAsset: [
                            { asset: 'AVAX', gainLoss: 3250.25, percentage: 28.9, network: 'Avalanche' },
                            { asset: 'JOE', gainLoss: 570.20, percentage: 15.6, network: 'Avalanche' }
                        ]
                    },
                    risk: {
                        volatility: 19.8,
                        sharpeRatio: 1.18,
                        maxDrawdown: -15.7,
                        beta: 1.12,
                        valueAtRisk: -4230.85,
                        stressTest: [
                            { scenario: 'Subnet Failure', impact: -2850.60 },
                            { scenario: 'Validator Attack', impact: -3560.45 }
                        ]
                    }
                }
            ],
            transactions: [
                { id: '1', date: '2024-05-15', type: 'buy', asset: 'ETH', amount: 2.5, price: 3200, total: 8000, status: 'completed', network: 'Ethereum Mainnet' },
                { id: '2', date: '2024-05-15', type: 'sell', asset: 'BNB', amount: 15, price: 580, total: 8700, status: 'completed', network: 'Binance Smart Chain' },
                { id: '3', date: '2024-05-14', type: 'deposit', asset: 'USDC', amount: 5000, price: 1, total: 5000, status: 'completed', network: 'Polygon' },
                { id: '4', date: '2024-05-14', type: 'buy', asset: 'AVAX', amount: 50, price: 35, total: 1750, status: 'pending', network: 'Avalanche' },
                { id: '5', date: '2024-05-13', type: 'withdrawal', asset: 'USDT', amount: 2000, price: 1, total: 2000, status: 'completed', network: 'Ethereum Mainnet' },
                { id: '6', date: '2024-05-13', type: 'buy', asset: 'MATIC', amount: 1000, price: 0.85, total: 850, status: 'completed', network: 'Polygon' },
                { id: '7', date: '2024-05-12', type: 'sell', asset: 'LINK', amount: 100, price: 18.5, total: 1850, status: 'completed', network: 'Ethereum Mainnet' }
            ]
        };
    }

    componentDidMount() {
        this.unsubscribe = themeManager.subscribe((theme) => {
            this.setState({ theme });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    getChangeColor = (change: number): string => {
        if (change > 0) return '#0F9D58';
        if (change < 0) return '#DB4437';
        return '#9AA0A6';
    };

    getRiskLevelColor = (riskLevel: string): string => {
        switch (riskLevel) {
            case 'low': return '#0F9D58';
            case 'medium': return '#F4B400';
            case 'high': return '#DB4437';
            default: return '#9AA0A6';
        }
    };

    getTransactionTypeColor = (type: string): string => {
        switch (type) {
            case 'buy': return '#0F9D58';
            case 'sell': return '#DB4437';
            case 'deposit': return '#4285F4';
            case 'withdrawal': return '#F4B400';
            default: return '#9AA0A6';
        }
    };

    getStatusColor = (status: string): string => {
        switch (status) {
            case 'completed': return '#0F9D58';
            case 'pending': return '#F4B400';
            case 'failed': return '#DB4437';
            default: return '#9AA0A6';
        }
    };

    getNetworkColor = (network: string): string => {
        const colors: { [key: string]: string } = {
            'Ethereum Mainnet': '#627EEA',
            'Binance Smart Chain': '#F3BA2F',
            'Polygon': '#8247E5',
            'Avalanche': '#E84142'
        };
        return colors[network] || '#9AA0A6';
    };

    // ECharts 配置
    getPortfolioDistributionOption = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const backgroundColor = theme === 'dark' ? '#394B59' : '#FFFFFF';

        const data = this.state.networks.flatMap(network =>
            Object.entries(network.portfolioDistribution).map(([asset, value]) => ({
                name: `${network.name} - ${asset}`,
                value: value,
                network: network.name
            }))
        );

        return {
            backgroundColor,
            textStyle: {
                color: textColor,
                fontSize: 9  // 更小的字体
            },
            // 关键配置：去除网格边距
            grid: {
                top: 10,     // 上边距
                right: 5,    // 右边距
                bottom: 5,   // 下边距
                left: 5,     // 左边距
                containLabel: true
            },
            // 标题配置
            title: {
                text: 'Portfolio Distribution',
                left: 'center',
                top: 0,      // 标题贴近顶部
                textStyle: {
                    color: textColor,
                    fontSize: 11,
                    fontWeight: 'bold'
                }
            },
            // 图例紧凑配置
            legend: {
                orient: 'horizontal',
                left: 'center',
                top: 'bottom',
                textStyle: {
                    color: textColor,
                    fontSize: 8  // 更小的图例字体
                },
                itemWidth: 10,
                itemHeight: 6,
                itemGap: 5    // 图例项间距
            },
            series: [{
                name: 'Portfolio',
                type: 'pie',
                radius: ['40%', '70%'],  // 增大饼图半径
                center: ['50%', '45%'],  // 调整中心位置
                // 标签配置
                label: {
                    fontSize: 8,
                    formatter: '{b}: {c}%'
                },
                labelLine: {
                    length: 5,
                    length2: 8
                },
                data: data
            }
            ]
        };
    };

    getPerformanceChartOption = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const backgroundColor = theme === 'dark' ? '#394B59' : '#FFFFFF';

        const dates = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
        const networks = this.state.networks;

        return {
            backgroundColor,
            textStyle: {
                color: textColor,
                fontSize: 10
            },
            title: {
                text: 'Monthly Performance Trend',
                left: 'center',
                textStyle: {
                    color: textColor,
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: networks.map(n => n.name),
                top: '10%',
                textStyle: {
                    color: textColor,
                    fontSize: 9
                },
                itemWidth: 12,
                itemHeight: 8
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '20%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
                axisLabel: {
                    color: textColor,
                    fontSize: 9
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: textColor,
                    fontSize: 9,
                    formatter: '{value}%'
                }
            },
            series: networks.map(network => ({
                name: network.name,
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 4,
                lineStyle: {
                    width: 2
                },
                data: [5, 8, 12, 18, network.monthlyChange]
            }))
        };
    };

    getRiskMetricsOption = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const backgroundColor = theme === 'dark' ? '#394B59' : '#FFFFFF';

        const networks = this.state.networks;
        const metrics = ['Volatility', 'Max Drawdown', 'Beta'];

        return {
            backgroundColor,
            textStyle: {
                color: textColor,
                fontSize: 10
            },
            title: {
                text: 'Risk Metrics Comparison',
                left: 'center',
                textStyle: {
                    color: textColor,
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: metrics,
                top: '10%',
                textStyle: {
                    color: textColor,
                    fontSize: 9
                },
                itemWidth: 12,
                itemHeight: 8
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '20%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: networks.map(n => n.name.split(' ')[0]),
                axisLabel: {
                    color: textColor,
                    fontSize: 9,
                    interval: 0,
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: textColor,
                    fontSize: 9,
                    formatter: '{value}%'
                }
            },
            series: [
                {
                    name: 'Volatility',
                    type: 'bar',
                    data: networks.map(n => n.risk.volatility)
                },
                {
                    name: 'Max Drawdown',
                    type: 'bar',
                    data: networks.map(n => Math.abs(n.risk.maxDrawdown))
                },
                {
                    name: 'Beta',
                    type: 'line',
                    yAxisIndex: 0,
                    symbol: 'diamond',
                    symbolSize: 6,
                    data: networks.map(n => n.risk.beta)
                }
            ]
        };
    };

    getAssetAllocationOption = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const backgroundColor = theme === 'dark' ? '#394B59' : '#FFFFFF';

        const networks = this.state.networks;
        const assetTypes = ['stocks', 'bonds', 'crypto', 'cash', 'others'];

        return {
            backgroundColor,
            textStyle: {
                color: textColor,
                fontSize: 10
            },
            title: {
                text: 'Asset Allocation by Network',
                left: 'center',
                textStyle: {
                    color: textColor,
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: assetTypes,
                top: '10%',
                textStyle: {
                    color: textColor,
                    fontSize: 9
                },
                itemWidth: 12,
                itemHeight: 8
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '20%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: networks.map(n => n.name.split(' ')[0]),
                axisLabel: {
                    color: textColor,
                    fontSize: 9,
                    interval: 0,
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: textColor,
                    fontSize: 9,
                    formatter: '{value}%'
                }
            },
            series: assetTypes.map(asset => ({
                name: asset,
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: networks.map(network => network.portfolioDistribution[asset as keyof typeof network.portfolioDistribution])
            }))
        };
    };

    renderNetworkTable = () => {
        const { theme, networks } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const headerBg = theme === 'dark' ? '#30404D' : '#EBF1F5';

        return (
            <div style={{ overflowX: 'auto' }}>
                <HTMLTable striped compact style={{ width: '100%', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ backgroundColor: headerBg }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600' }}>Network</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Total Balance</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Available</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Invested</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Daily</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Weekly</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Monthly</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600' }}>Risk</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>P&L Total</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Volatility</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>VaR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {networks.map((network, index) => (
                            <tr key={index} style={{ borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}` }}>
                                <td style={{ padding: '4px 8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: this.getNetworkColor(network.name)
                                            }}
                                        />
                                        <span style={{ fontWeight: '600', color: textColor }}>{network.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '600', color: textColor }}>
                                    {this.formatCurrency(network.totalBalance)}
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: textColor }}>
                                    {this.formatCurrency(network.availableBalance)}
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: textColor }}>
                                    {this.formatCurrency(network.investedAmount)}
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: this.getChangeColor(network.dailyChange) }}>
                                    {network.dailyChange > 0 ? '+' : ''}{network.dailyChange}%
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: this.getChangeColor(network.weeklyChange) }}>
                                    {network.weeklyChange > 0 ? '+' : ''}{network.weeklyChange}%
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: this.getChangeColor(network.monthlyChange) }}>
                                    {network.monthlyChange > 0 ? '+' : ''}{network.monthlyChange}%
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                                    <Tag
                                        minimal
                                        style={{
                                            fontSize: '9px',
                                            padding: '1px 4px',
                                            color: this.getRiskLevelColor(network.riskLevel)
                                        }}
                                    >
                                        {network.riskLevel.toUpperCase()}
                                    </Tag>
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: this.getChangeColor(network.profitLoss.totalGainLoss) }}>
                                    {this.formatCurrency(network.profitLoss.totalGainLoss)}
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: textColor }}>
                                    {network.risk.volatility}%
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: this.getChangeColor(network.risk.valueAtRisk) }}>
                                    {this.formatCurrency(network.risk.valueAtRisk)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>
            </div>
        );
    };

    renderTransactionsTable = () => {
        const { theme, transactions } = this.state;
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const headerBg = theme === 'dark' ? '#30404D' : '#EBF1F5';

        return (
            <div style={{ overflowX: 'auto' }}>
                <HTMLTable striped compact style={{ width: '100%', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ backgroundColor: headerBg }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600' }}>Asset</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600' }}>Network</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Price</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>Total</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td style={{ padding: '4px 8px', color: textColor }}>{transaction.date}</td>
                                <td style={{ padding: '4px 8px' }}>
                                    <Tag
                                        minimal
                                        style={{
                                            fontSize: '9px',
                                            padding: '1px 4px',
                                            color: this.getTransactionTypeColor(transaction.type)
                                        }}
                                    >
                                        {transaction.type.toUpperCase()}
                                    </Tag>
                                </td>
                                <td style={{ padding: '4px 8px', fontWeight: '600', color: textColor }}>
                                    {transaction.asset}
                                </td>
                                <td style={{ padding: '4px 8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: this.getNetworkColor(transaction.network)
                                            }}
                                        />
                                        <span style={{ fontSize: '10px', color: textColor }}>{transaction.network}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: textColor }}>
                                    {transaction.amount}
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', color: textColor }}>
                                    {this.formatCurrency(transaction.price)}
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '600', color: textColor }}>
                                    {this.formatCurrency(transaction.total)}
                                </td>
                                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                                    <Tag
                                        minimal
                                        style={{
                                            fontSize: '9px',
                                            padding: '1px 4px',
                                            color: this.getStatusColor(transaction.status)
                                        }}
                                    >
                                        {transaction.status.toUpperCase()}
                                    </Tag>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>
            </div>
        );
    };

    render() {
        const { theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#2F343C' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
        const cardBackground = theme === 'dark' ? '#394B59' : '#F5F8FA';
        const borderColor = theme === 'dark' ? '#5C7080' : '#E1E8ED';

        const totalBalance = this.state.networks.reduce((sum, network) => sum + network.totalBalance, 0);
        const totalProfitLoss = this.state.networks.reduce((sum, network) => sum + network.profitLoss.totalGainLoss, 0);

        return (
            <div style={{
                padding: '0',
                backgroundColor: backgroundColor,
                minHeight: '100vh',
                color: textColor,
                display: 'flex'
            }}>

                {/* 左侧面板 - 数据表格 */}
                <div style={{
                    flex: '0 0 60%',
                    borderRight: `1px solid ${borderColor}`,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Multi-Network Wallet Analysis</h1>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Total Balance</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{this.formatCurrency(totalBalance)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>Total P&L</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: this.getChangeColor(totalProfitLoss) }}>
                                        {this.formatCurrency(totalProfitLoss)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {/* 网络概览表格 */}
                        <div style={{
                            padding: '12px',
                            borderBottom: `1px solid ${borderColor}`,
                            backgroundColor: cardBackground
                        }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600' }}>Network Overview</h3>
                            {this.renderNetworkTable()}
                        </div>

                        {/* 交易记录表格 */}
                        <div style={{
                            padding: '12px',
                            backgroundColor: cardBackground
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>Recent Transactions</h3>
                                <Button small minimal text="View All" />
                            </div>
                            {this.renderTransactionsTable()}
                        </div>
                    </div>
                </div>

                {/* 右侧面板 - 分析图表 */}
                <div style={{
                    flex: '0 0 40%',
                    display: 'grid',
                    gridTemplateRows: '1fr 1fr 1fr 1fr',
                    gap: '0'
                }}>
                    {/* 饼图 - 投资组合分布 */}
                    <div style={{
                        borderBottom: `1px solid ${borderColor}`,
                        padding: '8px'
                    }}>
                        <ReactECharts
                            option={this.getPortfolioDistributionOption()}
                            style={{ height: '200px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </div>

                    {/* 折线图 - 性能趋势 */}
                    <div style={{
                        borderBottom: `1px solid ${borderColor}`,
                        padding: '8px'
                    }}>
                        <ReactECharts
                            option={this.getPerformanceChartOption()}
                            style={{ height: '200px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </div>

                    {/* 柱状图 - 风险指标 */}
                    <div style={{
                        borderBottom: `1px solid ${borderColor}`,
                        padding: '8px'
                    }}>
                        <ReactECharts
                            option={this.getRiskMetricsOption()}
                            style={{ height: '200px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </div>

                    {/* 堆叠柱状图 - 资产配置 */}
                    <div style={{
                        padding: '8px'
                    }}>
                        <ReactECharts
                            option={this.getAssetAllocationOption()}
                            style={{ height: '200px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default WalletAnalysisDashboard;