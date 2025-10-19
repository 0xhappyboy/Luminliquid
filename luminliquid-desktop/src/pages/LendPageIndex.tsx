import React from 'react';
import { Card, Elevation, Tag, InputGroup, ProgressBar, Switch, Button, Icon } from '@blueprintjs/core';
import { themeManager } from '../globals/theme/ThemeManager';
import { overflowManager } from '../globals/theme/OverflowTypeManager';

interface LendingPlatform {
    id: string;
    name: string;
    network: string;
    totalValueLocked: number;
    supplyApy: number;
    borrowApy: number;
    utilization: number;
    availableLiquidity: number;
    collateralFactor: number;
    riskLevel: 'low' | 'medium' | 'high';
    status: 'active' | 'paused' | 'maintenance';
    supportedAssets: string[];
    securityScore: number;
    liquidationData: {
        totalAtRisk: number;
        atRiskPercentage: number;
        avgHealthFactor: number;
        criticalPositions: number;
        liquidationThreshold: number;
    };
}

interface MarketStats {
    totalTVL: number;
    totalLiquidity: number;
    avgSupplyApy: number;
    avgBorrowApy: number;
    avgUtilization: number;
    networkDistribution: { network: string; tvl: number; percentage: number }[];
    liquidationMap: LiquidationMapItem[];
    topProtocols: { name: string; tvl: number; apy: number }[];
    systemHealth: {
        totalAtRisk: number;
        systemHealthScore: number;
        criticalNetworks: string[];
        overallRisk: 'low' | 'medium' | 'high';
    };
}

interface LiquidationMapItem {
    network: string;
    protocol: string;
    totalAtRisk: number;
    atRiskPercentage: number;
    avgHealthFactor: number;
    criticalPositions: number;
    liquidationThreshold: number;
    riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
    trend: 'improving' | 'stable' | 'deteriorating';
}

interface LendPageIndexState {
    theme: 'dark' | 'light';
    platforms: LendingPlatform[];
    marketStats: MarketStats;
    searchQuery: string;
    autoRefresh: boolean;
    selectedNetwork: string;
    sortBy: 'tvl' | 'apy' | 'utilization' | 'security';
    containerHeight: number;
    containerWidth: number;
    showRightPanel: boolean;
}

class LendPageIndex extends React.Component<{}, LendPageIndexState> {
    private unsubscribe: (() => void) | null = null;
    private refreshInterval: NodeJS.Timeout | null = null;
    private containerRef = React.createRef<HTMLDivElement>();
    private resizeObserver: ResizeObserver | null = null;

    constructor(props: {}) {
        super(props);
        const platforms = this.getPlatformsData();
        this.state = {
            theme: themeManager.getTheme(),
            searchQuery: '',
            autoRefresh: true,
            selectedNetwork: 'all',
            sortBy: 'tvl',
            containerHeight: 0,
            containerWidth: 0,
            showRightPanel: true,
            platforms: platforms,
            marketStats: this.calculateMarketStats(platforms)
        };
    }

    private getPlatformsData(): LendingPlatform[] {
        return [

            {
                id: 'aave-v3',
                name: 'Aave V3',
                network: 'Ethereum',
                totalValueLocked: 1250000000,
                supplyApy: 3.45,
                borrowApy: 4.89,
                utilization: 72.5,
                availableLiquidity: 345000000,
                collateralFactor: 82.5,
                riskLevel: 'low',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'],
                securityScore: 98,
                liquidationData: {
                    totalAtRisk: 45000000,
                    atRiskPercentage: 3.6,
                    avgHealthFactor: 2.8,
                    criticalPositions: 125,
                    liquidationThreshold: 85.0
                }
            },
            {
                id: 'compound-v3',
                name: 'Compound V3',
                network: 'Ethereum',
                totalValueLocked: 890000000,
                supplyApy: 2.89,
                borrowApy: 4.23,
                utilization: 68.3,
                availableLiquidity: 285000000,
                collateralFactor: 78.0,
                riskLevel: 'low',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'WBTC', 'UNI'],
                securityScore: 96,
                liquidationData: {
                    totalAtRisk: 32000000,
                    atRiskPercentage: 3.6,
                    avgHealthFactor: 3.1,
                    criticalPositions: 89,
                    liquidationThreshold: 82.0
                }
            },


            {
                id: 'aave-v3-arbitrum',
                name: 'Aave V3',
                network: 'Arbitrum',
                totalValueLocked: 450000000,
                supplyApy: 4.12,
                borrowApy: 5.67,
                utilization: 65.8,
                availableLiquidity: 156000000,
                collateralFactor: 80.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'USDT', 'WBTC', 'LINK'],
                securityScore: 95,
                liquidationData: {
                    totalAtRisk: 28000000,
                    atRiskPercentage: 6.2,
                    avgHealthFactor: 2.2,
                    criticalPositions: 156,
                    liquidationThreshold: 80.0
                }
            },


            {
                id: 'aave-v3-polygon',
                name: 'Aave V3',
                network: 'Polygon',
                totalValueLocked: 320000000,
                supplyApy: 4.78,
                borrowApy: 6.45,
                utilization: 71.2,
                availableLiquidity: 92000000,
                collateralFactor: 75.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['MATIC', 'USDC', 'USDT', 'WBTC'],
                securityScore: 94,
                liquidationData: {
                    totalAtRisk: 18000000,
                    atRiskPercentage: 5.6,
                    avgHealthFactor: 2.4,
                    criticalPositions: 167,
                    liquidationThreshold: 75.0
                }
            },
            {
                id: 'aave-v3-optimism',
                name: 'Aave V3',
                network: 'Optimism',
                totalValueLocked: 189000000,
                supplyApy: 4.35,
                borrowApy: 6.12,
                utilization: 69.7,
                availableLiquidity: 57000000,
                collateralFactor: 78.5,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'OP', 'WBTC'],
                securityScore: 93,
                liquidationData: {
                    totalAtRisk: 12000000,
                    atRiskPercentage: 6.3,
                    avgHealthFactor: 2.1,
                    criticalPositions: 98,
                    liquidationThreshold: 78.5
                }
            },
            {
                id: 'aave-v3-avalanche',
                name: 'Aave V3',
                network: 'Avalanche',
                totalValueLocked: 234000000,
                supplyApy: 5.12,
                borrowApy: 7.34,
                utilization: 74.6,
                availableLiquidity: 59000000,
                collateralFactor: 76.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['AVAX', 'USDC', 'USDT', 'BTC.b'],
                securityScore: 91,
                liquidationData: {
                    totalAtRisk: 16000000,
                    atRiskPercentage: 6.8,
                    avgHealthFactor: 2.3,
                    criticalPositions: 145,
                    liquidationThreshold: 76.0
                }
            },
            {
                id: 'aave-v3-base',
                name: 'Aave V3',
                network: 'Base',
                totalValueLocked: 156000000,
                supplyApy: 5.67,
                borrowApy: 7.89,
                utilization: 76.3,
                availableLiquidity: 37000000,
                collateralFactor: 79.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'cbETH'],
                securityScore: 90,
                liquidationData: {
                    totalAtRisk: 9500000,
                    atRiskPercentage: 6.1,
                    avgHealthFactor: 2.0,
                    criticalPositions: 87,
                    liquidationThreshold: 79.0
                }
            },


            {
                id: 'venus',
                name: 'Venus',
                network: 'BSC',
                totalValueLocked: 567000000,
                supplyApy: 3.78,
                borrowApy: 5.45,
                utilization: 70.2,
                availableLiquidity: 169000000,
                collateralFactor: 75.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['BNB', 'BUSD', 'USDT', 'BTCB'],
                securityScore: 87,
                liquidationData: {
                    totalAtRisk: 42000000,
                    atRiskPercentage: 7.4,
                    avgHealthFactor: 1.9,
                    criticalPositions: 278,
                    liquidationThreshold: 75.0
                }
            },


            {
                id: 'solend',
                name: 'Solend',
                network: 'Solana',
                totalValueLocked: 289000000,
                supplyApy: 6.45,
                borrowApy: 8.23,
                utilization: 68.9,
                availableLiquidity: 89000000,
                collateralFactor: 70.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['SOL', 'USDC', 'USDT', 'mSOL'],
                securityScore: 86,
                liquidationData: {
                    totalAtRisk: 18500000,
                    atRiskPercentage: 6.4,
                    avgHealthFactor: 2.1,
                    criticalPositions: 134,
                    liquidationThreshold: 70.0
                }
            },


            {
                id: 'zerolend',
                name: 'ZeroLend',
                network: 'zkSync',
                totalValueLocked: 89000000,
                supplyApy: 7.89,
                borrowApy: 9.45,
                utilization: 72.3,
                availableLiquidity: 24500000,
                collateralFactor: 75.0,
                riskLevel: 'high',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'ZK'],
                securityScore: 82,
                liquidationData: {
                    totalAtRisk: 12500000,
                    atRiskPercentage: 14.0,
                    avgHealthFactor: 1.6,
                    criticalPositions: 198,
                    liquidationThreshold: 75.0
                }
            },


            {
                id: 'nostra',
                name: 'Nostra',
                network: 'Starknet',
                totalValueLocked: 67000000,
                supplyApy: 8.12,
                borrowApy: 10.23,
                utilization: 75.6,
                availableLiquidity: 16300000,
                collateralFactor: 72.0,
                riskLevel: 'high',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'STRK'],
                securityScore: 84,
                liquidationData: {
                    totalAtRisk: 9800000,
                    atRiskPercentage: 14.6,
                    avgHealthFactor: 1.5,
                    criticalPositions: 167,
                    liquidationThreshold: 72.0
                }
            },


            {
                id: 'mendi-finance',
                name: 'Mendi Finance',
                network: 'Linea',
                totalValueLocked: 45000000,
                supplyApy: 6.78,
                borrowApy: 8.90,
                utilization: 69.8,
                availableLiquidity: 13600000,
                collateralFactor: 73.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'LINEA'],
                securityScore: 88,
                liquidationData: {
                    totalAtRisk: 6200000,
                    atRiskPercentage: 13.8,
                    avgHealthFactor: 1.8,
                    criticalPositions: 89,
                    liquidationThreshold: 73.0
                }
            },


            {
                id: 'fringe-finance',
                name: 'Fringe Finance',
                network: 'Mantle',
                totalValueLocked: 38000000,
                supplyApy: 5.45,
                borrowApy: 7.23,
                utilization: 67.5,
                availableLiquidity: 12300000,
                collateralFactor: 74.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['MNT', 'USDC', 'ETH'],
                securityScore: 85,
                liquidationData: {
                    totalAtRisk: 4800000,
                    atRiskPercentage: 12.6,
                    avgHealthFactor: 1.9,
                    criticalPositions: 76,
                    liquidationThreshold: 74.0
                }
            },


            {
                id: 'scroll-lending',
                name: 'Scroll Lending',
                network: 'Scroll',
                totalValueLocked: 29000000,
                supplyApy: 7.23,
                borrowApy: 9.12,
                utilization: 71.8,
                availableLiquidity: 8200000,
                collateralFactor: 70.0,
                riskLevel: 'high',
                status: 'active',
                supportedAssets: ['ETH', 'USDC'],
                securityScore: 81,
                liquidationData: {
                    totalAtRisk: 5200000,
                    atRiskPercentage: 17.9,
                    avgHealthFactor: 1.4,
                    criticalPositions: 112,
                    liquidationThreshold: 70.0
                }
            },


            {
                id: 'moola-market',
                name: 'Moola Market',
                network: 'Celo',
                totalValueLocked: 52000000,
                supplyApy: 4.89,
                borrowApy: 6.78,
                utilization: 66.7,
                availableLiquidity: 17300000,
                collateralFactor: 76.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['CELO', 'cUSD', 'cEUR'],
                securityScore: 87,
                liquidationData: {
                    totalAtRisk: 6800000,
                    atRiskPercentage: 13.1,
                    avgHealthFactor: 2.0,
                    criticalPositions: 94,
                    liquidationThreshold: 76.0
                }
            },


            {
                id: 'geist-finance',
                name: 'Geist Finance',
                network: 'Fantom',
                totalValueLocked: 78000000,
                supplyApy: 5.67,
                borrowApy: 7.45,
                utilization: 64.3,
                availableLiquidity: 27800000,
                collateralFactor: 72.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['FTM', 'USDC', 'ETH'],
                securityScore: 83,
                liquidationData: {
                    totalAtRisk: 11200000,
                    atRiskPercentage: 14.4,
                    avgHealthFactor: 1.7,
                    criticalPositions: 156,
                    liquidationThreshold: 72.0
                }
            },


            {
                id: 'agave',
                name: 'Agave',
                network: 'Gnosis',
                totalValueLocked: 42000000,
                supplyApy: 4.23,
                borrowApy: 5.89,
                utilization: 62.8,
                availableLiquidity: 15600000,
                collateralFactor: 75.0,
                riskLevel: 'low',
                status: 'active',
                supportedAssets: ['GNO', 'WETH', 'USDC'],
                securityScore: 89,
                liquidationData: {
                    totalAtRisk: 3800000,
                    atRiskPercentage: 9.0,
                    avgHealthFactor: 2.3,
                    criticalPositions: 45,
                    liquidationThreshold: 75.0
                }
            },


            {
                id: 'aurigami',
                name: 'Aurigami',
                network: 'Aurora',
                totalValueLocked: 31000000,
                supplyApy: 6.12,
                borrowApy: 8.34,
                utilization: 68.9,
                availableLiquidity: 9600000,
                collateralFactor: 73.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['ETH', 'USDC', 'AURORA'],
                securityScore: 84,
                liquidationData: {
                    totalAtRisk: 4500000,
                    atRiskPercentage: 14.5,
                    avgHealthFactor: 1.8,
                    criticalPositions: 78,
                    liquidationThreshold: 73.0
                }
            },


            {
                id: 'tranquil-finance',
                name: 'Tranquil Finance',
                network: 'Harmony',
                totalValueLocked: 23000000,
                supplyApy: 5.34,
                borrowApy: 7.12,
                utilization: 65.4,
                availableLiquidity: 7900000,
                collateralFactor: 70.0,
                riskLevel: 'high',
                status: 'active',
                supportedAssets: ['ONE', 'USDC', 'ETH'],
                securityScore: 79,
                liquidationData: {
                    totalAtRisk: 5200000,
                    atRiskPercentage: 22.6,
                    avgHealthFactor: 1.3,
                    criticalPositions: 134,
                    liquidationThreshold: 70.0
                }
            },


            {
                id: 'stellaswap',
                name: 'StellaSwap',
                network: 'Moonbeam',
                totalValueLocked: 35000000,
                supplyApy: 4.78,
                borrowApy: 6.45,
                utilization: 63.2,
                availableLiquidity: 12800000,
                collateralFactor: 74.0,
                riskLevel: 'medium',
                status: 'active',
                supportedAssets: ['GLMR', 'USDC', 'ETH'],
                securityScore: 86,
                liquidationData: {
                    totalAtRisk: 4200000,
                    atRiskPercentage: 12.0,
                    avgHealthFactor: 1.9,
                    criticalPositions: 67,
                    liquidationThreshold: 74.0
                }
            },


            {
                id: 'solarbeam',
                name: 'Solarbeam',
                network: 'Moonriver',
                totalValueLocked: 18000000,
                supplyApy: 5.89,
                borrowApy: 7.78,
                utilization: 67.8,
                availableLiquidity: 5800000,
                collateralFactor: 72.0,
                riskLevel: 'high',
                status: 'active',
                supportedAssets: ['MOVR', 'USDC'],
                securityScore: 82,
                liquidationData: {
                    totalAtRisk: 3200000,
                    atRiskPercentage: 17.8,
                    avgHealthFactor: 1.5,
                    criticalPositions: 89,
                    liquidationThreshold: 72.0
                }
            }
        ];
    }

    private calculateMarketStats(platforms: LendingPlatform[]): MarketStats {
        const totalTVL = platforms.reduce((sum, p) => sum + p.totalValueLocked, 0);
        const totalLiquidity = platforms.reduce((sum, p) => sum + p.availableLiquidity, 0);
        const avgSupplyApy = platforms.reduce((sum, p) => sum + p.supplyApy, 0) / platforms.length;
        const avgBorrowApy = platforms.reduce((sum, p) => sum + p.borrowApy, 0) / platforms.length;
        const avgUtilization = platforms.reduce((sum, p) => sum + p.utilization, 0) / platforms.length;


        const networkMap = new Map<string, number>();
        platforms.forEach(p => {
            networkMap.set(p.network, (networkMap.get(p.network) || 0) + p.totalValueLocked);
        });
        const networkDistribution = Array.from(networkMap.entries()).map(([network, tvl]) => ({
            network,
            tvl,
            percentage: (tvl / totalTVL) * 100
        })).sort((a, b) => b.tvl - a.tvl);


        const liquidationMap: LiquidationMapItem[] = platforms.map(p => {
            let riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
            if (p.liquidationData.avgHealthFactor > 2.5) riskLevel = 'safe';
            else if (p.liquidationData.avgHealthFactor > 1.8) riskLevel = 'warning';
            else if (p.liquidationData.avgHealthFactor > 1.3) riskLevel = 'danger';
            else riskLevel = 'critical';

            const trends: ('improving' | 'stable' | 'deteriorating')[] = ['improving', 'stable', 'deteriorating'];
            const trend = trends[Math.floor(Math.random() * trends.length)];

            return {
                network: p.network,
                protocol: p.name,
                totalAtRisk: p.liquidationData.totalAtRisk,
                atRiskPercentage: p.liquidationData.atRiskPercentage,
                avgHealthFactor: p.liquidationData.avgHealthFactor,
                criticalPositions: p.liquidationData.criticalPositions,
                liquidationThreshold: p.liquidationData.liquidationThreshold,
                riskLevel,
                trend
            };
        }).sort((a, b) => b.atRiskPercentage - a.atRiskPercentage);


        const topProtocols = platforms
            .sort((a, b) => b.totalValueLocked - a.totalValueLocked)
            .slice(0, 5)
            .map(p => ({ name: p.name, tvl: p.totalValueLocked, apy: p.supplyApy }));


        const totalAtRisk = platforms.reduce((sum, p) => sum + p.liquidationData.totalAtRisk, 0);
        const avgHealthFactor = platforms.reduce((sum, p) => sum + p.liquidationData.avgHealthFactor, 0) / platforms.length;
        const systemHealthScore = Math.max(0, Math.min(100, avgHealthFactor * 25));

        let overallRisk: 'low' | 'medium' | 'high';
        if (avgHealthFactor > 2.2) overallRisk = 'low';
        else if (avgHealthFactor > 1.6) overallRisk = 'medium';
        else overallRisk = 'high';

        const criticalNetworks = Array.from(new Set(
            platforms
                .filter(p => p.liquidationData.avgHealthFactor < 1.5)
                .map(p => p.network)
        ));

        return {
            totalTVL,
            totalLiquidity,
            avgSupplyApy,
            avgBorrowApy,
            avgUtilization,
            networkDistribution,
            liquidationMap,
            topProtocols,
            systemHealth: {
                totalAtRisk,
                systemHealthScore,
                criticalNetworks,
                overallRisk
            }
        };
    }

    componentDidMount() {
        overflowManager.setOverflow('hidden');
        this.unsubscribe = themeManager.subscribe((theme) => {
            this.setState({ theme });
        });
        this.updateContainerDimensions();
        window.addEventListener('resize', this.updateContainerDimensions);
        if (this.containerRef.current && this.containerRef.current.parentElement) {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateContainerDimensions();
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
        window.removeEventListener('resize', this.updateContainerDimensions);
    }

    updateContainerDimensions = () => {
        if (this.containerRef.current) {
            const parentHeight = this.containerRef.current.parentElement?.clientHeight || 0;
            const width = this.containerRef.current.clientWidth;
            this.setState({
                containerHeight: parentHeight,
                containerWidth: width,
                showRightPanel: width > 1000
            });
        }
    };

    startAutoRefresh = () => {
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 10000);
    };

    refreshData = () => {
        console.log('Refreshing lending platforms data...');
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
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    formatCompactCurrency = (amount: number): string => {
        if (amount >= 1000000000) {
            return `$${(amount / 1000000000).toFixed(2)}B`;
        } else if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(2)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(2)}K`;
        }
        return this.formatCurrency(amount);
    };

    getNetworkColor = (network: string): string => {
        const colors: { [key: string]: string } = {
            'Ethereum': '#627EEA',
            'Arbitrum': '#28A0F0',
            'Polygon': '#8247E5',
            'Optimism': '#FF0420',
            'Avalanche': '#E84142',
            'Base': '#0052FF',
            'BSC': '#F3BA2F',
            'Solana': '#00FFA3',
            'zkSync': '#8C8DFC',
            'Starknet': '#FF4C8B',
            'Linea': '#61DAFB',
            'Mantle': '#FF6B35',
            'Scroll': '#FFE802',
            'Celo': '#FBCC5C',
            'Fantom': '#1969FF',
            'Gnosis': '#04795B',
            'Aurora': '#70D44B',
            'Harmony': '#00AEE9',
            'Moonbeam': '#E1147B',
            'Moonriver': '#F3B10D'
        };
        return colors[network] || '#9AA0A6';
    };

    getRiskLevelColor = (riskLevel: string): string => {
        switch (riskLevel) {
            case 'low': return '#0F9D58';
            case 'medium': return '#F4B400';
            case 'high': return '#DB4437';
            default: return '#9AA0A6';
        }
    };

    getLiquidationRiskColor = (riskLevel: string): string => {
        switch (riskLevel) {
            case 'safe': return '#0F9D58';
            case 'warning': return '#F4B400';
            case 'danger': return '#FF6B35';
            case 'critical': return '#DB4437';
            default: return '#9AA0A6';
        }
    };

    getTrendIcon = (trend: string): string => {
        switch (trend) {
            case 'improving': return 'arrow-up';
            case 'deteriorating': return 'arrow-down';
            case 'stable': return 'minus';
            default: return 'minus';
        }
    };

    getTrendColor = (trend: string): string => {
        switch (trend) {
            case 'improving': return '#0F9D58';
            case 'deteriorating': return '#DB4437';
            case 'stable': return '#F4B400';
            default: return '#9AA0A6';
        }
    };

    getCustomScrollbarStyles = () => {
        const { theme } = this.state;

        const trackColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const thumbColor = theme === 'dark' ? '#5A6270' : '#C4C9D1';
        const thumbHoverColor = theme === 'dark' ? '#767E8C' : '#A8AFB8';

        return {
            scrollbarWidth: 'thin' as const,
            scrollbarColor: `${thumbColor} ${trackColor}`,
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
                borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: thumbHoverColor
            }
        };
    };

    renderLeftPanel = () => {
        const { theme, platforms, searchQuery, selectedNetwork, sortBy } = this.state;

        const uniqueNetworks: string[] = Array.from(new Set(platforms.map(p => p.network)));
        const networks: string[] = ['all', ...uniqueNetworks];

        const filteredPlatforms = platforms.filter(platform => {
            const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                platform.network.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesNetwork = selectedNetwork === 'all' || platform.network === selectedNetwork;
            return matchesSearch && matchesNetwork;
        });

        const sortedPlatforms = [...filteredPlatforms].sort((a, b) => {
            switch (sortBy) {
                case 'tvl': return b.totalValueLocked - a.totalValueLocked;
                case 'apy': return b.supplyApy - a.supplyApy;
                case 'utilization': return b.utilization - a.utilization;
                case 'security': return b.securityScore - a.securityScore;
                default: return 0;
            }
        });


        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const sidebarBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

        return (
            <div style={{
                flex: '0 0 60%',
                minWidth: '600px',
                borderRight: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: backgroundColor
            }}>

                <div style={{
                    padding: '12px',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: textColor
                    }}>Lending Protocols</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Switch
                            checked={this.state.autoRefresh}
                            onChange={this.handleAutoRefreshChange}
                            label="Auto Refresh"
                            style={{ margin: 0, fontSize: '10px' }}
                        />
                    </div>
                </div>


                <div style={{
                    padding: '8px 12px',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    gap: '8px',
                    flexShrink: 0
                }}>
                    <InputGroup
                        small
                        leftIcon="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => this.setState({ searchQuery: e.target.value })}
                        style={{
                            width: '200px',
                            fontSize: '10px',
                            backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                            color: textColor
                        }}
                    />

                    <div style={{ display: 'flex', gap: '4px' }}>
                        {networks.map(network => (
                            <Button
                                key={network}
                                small
                                minimal
                                active={selectedNetwork === network}
                                text={network === 'all' ? 'All Network' : network}
                                onClick={() => this.setState({ selectedNetwork: network })}
                                style={{
                                    fontSize: '9px',
                                    color: selectedNetwork === network ? textColor : secondaryTextColor
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                        <span style={{
                            fontSize: '10px',
                            color: secondaryTextColor
                        }}>Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => this.setState({ sortBy: e.target.value as any })}
                            style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                                backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                                color: textColor,
                                border: `1px solid ${borderColor}`,
                                borderRadius: '3px'
                            }}
                        >
                            <option value="tvl">TVL</option>
                            <option value="apy">Highest APY</option>
                            <option value="utilization">Utilization</option>
                            <option value="security">Security Score</option>
                        </select>
                    </div>
                </div>


                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '8px',
                    alignContent: 'start',
                    ...this.getCustomScrollbarStyles()
                }}>
                    {sortedPlatforms.map(platform => this.renderPlatformCard(platform))}
                </div>
            </div>
        );
    };

    renderPlatformCard = (platform: LendingPlatform) => {
        const { theme } = this.state;
        const networkColor = this.getNetworkColor(platform.network);
        const riskColor = this.getRiskLevelColor(platform.riskLevel);


        const backgroundColor = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';

        return (
            <Card
                key={platform.id}
                elevation={Elevation.TWO}
                style={{
                    margin: 0,
                    padding: '12px',
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    height: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                backgroundColor: networkColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '600',
                                color: 'white'
                            }}>
                                {platform.network.substring(0, 2)}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: textColor
                                }}>{platform.name}</div>
                                <div style={{
                                    fontSize: '9px',
                                    color: secondaryTextColor
                                }}>
                                    {platform.network}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Tag
                            minimal
                            style={{
                                fontSize: '8px',
                                color: riskColor,
                                marginBottom: '2px'
                            }}
                        >
                            {platform.riskLevel.toUpperCase()} RISK
                        </Tag>
                        <div style={{
                            fontSize: '9px',
                            color: secondaryTextColor
                        }}>
                            Score: {platform.securityScore}
                        </div>
                    </div>
                </div>


                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    marginBottom: '8px'
                }}>
                    <div>
                        <div style={{
                            fontSize: '9px',
                            color: secondaryTextColor
                        }}>TVL</div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: textColor
                        }}>{this.formatCompactCurrency(platform.totalValueLocked)}</div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '9px',
                            color: secondaryTextColor
                        }}>Liquidity</div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: textColor
                        }}>{this.formatCompactCurrency(platform.availableLiquidity)}</div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '9px',
                            color: secondaryTextColor
                        }}>Supply APY</div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#0F9D58'
                        }}>{platform.supplyApy}%</div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '9px',
                            color: secondaryTextColor
                        }}>Borrow APY</div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#F4B400'
                        }}>{platform.borrowApy}%</div>
                    </div>
                </div>


                <div style={{ marginBottom: '8px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '9px',
                        marginBottom: '2px'
                    }}>
                        <span style={{
                            color: secondaryTextColor
                        }}>Utilization</span>
                        <span style={{
                            fontWeight: '600',
                            color: textColor
                        }}>{platform.utilization}%</span>
                    </div>
                    <ProgressBar
                        value={platform.utilization / 100}
                        intent={platform.utilization > 80 ? 'danger' : platform.utilization > 65 ? 'warning' : 'success'}
                        style={{ height: '4px' }}
                    />
                </div>


                <div style={{ marginBottom: '8px' }}>
                    <div style={{
                        fontSize: '9px',
                        color: secondaryTextColor,
                        marginBottom: '4px'
                    }}>
                        Supported Assets
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {platform.supportedAssets.slice(0, 6).map(asset => (
                            <span
                                key={asset}
                                style={{
                                    fontSize: '8px',
                                    padding: '1px 4px',
                                    backgroundColor: theme === 'dark' ? 'rgba(45, 50, 61, 0.5)' : 'rgba(225, 229, 233, 0.8)',
                                    borderRadius: '3px',
                                    color: secondaryTextColor
                                }}
                            >
                                {asset}
                            </span>
                        ))}
                        {platform.supportedAssets.length > 6 && (
                            <span style={{
                                fontSize: '8px',
                                color: secondaryTextColor
                            }}>
                                +{platform.supportedAssets.length - 6}
                            </span>
                        )}
                    </div>
                </div>


                <div style={{ display: 'flex', gap: '4px', marginTop: 'auto' }}>
                    <Button
                        small
                        intent="success"
                        text="Supply"
                        style={{
                            fontSize: '9px',
                            flex: 1,
                            padding: '3px 6px',
                            minHeight: '24px'
                        }}
                    />
                    <Button
                        small
                        intent="primary"
                        text="Borrow"
                        style={{
                            fontSize: '9px',
                            flex: 1,
                            padding: '3px 6px',
                            minHeight: '24px'
                        }}
                    />
                </div>
            </Card>
        );
    };

    renderRightPanel = () => {
        const { theme, marketStats } = this.state;


        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const sidebarBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

        return (
            <div style={{
                flex: '0 0 40%',
                minWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: sidebarBg
            }}>

                <div style={{
                    padding: '12px',
                    borderBottom: `1px solid ${borderColor}`,
                    flexShrink: 0
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: textColor
                    }}>Market Statistics</h2>
                </div>


                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}>

                    <div style={{
                        padding: '12px',
                        borderBottom: `1px solid ${borderColor}`,
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                            <div>
                                <div style={{
                                    fontSize: '10px',
                                    color: secondaryTextColor,
                                    marginBottom: '2px'
                                }}>Total TVL</div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#0F9D58'
                                }}>
                                    {this.formatCompactCurrency(marketStats.totalTVL)}
                                </div>
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '10px',
                                    color: secondaryTextColor,
                                    marginBottom: '2px'
                                }}>Total At Risk</div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#DB4437'
                                }}>
                                    {this.formatCompactCurrency(marketStats.systemHealth.totalAtRisk)}
                                </div>
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '10px',
                                    color: secondaryTextColor,
                                    marginBottom: '2px'
                                }}>System Health</div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: this.getLiquidationRiskColor(
                                        marketStats.systemHealth.overallRisk === 'low' ? 'safe' :
                                            marketStats.systemHealth.overallRisk === 'medium' ? 'warning' : 'danger'
                                    )
                                }}>
                                    {marketStats.systemHealth.systemHealthScore}%
                                </div>
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '10px',
                                    color: secondaryTextColor,
                                    marginBottom: '2px'
                                }}>Avg Health Factor</div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#4285F4'
                                }}>
                                    {(marketStats.liquidationMap.reduce((sum, item) => sum + item.avgHealthFactor, 0) / marketStats.liquidationMap.length).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                            <span style={{
                                color: secondaryTextColor
                            }}>Overall Risk:</span>
                            <Tag
                                minimal
                                style={{
                                    fontSize: '9px',
                                    color: this.getLiquidationRiskColor(
                                        marketStats.systemHealth.overallRisk === 'low' ? 'safe' :
                                            marketStats.systemHealth.overallRisk === 'medium' ? 'warning' : 'danger'
                                    )
                                }}
                            >
                                {marketStats.systemHealth.overallRisk.toUpperCase()}
                            </Tag>
                            {marketStats.systemHealth.criticalNetworks.length > 0 && (
                                <>
                                    <span style={{
                                        color: secondaryTextColor
                                    }}>Critical Networks:</span>
                                    <span style={{
                                        color: '#DB4437',
                                        fontWeight: '600'
                                    }}>
                                        {marketStats.systemHealth.criticalNetworks.join(', ')}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>


                    <div style={{
                        flex: 1,
                        display: 'flex',
                        minHeight: 0,
                        overflow: 'hidden'
                    }}>

                        <div style={{
                            flex: '0 0 60%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRight: `1px solid ${borderColor}`
                        }}>
                            <div style={{
                                padding: '12px',
                                borderBottom: `1px solid ${borderColor}`,
                                flexShrink: 0
                            }}>
                                <h3 style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    margin: 0,
                                    color: textColor
                                }}>Liquidation Map</h3>
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '12px',
                                overflow: 'auto',
                                ...this.getCustomScrollbarStyles()
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {marketStats.liquidationMap.map((item, index) => (
                                        <div key={`${item.network}-${item.protocol}`} style={{
                                            padding: '8px',
                                            backgroundColor: theme === 'dark' ? 'rgba(45, 50, 61, 0.5)' : 'rgba(225, 229, 233, 0.6)',
                                            borderRadius: '4px',
                                            border: `1px solid ${this.getLiquidationRiskColor(item.riskLevel)}20`,
                                            fontSize: '10px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        borderRadius: '4px',
                                                        backgroundColor: this.getNetworkColor(item.network),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '8px',
                                                        fontWeight: '600',
                                                        color: 'white'
                                                    }}>
                                                        {item.network.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div style={{
                                                            fontWeight: '600',
                                                            fontSize: '11px',
                                                            color: textColor
                                                        }}>{item.protocol}</div>
                                                        <div style={{
                                                            fontSize: '9px',
                                                            color: secondaryTextColor
                                                        }}>
                                                            {item.network}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Icon
                                                        icon={this.getTrendIcon(item.trend)}
                                                        iconSize={10}
                                                        color={this.getTrendColor(item.trend)}
                                                    />
                                                    <Tag
                                                        minimal
                                                        style={{
                                                            fontSize: '8px',
                                                            color: this.getLiquidationRiskColor(item.riskLevel)
                                                        }}
                                                    >
                                                        {item.riskLevel.toUpperCase()}
                                                    </Tag>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                                                <div>
                                                    <div style={{
                                                        fontSize: '9px',
                                                        color: secondaryTextColor
                                                    }}>At Risk</div>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        color: '#DB4437'
                                                    }}>
                                                        {this.formatCompactCurrency(item.totalAtRisk)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontSize: '9px',
                                                        color: secondaryTextColor
                                                    }}>Risk %</div>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        color: '#DB4437'
                                                    }}>
                                                        {item.atRiskPercentage.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontSize: '9px',
                                                        color: secondaryTextColor
                                                    }}>Health Factor</div>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        color: this.getLiquidationRiskColor(item.riskLevel)
                                                    }}>
                                                        {item.avgHealthFactor.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontSize: '9px',
                                                        color: secondaryTextColor
                                                    }}>Liquidation Threshold</div>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        color: textColor
                                                    }}>
                                                        {item.liquidationThreshold}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{
                                                    fontSize: '9px',
                                                    color: secondaryTextColor
                                                }}>
                                                    Critical Positions: <span style={{
                                                        color: '#DB4437',
                                                        fontWeight: '600'
                                                    }}>{item.criticalPositions}</span>
                                                </div>
                                                <ProgressBar
                                                    value={item.atRiskPercentage / 100}
                                                    intent={
                                                        item.riskLevel === 'safe' ? 'success' :
                                                            item.riskLevel === 'warning' ? 'warning' :
                                                                item.riskLevel === 'danger' ? 'danger' : 'danger'
                                                    }
                                                    style={{ width: '80px', height: '4px' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                        <div style={{
                            flex: '0 0 40%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{
                                padding: '12px',
                                borderBottom: `1px solid ${borderColor}`,
                                flexShrink: 0
                            }}>
                                <h3 style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    margin: 0,
                                    color: textColor
                                }}>Network Distribution</h3>
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '12px',
                                overflow: 'auto',
                                ...this.getCustomScrollbarStyles()
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {marketStats.networkDistribution.map((item, index) => (
                                        <div key={item.network} style={{
                                            padding: '8px',
                                            backgroundColor: theme === 'dark' ? 'rgba(45, 50, 61, 0.5)' : 'rgba(225, 229, 233, 0.6)',
                                            borderRadius: '4px',
                                            border: `1px solid ${this.getNetworkColor(item.network)}30`
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '4px',
                                                    backgroundColor: this.getNetworkColor(item.network),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '8px',
                                                    fontWeight: '600',
                                                    color: 'white'
                                                }}>
                                                    {item.network.substring(0, 2)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: textColor
                                                    }}>{item.network}</div>
                                                    <div style={{
                                                        fontSize: '9px',
                                                        color: secondaryTextColor
                                                    }}>
                                                        {this.formatCompactCurrency(item.tvl)}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: '#0F9D58'
                                                    }}>
                                                        {item.percentage.toFixed(1)}%
                                                    </div>
                                                    <div style={{
                                                        fontSize: '9px',
                                                        color: secondaryTextColor
                                                    }}>
                                                        Market Share
                                                    </div>
                                                </div>
                                            </div>
                                            <ProgressBar
                                                value={item.percentage / 100}
                                                style={{
                                                    height: '6px',
                                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9'
                                                }}
                                                intent="primary"
                                            />
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '9px',
                                                marginTop: '4px',
                                                color: secondaryTextColor
                                            }}>
                                                <span>Protocols: {marketStats.liquidationMap.filter(p => p.network === item.network).length}</span>
                                                <span>Rank: #{index + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div style={{
                        padding: '12px',
                        borderTop: `1px solid ${borderColor}`,
                        flexShrink: 0
                    }}>
                        <h3 style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            margin: '0 0 8px 0',
                            color: textColor
                        }}>Top Protocols</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {marketStats.topProtocols.map((protocol, index) => (
                                <div key={protocol.name} style={{
                                    padding: '6px',
                                    backgroundColor: theme === 'dark' ? 'rgba(45, 50, 61, 0.5)' : 'rgba(225, 229, 233, 0.6)',
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    fontSize: '10px'
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '8px',
                                        fontWeight: '600',
                                        color: textColor,
                                        margin: '0 auto 4px auto'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{
                                        fontWeight: '600',
                                        fontSize: '9px',
                                        color: textColor
                                    }}>{protocol.name}</div>
                                    <div style={{
                                        color: '#0F9D58',
                                        fontSize: '8px'
                                    }}>{protocol.apy}% APY</div>
                                    <div style={{
                                        fontSize: '8px',
                                        color: secondaryTextColor
                                    }}>
                                        {this.formatCompactCurrency(protocol.tvl)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { theme, containerHeight, showRightPanel } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        return (
            <div
                ref={this.containerRef}
                style={{
                    padding: '0',
                    backgroundColor: backgroundColor,
                    height: containerHeight || '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    minWidth: '800px'
                }}
            >
                {this.renderLeftPanel()}
                {showRightPanel && this.renderRightPanel()}
            </div>
        );
    }
}

export default LendPageIndex;