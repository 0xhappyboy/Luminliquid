import React from "react";
import {
    Button,
    Icon,
    ProgressBar,
    Card
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";
import { overflowManager } from "../globals/theme/OverflowTypeManager";

interface ProfilePageIndexProps {
    children?: React.ReactNode;
}

interface ProfilePageIndexState {
    theme: 'dark' | 'light';
    isEditing: boolean;
    profileData: UserProfile;
    editFormData: UserProfile;
    containerHeight: number;
    positionsBalancesTab: 'positions' | 'balanceDetails' | 'balance' | 'positionsList' | 'orders' | 'twap' | 'history' | 'fundingHistory' | 'orderHistory' | 'depositWithdrawal';
    accountInfoTab: 'balance' | 'pnl';
}

interface UserProfile {
    personalInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        country: string;
        city: string;
        joinDate: string;
        verificationStatus: 'verified' | 'pending' | 'unverified';
        clientId: string;
        portfolioManager: string;
    };
    accountInfo: {
        accountNumber: string;
        accountType: 'premium' | 'standard' | 'vip';
        tier: string;
        totalValue: number;
        availableBalance: number;
        investedAmount: number;
        marginBalance: number;
        buyingPower: number;
        unrealizedPnL: number;
        realizedPnL: number;
        dailyPnL: number;
    };
    portfolioMetrics: {
        volume14Days: number;
        fees: {
            maker: number;
            taker: number;
        };
        balance: number;
        totalPosition: number;
        openOrders: number;
        twap: number;
        pnl: number;
        volume: number;
        maxReturn: number;
        totalEquity: number;
        adjustedEquity: number;
        currentAccountEquity: number;
        mergedEquity: number;
    };
    riskMetrics: {
        riskTolerance: 'conservative' | 'moderate' | 'aggressive';
        var95: number;
        sharpeRatio: number;
        maxDrawdown: number;
        beta: number;
        volatility: number;
        stressTestScore: number;
    };
    portfolio: {
        totalAssets: number;
        diversification: {
            equities: number;
            fixedIncome: number;
            alternatives: number;
            cash: number;
        };
        performance: {
            today: number;
            wtd: number;
            mtd: number;
            qtd: number;
            ytd: number;
            itd: number;
        };
        sectorAllocation: {
            technology: number;
            financials: number;
            healthcare: number;
            energy: number;
            consumer: number;
            industrials: number;
        };
    };
    positions: {
        symbol: string;
        name: string;
        quantity: number;
        avgPrice: number;
        currentPrice: number;
        marketValue: number;
        unrealizedPnL: number;
        pnlPercent: number;
        weight: number;
    }[];
    balanceDetails: {
        currency: string;
        totalBalance: number;
        availableBalance: number;
        usdcValue: number;
        uboRelationship: boolean;
        contract: string;
    }[];
    preferences: {
        language: string;
        currency: string;
        timezone: string;
        dateFormat: string;
        numberFormat: string;
        notifications: {
            priceAlerts: boolean;
            marginCalls: boolean;
            corporateActions: boolean;
            researchReports: boolean;
        };
    };
}


class ProfilePageIndex extends React.Component<ProfilePageIndexProps, ProfilePageIndexState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef: React.RefObject<HTMLDivElement | null>;

    constructor(props: ProfilePageIndexProps) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement | null>();
        this.state = {
            theme: themeManager.getTheme(),
            isEditing: false,
            containerHeight: 0,
            profileData: this.getDefaultProfileData(),
            editFormData: this.getDefaultProfileData(),
            positionsBalancesTab: 'positions',
            accountInfoTab: 'balance'
        };
    }


    private handlePositionsBalancesTabChange = (tab: 'positions' | 'balanceDetails' | 'balance' | 'positionsList' | 'orders' | 'twap' | 'history' | 'fundingHistory' | 'orderHistory' | 'depositWithdrawal'): void => {
        this.setState({ positionsBalancesTab: tab });
    };


    private handleAccountInfoTabChange = (tab: 'balance' | 'pnl'): void => {
        this.setState({ accountInfoTab: tab });
    };


    private renderBalanceChart = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const chartColor1 = theme === 'dark' ? '#4C90F0' : '#2B6CB0';
        const chartColor2 = theme === 'dark' ? '#34C759' : '#28A745';


        const balanceData = [
            { month: 'Jan', totalValue: 120000, availableBalance: 22000 },
            { month: 'Feb', totalValue: 122000, availableBalance: 23000 },
            { month: 'Mar', totalValue: 118000, availableBalance: 21000 },
            { month: 'Apr', totalValue: 125000, availableBalance: 24000 },
            { month: 'May', totalValue: 128000, availableBalance: 25000 },
            { month: 'Jun', totalValue: 125430, availableBalance: 25430 }
        ];

        const maxValue = Math.max(...balanceData.map(d => d.totalValue));
        const minValue = Math.min(...balanceData.map(d => d.availableBalance));

        return (
            <div style={{ height: '200px', padding: '10px 0' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: '150px',
                    padding: '0 10px',
                    position: 'relative'
                }}>
                    {balanceData.map((data, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '14%'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                height: '120px',
                                width: '100%',
                                justifyContent: 'space-around'
                            }}>

                                <div style={{
                                    width: '40%',
                                    height: `${((data.totalValue - minValue) / (maxValue - minValue)) * 80}%`,
                                    backgroundColor: chartColor1,
                                    borderRadius: '0px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '8px',
                                        color: textColor,
                                        opacity: 0.7,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {this.formatCurrency(data.totalValue)}
                                    </div>
                                </div>


                                <div style={{
                                    width: '40%',
                                    height: `${((data.availableBalance - minValue) / (maxValue - minValue)) * 80}%`,
                                    backgroundColor: chartColor2,
                                    borderRadius: '0px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '8px',
                                        color: textColor,
                                        opacity: 0.7,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {this.formatCurrency(data.availableBalance)}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                fontSize: '9px',
                                color: secondaryColor,
                                marginTop: '5px',
                                textAlign: 'center'
                            }}>
                                {data.month}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '10px',
                    fontSize: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: chartColor1,
                            borderRadius: '2px'
                        }}></div>
                        <span style={{ color: secondaryColor }}>Total Assets</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: chartColor2,
                            borderRadius: '2px'
                        }}></div>
                        <span style={{ color: secondaryColor }}>Available Balance</span>
                    </div>
                </div>
            </div>
        );
    };


    private renderPnlChart = () => {
        const { theme, profileData } = this.state;
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';


        const pnlData = [
            { month: 'Jan', unrealized: 2500, realized: 1500, daily: 450 },
            { month: 'Feb', unrealized: 3200, realized: 1800, daily: 620 },
            { month: 'Mar', unrealized: 1800, realized: 2200, daily: 380 },
            { month: 'Apr', unrealized: 4100, realized: 1900, daily: 780 },
            { month: 'May', unrealized: 3500, realized: 2100, daily: 650 },
            { month: 'Jun', unrealized: 3250, realized: 2100, daily: 520 }
        ];

        const allValues = pnlData.flatMap(d => [d.unrealized, d.realized, d.daily]);
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);

        return (
            <div style={{ height: '200px', padding: '10px 0' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: '150px',
                    padding: '0 10px'
                }}>
                    {pnlData.map((data, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '14%'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                height: '120px',
                                width: '100%',
                                justifyContent: 'space-around'
                            }}>

                                <div style={{
                                    width: '25%',
                                    height: `${((data.unrealized - minValue) / (maxValue - minValue)) * 80}%`,
                                    backgroundColor: data.unrealized >= 0 ? '#00FF00' : '#FF4444',
                                    borderRadius: '2px 2px 0 0',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-18px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '7px',
                                        color: textColor,
                                        opacity: 0.7
                                    }}>
                                        {this.formatCurrency(data.unrealized)}
                                    </div>
                                </div>


                                <div style={{
                                    width: '25%',
                                    height: `${((data.realized - minValue) / (maxValue - minValue)) * 80}%`,
                                    backgroundColor: data.realized >= 0 ? '#00FF00' : '#FF4444',
                                    borderRadius: '2px 2px 0 0',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-18px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '7px',
                                        color: textColor,
                                        opacity: 0.7
                                    }}>
                                        {this.formatCurrency(data.realized)}
                                    </div>
                                </div>


                                <div style={{
                                    width: '25%',
                                    height: `${((data.daily - minValue) / (maxValue - minValue)) * 80}%`,
                                    backgroundColor: data.daily >= 0 ? '#00FF00' : '#FF4444',
                                    borderRadius: '2px 2px 0 0',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-18px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '7px',
                                        color: textColor,
                                        opacity: 0.7
                                    }}>
                                        {this.formatCurrency(data.daily)}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                fontSize: '9px',
                                color: secondaryColor,
                                marginTop: '5px'
                            }}>
                                {data.month}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    marginTop: '10px',
                    fontSize: '9px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#00FF00',
                            borderRadius: '2px'
                        }}></div>
                        <span style={{ color: secondaryColor }}>Unrealized P&L</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#00FF00',
                            borderRadius: '2px'
                        }}></div>
                        <span style={{ color: secondaryColor }}>Realized P&L</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#00FF00',
                            borderRadius: '2px'
                        }}></div>
                        <span style={{ color: secondaryColor }}>Daily P&L</span>
                    </div>
                </div>
            </div>
        );
    };



    private renderAccountInfoPanel = () => {
        const { theme, profileData, accountInfoTab } = this.state;
        const cardBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const activeBg = theme === 'dark' ? '#2D323D' : '#E1E5E9';

        const tabs = [
            { key: 'balance' as const, label: 'Account Balance' },
            { key: 'pnl' as const, label: 'P&L' }
        ];

        const renderTabContent = () => {
            switch (accountInfoTab) {
                case 'balance':
                    return (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px' }}>
                            <div style={{
                                color: textColor,
                                fontSize: '13px',
                                fontWeight: '700',
                                marginBottom: '15px'
                            }}>
                                Account Balance Trend
                            </div>
                            {this.renderBalanceLineChart()}
                        </div>
                    );

                case 'pnl':
                    return (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px' }}>
                            <div style={{
                                color: textColor,
                                fontSize: '13px',
                                fontWeight: '700',
                                marginBottom: '15px'
                            }}>
                                P&L Trend
                            </div>
                            {this.renderPnlLineChart()}
                        </div>
                    );

                default:
                    return null;
            }
        };

        return (
            <div style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '0px',
                display: 'flex',
                flexDirection: 'column',
                height: '300px'
            }}>

                <div style={{
                    display: 'flex',
                    borderBottom: `1px solid ${borderColor}`
                }}>
                    {tabs.map((tab) => (
                        <div
                            key={tab.key}
                            onClick={() => this.handleAccountInfoTabChange(tab.key)}
                            style={{
                                padding: '10px 16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                backgroundColor: accountInfoTab === tab.key ? activeBg : 'transparent',
                                color: accountInfoTab === tab.key ? textColor : secondaryColor,
                                borderRight: `1px solid ${borderColor}`,
                                whiteSpace: 'nowrap',
                                minWidth: '80px',
                                textAlign: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>


                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {renderTabContent()}
                </div>
            </div>
        );
    };


    private renderPositionsAndBalancesPanel = (scrollbarStyles?: any) => {
        const { theme, profileData, positionsBalancesTab } = this.state;

        const cardBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const activeBg = theme === 'dark' ? '#2D323D' : '#E1E5E9';


        const defaultScrollbarStyles = scrollbarStyles || {
            scrollbarWidth: 'thin' as const,
            scrollbarColor: theme === 'dark' ? '#4A5568 #2D3748' : '#CBD5E0 #EDF2F7',
            '&::-webkit-scrollbar': { width: '6px', height: '6px' },
            '&::-webkit-scrollbar-track': {
                background: theme === 'dark' ? '#2D3748' : '#EDF2F7',
                borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
                background: theme === 'dark' ? '#4A5568' : '#CBD5E0',
                borderRadius: '3px'
            }
        };

        const tabs = [
            { key: 'positions' as const, label: 'Main Positions' },
            { key: 'balanceDetails' as const, label: 'Balance Details' },
            { key: 'balance' as const, label: 'Balance' },
            { key: 'positionsList' as const, label: 'Positions' },
            { key: 'orders' as const, label: 'Current Orders' },
            { key: 'twap' as const, label: 'TWAP' },
            { key: 'history' as const, label: 'Trade History' },
            { key: 'fundingHistory' as const, label: 'Funding History' },
            { key: 'orderHistory' as const, label: 'Order History' },
            { key: 'depositWithdrawal' as const, label: 'Deposit & Withdrawal' },
            { key: 'portfolioMetrics' as const, label: 'Portfolio Metrics' },
            { key: 'performance' as const, label: 'Performance' },
            { key: 'portfolioPerformance' as const, label: 'Portfolio Performance' }
        ];

        const renderTabContent = () => {
            const contentStyle = {
                flex: 1,
                overflow: 'auto',
                ...defaultScrollbarStyles
            };

            switch (positionsBalancesTab) {
                case 'positions':
                    return (
                        <div style={contentStyle}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '11px'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Symbol</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>Quantity</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>Current Price</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>Market Value</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>Unrealized P&L</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>Weight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profileData.positions.map((position, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                borderBottom: `1px solid ${borderColor}`,
                                                backgroundColor: index % 2 === 0 ? cardBg :
                                                    (theme === 'dark' ? '#2D323D' : '#E1E5E9')
                                            }}
                                        >
                                            <td style={{ padding: '6px 12px', fontWeight: '700', color: textColor }}>{position.symbol}</td>
                                            <td style={{ padding: '6px 12px', color: textColor }}>{position.name}</td>
                                            <td style={{ padding: '6px 12px', textAlign: 'right', color: textColor, fontFamily: "'Courier New', monospace" }}>
                                                {position.quantity.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '6px 12px', textAlign: 'right', color: textColor, fontFamily: "'Courier New', monospace" }}>
                                                ${position.currentPrice.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '6px 12px', textAlign: 'right', color: textColor, fontFamily: "'Courier New', monospace" }}>
                                                {this.formatCurrency(position.marketValue)}
                                            </td>
                                            <td style={{
                                                padding: '6px 12px',
                                                textAlign: 'right',
                                                color: this.getPerformanceColor(position.unrealizedPnL),
                                                fontWeight: '600',
                                                fontFamily: "'Courier New', monospace"
                                            }}>
                                                {this.formatCurrency(position.unrealizedPnL)}
                                            </td>
                                            <td style={{ padding: '6px 12px', textAlign: 'right', color: textColor, fontFamily: "'Courier New', monospace" }}>
                                                {position.weight.toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );

                case 'balanceDetails':
                    return (
                        <div style={contentStyle}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '11px'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Currency</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>Total Balance</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>Available Balance</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>USDC Value</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600' }}>Active UBO Relationship</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Contract</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profileData.balanceDetails.map((balance, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                borderBottom: `1px solid ${borderColor}`,
                                                backgroundColor: index % 2 === 0 ? cardBg :
                                                    (theme === 'dark' ? '#2D323D' : '#E1E5E9')
                                            }}
                                        >
                                            <td style={{ padding: '6px 12px', fontWeight: '700', color: textColor }}>
                                                {balance.currency}
                                            </td>
                                            <td style={{ padding: '6px 12px', textAlign: 'right', color: textColor, fontFamily: "'Courier New', monospace" }}>
                                                {balance.totalBalance.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '6px 12px', textAlign: 'right', color: textColor, fontFamily: "'Courier New', monospace" }}>
                                                {balance.availableBalance.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '6px 12px', textAlign: 'right', color: textColor, fontFamily: "'Courier New', monospace" }}>
                                                {this.formatCurrency(balance.usdcValue)}
                                            </td>
                                            <td style={{ padding: '6px 12px', textAlign: 'center', color: textColor }}>
                                                <Icon
                                                    icon={balance.uboRelationship ? "tick" : "cross"}
                                                    color={balance.uboRelationship ? '#00FF00' : '#FF4444'}
                                                    size={12}
                                                />
                                            </td>
                                            <td style={{ padding: '6px 12px', color: textColor }}>
                                                {balance.contract}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );

                case 'balance':
                    return (
                        <div style={{ flex: 1, padding: '15px', color: textColor, fontSize: '11px', overflow: 'auto', ...defaultScrollbarStyles }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: secondaryColor }}>Total Equity: </span>
                                <span style={{ fontFamily: "'Courier New', monospace", fontWeight: '600' }}>
                                    {this.formatCurrency(profileData.portfolioMetrics.totalEquity)}
                                </span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: secondaryColor }}>Adjusted Equity: </span>
                                <span style={{ fontFamily: "'Courier New', monospace", fontWeight: '600' }}>
                                    {this.formatCurrency(profileData.portfolioMetrics.adjustedEquity)}
                                </span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: secondaryColor }}>Current Account Equity: </span>
                                <span style={{ fontFamily: "'Courier New', monospace", fontWeight: '600' }}>
                                    {this.formatCurrency(profileData.portfolioMetrics.currentAccountEquity)}
                                </span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: secondaryColor }}>Merged Equity: </span>
                                <span style={{ fontFamily: "'Courier New', monospace", fontWeight: '600' }}>
                                    {this.formatCurrency(profileData.portfolioMetrics.mergedEquity)}
                                </span>
                            </div>
                            <div style={{ marginTop: '15px', color: secondaryColor, fontSize: '10px' }}>
                                Hide small balances feature is enabled
                            </div>
                        </div>
                    );

                case 'positionsList':
                    return (
                        <div style={{ ...contentStyle, padding: '15px' }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Current Positions List (Total {profileData.positions.length} positions)
                            </div>
                            {profileData.positions.map((position, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                    padding: '8px',
                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                    borderRadius: '4px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{position.symbol}</div>
                                        <div style={{ color: secondaryColor, fontSize: '10px' }}>{position.name}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontFamily: "'Courier New', monospace" }}>
                                            {position.quantity} shares
                                        </div>
                                        <div style={{
                                            color: this.getPerformanceColor(position.unrealizedPnL),
                                            fontSize: '10px',
                                            fontFamily: "'Courier New', monospace"
                                        }}>
                                            {this.formatCurrency(position.unrealizedPnL)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );

                case 'orders':
                    return (
                        <div style={{ ...contentStyle, padding: '15px' }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Current Orders (15 orders)
                            </div>
                            {[
                                { symbol: "AAPL", type: "Limit Buy", quantity: 10, price: 175.50, status: "Partially Filled" },
                                { symbol: "MSFT", type: "Market Sell", quantity: 5, price: 0, status: "Submitted" },
                                { symbol: "GOOGL", type: "Limit Sell", quantity: 8, price: 140.00, status: "Pending" },
                                { symbol: "TSLA", type: "Limit Buy", quantity: 15, price: 240.00, status: "Pending" },
                                { symbol: "NVDA", type: "Stop Sell", quantity: 3, price: 480.00, status: "Pending" },
                                { symbol: "AMZN", type: "Limit Buy", quantity: 12, price: 170.00, status: "Partially Filled" },
                                { symbol: "META", type: "Market Buy", quantity: 7, price: 0, status: "Submitted" },
                                { symbol: "TSM", type: "Limit Sell", quantity: 20, price: 145.00, status: "Pending" },
                                { symbol: "BABA", type: "Stop Buy", quantity: 25, price: 80.00, status: "Pending" },
                                { symbol: "JPM", type: "Limit Buy", quantity: 8, price: 185.00, status: "Pending" },
                                { symbol: "V", type: "Market Sell", quantity: 6, price: 0, status: "Submitted" },
                                { symbol: "JNJ", type: "Limit Sell", quantity: 10, price: 160.00, status: "Pending" },
                                { symbol: "WMT", type: "Limit Buy", quantity: 15, price: 165.00, status: "Pending" },
                                { symbol: "PG", type: "Market Buy", quantity: 5, price: 0, status: "Submitted" },
                                { symbol: "DIS", type: "Limit Sell", quantity: 12, price: 115.00, status: "Pending" }
                            ].map((order, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '6px',
                                    padding: '6px',
                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                    borderRadius: '4px',
                                    fontSize: '10px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{order.symbol}</div>
                                        <div style={{ color: secondaryColor }}>{order.type}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontFamily: "'Courier New', monospace" }}>
                                            {order.quantity} shares {order.price > 0 ? `@ $${order.price}` : ''}
                                        </div>
                                        <div style={{ color: order.status === "Partially Filled" ? '#FFA500' : secondaryColor }}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );

                case 'twap':
                    return (
                        <div style={{ flex: 1, padding: '15px', color: textColor, fontSize: '11px', overflow: 'auto', ...defaultScrollbarStyles }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Time Weighted Average Price (TWAP)
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: secondaryColor }}>TWAP Value: </span>
                                <span style={{ fontFamily: "'Courier New', monospace", fontWeight: '600' }}>
                                    {this.formatCurrency(profileData.portfolioMetrics.twap)}
                                </span>
                            </div>
                            <div style={{ color: secondaryColor, fontSize: '10px', marginTop: '15px' }}>
                                TWAP strategy helps disperse the market impact of large orders
                            </div>
                        </div>
                    );

                case 'history':
                    return (
                        <div style={{ ...contentStyle, padding: '15px' }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Trade History (Last 30 trades)
                            </div>
                            {[
                                { date: "2024-01-15", symbol: "AAPL", type: "Buy", quantity: 10, price: 175.25, amount: 1752.50 },
                                { date: "2024-01-15", symbol: "MSFT", type: "Sell", quantity: 5, price: 330.80, amount: 1654.00 },
                                { date: "2024-01-14", symbol: "GOOGL", type: "Buy", quantity: 8, price: 136.45, amount: 1091.60 },
                                { date: "2024-01-14", symbol: "TSLA", type: "Buy", quantity: 15, price: 242.30, amount: 3634.50 },
                                { date: "2024-01-13", symbol: "NVDA", type: "Sell", quantity: 3, price: 492.15, amount: 1476.45 },
                                { date: "2024-01-13", symbol: "AMZN", type: "Buy", quantity: 12, price: 172.80, amount: 2073.60 },
                                { date: "2024-01-12", symbol: "META", type: "Buy", quantity: 7, price: 482.90, amount: 3380.30 },
                                { date: "2024-01-12", symbol: "TSM", type: "Sell", quantity: 20, price: 141.25, amount: 2825.00 },
                                { date: "2024-01-11", symbol: "BABA", type: "Buy", quantity: 25, price: 79.80, amount: 1995.00 },
                                { date: "2024-01-11", symbol: "JPM", type: "Buy", quantity: 8, price: 187.40, amount: 1499.20 },
                                { date: "2024-01-10", symbol: "V", type: "Sell", quantity: 6, price: 276.85, amount: 1661.10 },
                                { date: "2024-01-10", symbol: "JNJ", type: "Sell", quantity: 10, price: 158.90, amount: 1589.00 },
                                { date: "2024-01-09", symbol: "WMT", type: "Buy", quantity: 15, price: 167.20, amount: 2508.00 },
                                { date: "2024-01-09", symbol: "PG", type: "Buy", quantity: 5, price: 161.75, amount: 808.75 },
                                { date: "2024-01-08", symbol: "DIS", type: "Sell", quantity: 12, price: 114.60, amount: 1375.20 }
                            ].map((trade, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '4px',
                                    padding: '4px 8px',
                                    backgroundColor: index % 2 === 0 ? (theme === 'dark' ? '#2D323D' : '#E1E5E9') : 'transparent',
                                    borderRadius: '2px',
                                    fontSize: '9px'
                                }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span style={{ color: secondaryColor, minWidth: '70px' }}>{trade.date}</span>
                                        <span style={{ fontWeight: '600', minWidth: '40px' }}>{trade.symbol}</span>
                                        <span style={{
                                            color: trade.type === "Buy" ? '#00FF00' : '#FF4444',
                                            minWidth: '30px'
                                        }}>{trade.type}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span style={{ fontFamily: "'Courier New', monospace", minWidth: '40px' }}>
                                            {trade.quantity} shares
                                        </span>
                                        <span style={{ fontFamily: "'Courier New', monospace", minWidth: '60px' }}>
                                            ${trade.price}
                                        </span>
                                        <span style={{ fontFamily: "'Courier New', monospace", minWidth: '70px', fontWeight: '600' }}>
                                            {this.formatCurrency(trade.amount)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );

                case 'fundingHistory':
                    return (
                        <div style={{ flex: 1, padding: '15px', color: textColor, fontSize: '11px', overflow: 'auto', ...defaultScrollbarStyles }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Funding History
                            </div>
                            <div style={{ color: secondaryColor, fontSize: '10px', textAlign: 'center', marginTop: '50px' }}>
                                No funding history records
                            </div>
                        </div>
                    );

                case 'orderHistory':
                    return (
                        <div style={{ flex: 1, padding: '15px', color: textColor, fontSize: '11px', overflow: 'auto', ...defaultScrollbarStyles }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Order History
                            </div>
                            <div style={{ color: secondaryColor, fontSize: '10px', textAlign: 'center', marginTop: '50px' }}>
                                No order history records
                            </div>
                        </div>
                    );

                case 'depositWithdrawal':
                    return (
                        <div style={{ flex: 1, padding: '15px', color: textColor, fontSize: '11px', overflow: 'auto', ...defaultScrollbarStyles }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Deposit and Withdrawal Records
                            </div>
                            <div style={{ color: secondaryColor, fontSize: '10px', textAlign: 'center', marginTop: '50px' }}>
                                No deposit and withdrawal records
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <Button small text="Deposit" intent="primary" />
                                <Button small text="Withdraw" />
                            </div>
                        </div>
                    );

                case 'portfolioMetrics':
                    return (
                        <div style={{ ...contentStyle, padding: '15px' }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Portfolio Metrics
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { title: "14 Day Volume", value: this.formatCurrency(profileData.portfolioMetrics.volume14Days) },
                                    { title: "30 Day Volume", value: this.formatCurrency(profileData.portfolioMetrics.volume14Days * 2.5) },
                                    { title: "Fee (Taker)", value: `${(profileData.portfolioMetrics.fees.taker * 100).toFixed(4)}%` },
                                    { title: "Fee (Maker)", value: `${(profileData.portfolioMetrics.fees.maker * 100).toFixed(4)}%` },
                                    { title: "Balance", value: this.formatCurrency(profileData.portfolioMetrics.balance) },
                                    { title: "Frozen Funds", value: this.formatCurrency(12500) },
                                    { title: "Total Position", value: this.formatCurrency(profileData.portfolioMetrics.totalPosition) },
                                    { title: "Net Position", value: this.formatCurrency(profileData.portfolioMetrics.totalPosition * 0.8) },
                                    { title: "Open Orders", value: profileData.portfolioMetrics.openOrders.toString() },
                                    { title: "Pending Orders", value: "8" },
                                    { title: "TWAP", value: this.formatCurrency(profileData.portfolioMetrics.twap) },
                                    { title: "VWAP", value: this.formatCurrency(profileData.portfolioMetrics.twap * 1.02) },
                                    { title: "Total P&L", value: this.formatCurrency(profileData.portfolioMetrics.pnl) },
                                    { title: "Monthly P&L", value: this.formatCurrency(profileData.portfolioMetrics.pnl * 0.3) },
                                    { title: "Annual P&L", value: this.formatCurrency(profileData.portfolioMetrics.pnl * 1.2) },
                                    { title: "Volume", value: this.formatCurrency(profileData.portfolioMetrics.volume) },
                                    { title: "Daily Avg Volume", value: this.formatCurrency(profileData.portfolioMetrics.volume / 30) },
                                    { title: "Max Daily Volume", value: this.formatCurrency(250000) }
                                ].map((metric, index) => (
                                    <div key={index} style={{
                                        backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                                        padding: '8px',
                                        borderRadius: '4px'
                                    }}>
                                        <div style={{ color: secondaryColor, fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
                                            {metric.title}
                                        </div>
                                        <div style={{ color: textColor, fontSize: '12px', fontWeight: '700', fontFamily: "'Courier New', monospace" }}>
                                            {metric.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                case 'performance':
                    return (
                        <div style={{ ...contentStyle, padding: '15px' }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Performance
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px'
                            }}>
                                {Object.entries(profileData.portfolio.performance).map(([period, value]) => (
                                    <div key={period} style={{ textAlign: 'center' }}>
                                        <div style={{ color: secondaryColor, fontSize: '10px', marginBottom: '2px' }}>
                                            {period === 'today' ? 'Today' :
                                                period === 'wtd' ? 'WTD' :
                                                    period === 'mtd' ? 'MTD' :
                                                        period === 'qtd' ? 'QTD' :
                                                            period === 'ytd' ? 'YTD' : 'ITD'}
                                        </div>
                                        <div style={{
                                            color: this.getPerformanceColor(value),
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            fontFamily: "'Courier New', monospace"
                                        }}>
                                            {this.formatPercentage(value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                case 'portfolioPerformance':
                    return (
                        <div style={{ ...contentStyle, padding: '15px' }}>
                            <div style={{ marginBottom: '12px', color: secondaryColor }}>
                                Portfolio Performance
                            </div>
                            {this.renderPerformanceChart()}
                        </div>
                    );

                default:
                    return (
                        <div style={contentStyle}>

                        </div>
                    );
            }
        };

        return (
            <div style={{
                backgroundColor: cardBg,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
            }}>

                <div style={{
                    display: 'flex',
                    borderBottom: `1px solid ${borderColor}`,
                    overflowX: 'auto',
                    flexShrink: 0,
                    ...defaultScrollbarStyles
                }}>
                    {tabs.map((tab) => (
                        <div
                            key={tab.key}
                            onClick={() => this.handlePositionsBalancesTabChange(tab.key)}
                            style={{
                                padding: '10px 12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                backgroundColor: positionsBalancesTab === tab.key ? activeBg : 'transparent',
                                color: positionsBalancesTab === tab.key ? textColor : secondaryColor,
                                borderRight: `1px solid ${borderColor}`,
                                whiteSpace: 'nowrap',
                                minWidth: '80px',
                                textAlign: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>


                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {renderTabContent()}
                </div>
            </div>
        );
    };


    private getDefaultProfileData(): UserProfile {
        return {
            personalInfo: {
                firstName: "Zhang",
                lastName: "San",
                email: "zhangsan@example.com",
                phone: "+86 138-0013-8000",
                country: "China",
                city: "Shanghai",
                joinDate: "2023-01-15",
                verificationStatus: 'verified',
                clientId: "CLIENT-2023-001234",
                portfolioManager: "Li Si (PM-0456)"
            },
            accountInfo: {
                accountNumber: "ACC-2023-001234",
                accountType: 'premium',
                tier: "Professional",
                totalValue: 125430.75,
                availableBalance: 25430.75,
                investedAmount: 100000.00,
                marginBalance: 75000.00,
                buyingPower: 150000.00,
                unrealizedPnL: 3250.50,
                realizedPnL: 8750.25,
                dailyPnL: 1250.80
            },
            portfolioMetrics: {
                volume14Days: 1250000,
                fees: {
                    maker: 0.0150,
                    taker: 0.0450
                },
                balance: 25430.75,
                totalPosition: 100000,
                openOrders: 15,
                twap: 124500,
                pnl: 12000.75,
                volume: 1250000,
                maxReturn: 28.7,
                totalEquity: 125430.75,
                adjustedEquity: 124800.25,
                currentAccountEquity: 125430.75,
                mergedEquity: 125430.75
            },
            riskMetrics: {
                riskTolerance: 'moderate',
                var95: -12500.00,
                sharpeRatio: 1.45,
                maxDrawdown: -8.70,
                beta: 0.92,
                volatility: 12.30,
                stressTestScore: 78.5
            },
            portfolio: {
                totalAssets: 24,
                diversification: {
                    equities: 65.5,
                    fixedIncome: 22.3,
                    alternatives: 8.7,
                    cash: 3.5
                },
                performance: {
                    today: 1.2,
                    wtd: 2.8,
                    mtd: 5.5,
                    qtd: 12.3,
                    ytd: 28.7,
                    itd: 45.3
                },
                sectorAllocation: {
                    technology: 35.2,
                    financials: 18.7,
                    healthcare: 15.3,
                    energy: 12.1,
                    consumer: 10.4,
                    industrials: 8.3
                }
            },
            positions: [
                { symbol: "AAPL", name: "Apple Inc.", quantity: 100, avgPrice: 150.25, currentPrice: 178.35, marketValue: 17835.00, unrealizedPnL: 2810.00, pnlPercent: 18.7, weight: 14.2 },
                { symbol: "MSFT", name: "Microsoft Corporation", quantity: 75, avgPrice: 285.60, currentPrice: 332.45, marketValue: 24933.75, unrealizedPnL: 3513.75, pnlPercent: 16.4, weight: 19.9 },
                { symbol: "GOOGL", name: "Google", quantity: 50, avgPrice: 112.80, currentPrice: 138.92, marketValue: 6946.00, unrealizedPnL: 1306.00, pnlPercent: 23.2, weight: 5.5 },
                { symbol: "TSLA", name: "Tesla", quantity: 60, avgPrice: 210.45, currentPrice: 245.67, marketValue: 14740.20, unrealizedPnL: 2113.20, pnlPercent: 16.7, weight: 11.8 },
                { symbol: "NVDA", name: "NVIDIA", quantity: 40, avgPrice: 320.75, currentPrice: 495.23, marketValue: 19809.20, unrealizedPnL: 6979.20, pnlPercent: 54.4, weight: 15.8 },
                { symbol: "AMZN", name: "Amazon", quantity: 30, avgPrice: 145.60, currentPrice: 178.45, marketValue: 5353.50, unrealizedPnL: 985.50, pnlPercent: 22.6, weight: 4.3 },
                { symbol: "META", name: "Meta Platforms", quantity: 45, avgPrice: 320.25, currentPrice: 485.67, marketValue: 21855.15, unrealizedPnL: 7444.35, pnlPercent: 51.6, weight: 17.4 },
                { symbol: "TSM", name: "Taiwan Semiconductor", quantity: 80, avgPrice: 89.45, currentPrice: 142.38, marketValue: 11390.40, unrealizedPnL: 4234.40, pnlPercent: 59.1, weight: 9.1 },
                { symbol: "BABA", name: "Alibaba", quantity: 55, avgPrice: 85.20, currentPrice: 78.45, marketValue: 4314.75, unrealizedPnL: -371.25, pnlPercent: -7.9, weight: 3.4 },
                { symbol: "JPM", name: "JPMorgan Chase", quantity: 35, avgPrice: 156.80, currentPrice: 189.23, marketValue: 6623.05, unrealizedPnL: 1135.05, pnlPercent: 20.7, weight: 5.3 },
                { symbol: "V", name: "Visa", quantity: 25, avgPrice: 230.45, currentPrice: 278.91, marketValue: 6972.75, unrealizedPnL: 1211.50, pnlPercent: 21.0, weight: 5.6 },
                { symbol: "JNJ", name: "Johnson & Johnson", quantity: 40, avgPrice: 165.30, currentPrice: 155.67, marketValue: 6226.80, unrealizedPnL: -385.20, pnlPercent: -5.8, weight: 5.0 },
                { symbol: "WMT", name: "Walmart", quantity: 30, avgPrice: 148.90, currentPrice: 169.45, marketValue: 5083.50, unrealizedPnL: 616.50, pnlPercent: 13.8, weight: 4.1 },
                { symbol: "PG", name: "Procter & Gamble", quantity: 20, avgPrice: 145.60, currentPrice: 162.34, marketValue: 3246.80, unrealizedPnL: 334.80, pnlPercent: 11.5, weight: 2.6 },
                { symbol: "DIS", name: "Disney", quantity: 45, avgPrice: 95.45, currentPrice: 112.67, marketValue: 5070.15, unrealizedPnL: 774.90, pnlPercent: 18.0, weight: 4.0 }
            ],
            balanceDetails: [
                { currency: "BTC", totalBalance: 0.5, availableBalance: 0.3, usdcValue: 21500, uboRelationship: true, contract: "BTC-USD" },
                { currency: "ETH", totalBalance: 3.2, availableBalance: 2.1, usdcValue: 9600, uboRelationship: true, contract: "ETH-USD" },
                { currency: "USDC", totalBalance: 25430.75, availableBalance: 25430.75, usdcValue: 25430.75, uboRelationship: false, contract: "SPOT" },
                { currency: "SOL", totalBalance: 25, availableBalance: 15, usdcValue: 3750, uboRelationship: false, contract: "SOL-USD" },
                { currency: "BNB", totalBalance: 2.5, availableBalance: 1.8, usdcValue: 1250, uboRelationship: true, contract: "BNB-USD" },
                { currency: "XRP", totalBalance: 500, availableBalance: 350, usdcValue: 325, uboRelationship: false, contract: "XRP-USD" },
                { currency: "ADA", totalBalance: 1000, availableBalance: 800, usdcValue: 480, uboRelationship: false, contract: "ADA-USD" },
                { currency: "DOT", totalBalance: 50, availableBalance: 30, usdcValue: 350, uboRelationship: true, contract: "DOT-USD" },
                { currency: "LTC", totalBalance: 8, availableBalance: 5, usdcValue: 640, uboRelationship: false, contract: "LTC-USD" },
                { currency: "LINK", totalBalance: 25, availableBalance: 18, usdcValue: 375, uboRelationship: true, contract: "LINK-USD" },
                { currency: "BCH", totalBalance: 1.2, availableBalance: 0.8, usdcValue: 180, uboRelationship: false, contract: "BCH-USD" },
                { currency: "XLM", totalBalance: 800, availableBalance: 600, usdcValue: 96, uboRelationship: false, contract: "XLM-USD" },
                { currency: "EOS", totalBalance: 100, availableBalance: 70, usdcValue: 120, uboRelationship: true, contract: "EOS-USD" },
                { currency: "XTZ", totalBalance: 60, availableBalance: 40, usdcValue: 72, uboRelationship: false, contract: "XTZ-USD" },
                { currency: "ATOM", totalBalance: 35, availableBalance: 25, usdcValue: 350, uboRelationship: true, contract: "ATOM-USD" }
            ],
            preferences: {
                language: "Chinese",
                currency: "CNY",
                timezone: "Asia/Shanghai",
                dateFormat: "YYYY-MM-DD",
                numberFormat: "1,234.56",
                notifications: {
                    priceAlerts: true,
                    marginCalls: true,
                    corporateActions: true,
                    researchReports: false
                }
            }
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

    private formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    private formatPercentage = (value: number): string => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    private getPerformanceColor = (value: number): string => {
        return value >= 0 ? '#00FF00' : '#FF4444';
    };

    private renderMetricCard = (title: string, value: string, change?: string, isPositive?: boolean) => {
        const { theme } = this.state;
        const bgColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

        return (
            <div style={{
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                padding: '12px',
                borderRadius: '0px',
                minWidth: '140px'
            }}>
                <div style={{ color: secondaryColor, fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                    {title}
                </div>
                <div style={{ color: textColor, fontSize: '16px', fontWeight: '700', fontFamily: "'Courier New', monospace" }}>
                    {value}
                </div>
                {change && (
                    <div style={{
                        color: isPositive ? '#00FF00' : '#FF4444',
                        fontSize: '11px',
                        fontWeight: '600',
                        fontFamily: "'Courier New', monospace"
                    }}>
                        {change}
                    </div>
                )}
            </div>
        );
    };


    private renderPerformanceChart = () => {
        const { theme } = this.state;
        const bgColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const chartColor = theme === 'dark' ? '#4C90F0' : '#2B6CB0';


        const chartData = [65, 59, 80, 81, 56, 55, 40, 75, 90, 85, 95, 100];
        const maxValue = Math.max(...chartData);
        const minValue = Math.min(...chartData);

        return (
            <div style={{
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                padding: '15px',
                borderRadius: '4px',
                height: '200px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    color: textColor,
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '0px'
                }}>
                    Portfolio Performance
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: '120px',
                    padding: '0 10px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    {chartData.map((value, index) => (
                        <div
                            key={index}
                            style={{
                                width: '6%',
                                height: `${((value - minValue) / (maxValue - minValue)) * 100}%`,
                                backgroundColor: chartColor,
                                borderRadius: '2px 2px 0 0',
                                position: 'relative',
                                minWidth: '12px'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '9px',
                                color: textColor,
                                opacity: 0.7,
                                whiteSpace: 'nowrap'
                            }}>
                                {value}%
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                    padding: '0 5px',
                    fontSize: '9px',
                    color: textColor,
                    opacity: 0.7,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                        <span key={index} style={{ transform: 'rotate(-45deg)', display: 'inline-block' }}>
                            {month}
                        </span>
                    ))}
                </div>
            </div>
        );
    };




    private renderBalanceLineChart = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const lineColor1 = theme === 'dark' ? '#4C90F0' : '#2B6CB0';
        const lineColor2 = theme === 'dark' ? '#34C759' : '#28A745';
        const gridColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const tooltipBg = theme === 'dark' ? '#2D323D' : '#FFFFFF';
        const tooltipBorder = theme === 'dark' ? '#4C90F0' : '#2B6CB0';


        const balanceData = [
            { month: 'Jan', totalValue: 120000, availableBalance: 22000 },
            { month: 'Feb', totalValue: 122000, availableBalance: 23000 },
            { month: 'Mar', totalValue: 118000, availableBalance: 21000 },
            { month: 'Apr', totalValue: 125000, availableBalance: 24000 },
            { month: 'May', totalValue: 128000, availableBalance: 25000 },
            { month: 'Jun', totalValue: 125430, availableBalance: 25430 }
        ];

        const chartHeight = 180;
        const chartWidth = '100%';
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };

        const allValues = balanceData.flatMap(d => [d.totalValue, d.availableBalance]);
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);
        const valueRange = maxValue - minValue;


        const getPointX = (index: number) => {
            return padding.left + (index * (100 - (padding.left + padding.right) / 10)) / (balanceData.length - 1);
        };

        const getPointY = (value: number) => {
            return padding.top + chartHeight - padding.top - padding.bottom -
                ((value - minValue) / valueRange) * (chartHeight - padding.top - padding.bottom);
        };


        const generateLinePath = (data: number[]) => {
            return data.map((value, index) =>
                `${index === 0 ? 'M' : 'L'} ${getPointX(index)} ${getPointY(value)}`
            ).join(' ');
        };

        const totalValuePath = generateLinePath(balanceData.map(d => d.totalValue));
        const availableBalancePath = generateLinePath(balanceData.map(d => d.availableBalance));


        const hoverAreas = balanceData.map((data, index) => ({
            x: getPointX(index) - 20,
            y: padding.top,
            width: 40,
            height: chartHeight - padding.top - padding.bottom,
            data: data
        }));

        return (
            <div style={{ height: '220px', padding: '10px 0', position: 'relative', width: '100%' }}>
                <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible', width: '100%' }}>

                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                        <line
                            key={index}
                            x1={padding.left}
                            y1={padding.top + (chartHeight - padding.top - padding.bottom) * ratio}
                            x2={'100%'}
                            y2={padding.top + (chartHeight - padding.top - padding.bottom) * ratio}
                            stroke={gridColor}
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    ))}


                    <path
                        d={totalValuePath}
                        fill="none"
                        stroke={lineColor1}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    <path
                        d={availableBalancePath}
                        fill="none"
                        stroke={lineColor2}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    {hoverAreas.map((area, index) => (
                        <rect
                            key={index}
                            x={area.x}
                            y={area.y}
                            width={area.width}
                            height={area.height}
                            fill="transparent"
                            onMouseEnter={(e) => {
                                const tooltip = document.getElementById('balance-tooltip');
                                if (tooltip) {
                                    tooltip.style.display = 'block';
                                    tooltip.style.left = `${e.clientX + 10}px`;
                                    tooltip.style.top = `${e.clientY - 60}px`;
                                    tooltip.innerHTML = `
                                <div style="margin-bottom: 4px; font-weight: 600;">${area.data.month}</div>
                                <div style="display: flex; align-items: center; margin-bottom: 2px;">
                                    <div style="width: 8px; height: 2px; background: ${lineColor1}; margin-right: 6px;"></div>
                                    <span>Total Assets: ${this.formatCurrency(area.data.totalValue)}</span>
                                </div>
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 8px; height: 2px; background: ${lineColor2}; margin-right: 6px;"></div>
                                    <span>Available Balance: ${this.formatCurrency(area.data.availableBalance)}</span>
                                </div>
                            `;
                                }
                            }}
                            onMouseMove={(e) => {
                                const tooltip = document.getElementById('balance-tooltip');
                                if (tooltip) {
                                    tooltip.style.left = `${e.clientX + 10}px`;
                                    tooltip.style.top = `${e.clientY - 60}px`;
                                }
                            }}
                            onMouseLeave={() => {
                                const tooltip = document.getElementById('balance-tooltip');
                                if (tooltip) {
                                    tooltip.style.display = 'none';
                                }
                            }}
                        />
                    ))}


                    {balanceData.map((data, index) => (
                        <text
                            key={index}
                            x={getPointX(index)}
                            y={chartHeight - 5}
                            textAnchor="middle"
                            fontSize="9"
                            fill={secondaryColor}
                        >
                            {data.month}
                        </text>
                    ))}


                    {[0, 0.5, 1].map((ratio, index) => {
                        const value = minValue + ratio * valueRange;
                        return (
                            <text
                                key={index}
                                x={padding.left - 8}
                                y={getPointY(value)}
                                textAnchor="end"
                                fontSize="9"
                                fill={secondaryColor}
                                dy="0.3em"
                            >
                                {this.formatCurrency(value)}
                            </text>
                        );
                    })}
                </svg>


                <div
                    id="balance-tooltip"
                    style={{
                        display: 'none',
                        position: 'fixed',
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        color: textColor,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                />
            </div>
        );
    };


    private renderPnlLineChart = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const gridColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const tooltipBg = theme === 'dark' ? '#2D323D' : '#FFFFFF';
        const tooltipBorder = theme === 'dark' ? '#4C90F0' : '#2B6CB0';


        const pnlData = [
            { month: 'Jan', unrealized: 2500, realized: 1500, daily: 450 },
            { month: 'Feb', unrealized: 3200, realized: 1800, daily: 620 },
            { month: 'Mar', unrealized: 1800, realized: 2200, daily: 380 },
            { month: 'Apr', unrealized: 4100, realized: 1900, daily: 780 },
            { month: 'May', unrealized: 3500, realized: 2100, daily: 650 },
            { month: 'Jun', unrealized: 3250, realized: 2100, daily: 520 }
        ];

        const chartHeight = 180;
        const chartWidth = '100%';
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };

        const allValues = pnlData.flatMap(d => [d.unrealized, d.realized, d.daily]);
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);
        const valueRange = maxValue - minValue;


        const getPointX = (index: number) => {
            return padding.left + (index * (100 - (padding.left + padding.right) / 10)) / (pnlData.length - 1);
        };

        const getPointY = (value: number) => {
            return padding.top + chartHeight - padding.top - padding.bottom -
                ((value - minValue) / valueRange) * (chartHeight - padding.top - padding.bottom);
        };


        const generateLinePath = (data: number[]) => {
            return data.map((value, index) =>
                `${index === 0 ? 'M' : 'L'} ${getPointX(index)} ${getPointY(value)}`
            ).join(' ');
        };

        const unrealizedPath = generateLinePath(pnlData.map(d => d.unrealized));
        const realizedPath = generateLinePath(pnlData.map(d => d.realized));
        const dailyPath = generateLinePath(pnlData.map(d => d.daily));


        const hoverAreas = pnlData.map((data, index) => ({
            x: getPointX(index) - 20,
            y: padding.top,
            width: 40,
            height: chartHeight - padding.top - padding.bottom,
            data: data
        }));

        return (
            <div style={{ height: '220px', padding: '10px 0', position: 'relative', width: '100%' }}>
                <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible', width: '100%' }}>

                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                        <line
                            key={index}
                            x1={padding.left}
                            y1={padding.top + (chartHeight - padding.top - padding.bottom) * ratio}
                            x2={'100%'}
                            y2={padding.top + (chartHeight - padding.top - padding.bottom) * ratio}
                            stroke={gridColor}
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    ))}


                    <line
                        x1={padding.left}
                        y1={getPointY(0)}
                        x2={'100%'}
                        y2={getPointY(0)}
                        stroke={secondaryColor}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                    />


                    <path
                        d={unrealizedPath}
                        fill="none"
                        stroke="#4C90F0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    <path
                        d={realizedPath}
                        fill="none"
                        stroke="#34C759"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    <path
                        d={dailyPath}
                        fill="none"
                        stroke="#FF6B6B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    {hoverAreas.map((area, index) => (
                        <rect
                            key={index}
                            x={area.x}
                            y={area.y}
                            width={area.width}
                            height={area.height}
                            fill="transparent"
                            onMouseEnter={(e) => {
                                const tooltip = document.getElementById('pnl-tooltip');
                                if (tooltip) {
                                    tooltip.style.display = 'block';
                                    tooltip.style.left = `${e.clientX + 10}px`;
                                    tooltip.style.top = `${e.clientY - 80}px`;
                                    tooltip.innerHTML = `
                                <div style="margin-bottom: 4px; font-weight: 600;">${area.data.month}</div>
                                <div style="display: flex; align-items: center; margin-bottom: 2px;">
                                    <div style="width: 8px; height: 2px; background: #4C90F0; margin-right: 6px;"></div>
                                    <span>Unrealized P&L: ${this.formatCurrency(area.data.unrealized)}</span>
                                </div>
                                <div style="display: flex; align-items: center; margin-bottom: 2px;">
                                    <div style="width: 8px; height: 2px; background: #34C759; margin-right: 6px;"></div>
                                    <span>Realized P&L: ${this.formatCurrency(area.data.realized)}</span>
                                </div>
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 8px; height: 2px; background: #FF6B6B; margin-right: 6px;"></div>
                                    <span>Daily P&L: ${this.formatCurrency(area.data.daily)}</span>
                                </div>
                            `;
                                }
                            }}
                            onMouseMove={(e) => {
                                const tooltip = document.getElementById('pnl-tooltip');
                                if (tooltip) {
                                    tooltip.style.left = `${e.clientX + 10}px`;
                                    tooltip.style.top = `${e.clientY - 80}px`;
                                }
                            }}
                            onMouseLeave={() => {
                                const tooltip = document.getElementById('pnl-tooltip');
                                if (tooltip) {
                                    tooltip.style.display = 'none';
                                }
                            }}
                        />
                    ))}


                    {pnlData.map((data, index) => (
                        <text
                            key={index}
                            x={getPointX(index)}
                            y={chartHeight - 5}
                            textAnchor="middle"
                            fontSize="9"
                            fill={secondaryColor}
                        >
                            {data.month}
                        </text>
                    ))}


                    {[0, 0.5, 1].map((ratio, index) => {
                        const value = minValue + ratio * valueRange;
                        return (
                            <text
                                key={index}
                                x={padding.left - 8}
                                y={getPointY(value)}
                                textAnchor="end"
                                fontSize="9"
                                fill={secondaryColor}
                                dy="0.3em"
                            >
                                {this.formatCurrency(value)}
                            </text>
                        );
                    })}
                </svg>


                <div
                    id="pnl-tooltip"
                    style={{
                        display: 'none',
                        position: 'fixed',
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        color: textColor,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                />
            </div>
        );
    };


    private renderPnlLineChart = () => {
        const { theme } = this.state;
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const gridColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const tooltipBg = theme === 'dark' ? '#2D323D' : '#FFFFFF';
        const tooltipBorder = theme === 'dark' ? '#4C90F0' : '#2B6CB0';


        const pnlData = [
            { month: 'Jan', unrealized: 2500, realized: 1500, daily: 450 },
            { month: 'Feb', unrealized: 3200, realized: 1800, daily: 620 },
            { month: 'Mar', unrealized: 1800, realized: 2200, daily: 380 },
            { month: 'Apr', unrealized: 4100, realized: 1900, daily: 780 },
            { month: 'May', unrealized: 3500, realized: 2100, daily: 650 },
            { month: 'Jun', unrealized: 3250, realized: 2100, daily: 520 }
        ];

        const chartHeight = 180;
        const chartWidth = '100%';
        const padding = { top: 20, right: 20, bottom: 30, left: 40 };

        const allValues = pnlData.flatMap(d => [d.unrealized, d.realized, d.daily]);
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);
        const valueRange = maxValue - minValue;


        const getPointX = (index: number) => {
            return padding.left + (index * (400 - padding.left - padding.right)) / (pnlData.length - 1);
        };

        const getPointY = (value: number) => {
            return padding.top + chartHeight - padding.top - padding.bottom -
                ((value - minValue) / valueRange) * (chartHeight - padding.top - padding.bottom);
        };


        const generateLinePath = (data: number[]) => {
            return data.map((value, index) =>
                `${index === 0 ? 'M' : 'L'} ${getPointX(index)} ${getPointY(value)}`
            ).join(' ');
        };

        const unrealizedPath = generateLinePath(pnlData.map(d => d.unrealized));
        const realizedPath = generateLinePath(pnlData.map(d => d.realized));
        const dailyPath = generateLinePath(pnlData.map(d => d.daily));


        const hoverAreas = pnlData.map((data, index) => ({
            x: getPointX(index) - 20,
            y: padding.top,
            width: 40,
            height: chartHeight - padding.top - padding.bottom,
            data: data
        }));

        return (
            <div style={{ height: '220px', padding: '10px 0', position: 'relative' }}>
                <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>

                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                        <line
                            key={index}
                            x1={padding.left}
                            y1={padding.top + (chartHeight - padding.top - padding.bottom) * ratio}
                            x2={400 - padding.right}
                            y2={padding.top + (chartHeight - padding.top - padding.bottom) * ratio}
                            stroke={gridColor}
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    ))}


                    <line
                        x1={padding.left}
                        y1={getPointY(0)}
                        x2={400 - padding.right}
                        y2={getPointY(0)}
                        stroke={secondaryColor}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                    />


                    <path
                        d={unrealizedPath}
                        fill="none"
                        stroke="#4C90F0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    <path
                        d={realizedPath}
                        fill="none"
                        stroke="#34C759"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    <path
                        d={dailyPath}
                        fill="none"
                        stroke="#FF6B6B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    {hoverAreas.map((area, index) => (
                        <rect
                            key={index}
                            x={area.x}
                            y={area.y}
                            width={area.width}
                            height={area.height}
                            fill="transparent"
                            onMouseEnter={(e) => {
                                const tooltip = document.getElementById('pnl-tooltip');
                                if (tooltip) {
                                    tooltip.style.display = 'block';
                                    tooltip.style.left = `${e.clientX + 10}px`;
                                    tooltip.style.top = `${e.clientY - 80}px`;
                                    tooltip.innerHTML = `
                                    <div style="margin-bottom: 4px; font-weight: 600;">${area.data.month}</div>
                                    <div style="display: flex; align-items: center; margin-bottom: 2px;">
                                        <div style="width: 8px; height: 2px; background: #4C90F0; margin-right: 6px;"></div>
                                        <span>Unrealized P&L: ${this.formatCurrency(area.data.unrealized)}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; margin-bottom: 2px;">
                                        <div style="width: 8px; height: 2px; background: #34C759; margin-right: 6px;"></div>
                                        <span>Realized P&L: ${this.formatCurrency(area.data.realized)}</span>
                                    </div>
                                    <div style="display: flex; align-items: center;">
                                        <div style="width: 8px; height: 2px; background: #FF6B6B; margin-right: 6px;"></div>
                                        <span>Daily P&L: ${this.formatCurrency(area.data.daily)}</span>
                                    </div>
                                `;
                                }
                            }}
                            onMouseMove={(e) => {
                                const tooltip = document.getElementById('pnl-tooltip');
                                if (tooltip) {
                                    tooltip.style.left = `${e.clientX + 10}px`;
                                    tooltip.style.top = `${e.clientY - 80}px`;
                                }
                            }}
                            onMouseLeave={() => {
                                const tooltip = document.getElementById('pnl-tooltip');
                                if (tooltip) {
                                    tooltip.style.display = 'none';
                                }
                            }}
                        />
                    ))}


                    {pnlData.map((data, index) => (
                        <text
                            key={index}
                            x={getPointX(index)}
                            y={chartHeight - 5}
                            textAnchor="middle"
                            fontSize="9"
                            fill={secondaryColor}
                        >
                            {data.month}
                        </text>
                    ))}


                    {[0, 0.5, 1].map((ratio, index) => {
                        const value = minValue + ratio * valueRange;
                        return (
                            <text
                                key={index}
                                x={padding.left - 5}
                                y={getPointY(value)}
                                textAnchor="end"
                                fontSize="9"
                                fill={secondaryColor}
                                dy="0.3em"
                            >
                                {this.formatCurrency(value)}
                            </text>
                        );
                    })}
                </svg>


                <div
                    id="pnl-tooltip"
                    style={{
                        display: 'none',
                        position: 'fixed',
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        color: textColor,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                />
            </div>
        );
    };


    private renderMainDashboard = () => {
        const { theme, profileData } = this.state;
        const bgColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

        return (
            <div style={{
                backgroundColor: bgColor,
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                height: '100%',
                overflow: 'hidden'
            }}>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '0px',
                    marginBottom: '0px',
                    flexShrink: 0
                }}>
                    {this.renderMetricCard(
                        "Total Asset Value",
                        this.formatCurrency(profileData.accountInfo.totalValue),
                        this.formatPercentage(profileData.portfolio.performance.today),
                        profileData.portfolio.performance.today >= 0
                    )}
                    {this.renderMetricCard(
                        "Available Funds",
                        this.formatCurrency(profileData.accountInfo.availableBalance)
                    )}
                    {this.renderMetricCard(
                        "Invested Amount",
                        this.formatCurrency(profileData.accountInfo.investedAmount)
                    )}
                    {this.renderMetricCard(
                        "Margin Balance",
                        this.formatCurrency(profileData.accountInfo.marginBalance)
                    )}
                    {this.renderMetricCard(
                        "Buying Power",
                        this.formatCurrency(profileData.accountInfo.buyingPower)
                    )}
                    {this.renderMetricCard(
                        "Today's P&L",
                        this.formatCurrency(profileData.accountInfo.dailyPnL),
                        this.formatPercentage(profileData.portfolio.performance.today),
                        profileData.accountInfo.dailyPnL >= 0
                    )}
                </div>


                <div style={{
                    display: 'flex',
                    gap: '0',
                    marginBottom: '0px',
                    height: '300px',
                    flexShrink: 0
                }}>

                    <div style={{
                        flex: 1,
                        borderRight: 'none',
                        borderTopLeftRadius: '0px',
                        borderBottomLeftRadius: '0px'
                    }}>
                        {this.renderAccountInfoPanel()}
                    </div>


                    <div style={{
                        backgroundColor: cardBg,
                        border: `1px solid ${borderColor}`,
                        padding: '15px',
                        flex: 1,
                        borderRight: 'none'
                    }}>
                        <div style={{
                            color: textColor,
                            fontSize: '13px',
                            fontWeight: '700',
                            marginBottom: '12px',
                            borderBottom: `1px solid ${borderColor}`,
                            paddingBottom: '8px'
                        }}>
                            Risk Metrics
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {[
                                { label: 'VaR (95%)', value: this.formatCurrency(profileData.riskMetrics.var95) },
                                { label: 'Sharpe Ratio', value: profileData.riskMetrics.sharpeRatio.toFixed(2) },
                                { label: 'Max Drawdown', value: `${profileData.riskMetrics.maxDrawdown.toFixed(2)}%` },
                                { label: 'Beta', value: profileData.riskMetrics.beta.toFixed(2) },
                                { label: 'Volatility', value: `${profileData.riskMetrics.volatility.toFixed(2)}%` },
                                { label: 'Stress Test', value: `${profileData.riskMetrics.stressTestScore.toFixed(1)}%` }
                            ].map((item, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: secondaryColor, fontSize: '11px' }}>{item.label}:</span>
                                    <span style={{
                                        color: item.label.includes('VaR') || item.label.includes('Drawdown') ? '#FF4444' : textColor,
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        fontFamily: "'Courier New', monospace"
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div style={{
                        backgroundColor: cardBg,
                        border: `1px solid ${borderColor}`,
                        padding: '15px',
                        flex: 1,
                        borderTopRightRadius: '0px',
                        borderBottomRightRadius: '0px'
                    }}>
                        <div style={{
                            color: textColor,
                            fontSize: '13px',
                            fontWeight: '700',
                            marginBottom: '12px',
                            borderBottom: `1px solid ${borderColor}`,
                            paddingBottom: '8px'
                        }}>
                            Asset Allocation
                        </div>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            {Object.entries(profileData.portfolio.diversification).map(([asset, percentage]) => (
                                <div key={asset} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        color: secondaryColor,
                                        fontSize: '11px',
                                        minWidth: '80px',
                                        textTransform: 'capitalize'
                                    }}>
                                        {asset === 'equities' ? 'Equities' :
                                            asset === 'fixedIncome' ? 'Fixed Income' :
                                                asset === 'alternatives' ? 'Alternatives' : 'Cash'}
                                    </div>
                                    <ProgressBar
                                        value={percentage / 100}
                                        animate={false}
                                        style={{ flex: 1, height: '8px', margin: 0 }}
                                    />
                                    <div style={{
                                        color: textColor,
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        minWidth: '35px',
                                        textAlign: 'right',
                                        fontFamily: "'Courier New', monospace"
                                    }}>
                                        {percentage.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div style={{
                    marginBottom: '0px',
                    height: '400px',
                    flex: 1,
                    minHeight: 0
                }}>
                    {this.renderPositionsAndBalancesPanel()}
                </div>
            </div>
        );
    };


    componentDidMount() {
        this.updateContainerHeight();
        window.addEventListener('resize', this.debouncedResize);
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
        overflowManager.setOverflow('hidden');
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedResize);
        if (this.unsubscribe) this.unsubscribe();
    }



    render() {
        const { containerHeight, theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const headerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';

        return (
            <div
                ref={this.containerRef}
                style={{
                    height: containerHeight > 0 ? `${containerHeight}px` : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor,
                    color: textColor,
                    overflow: 'hidden',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                }}
            >

                <div style={{
                    padding: '8px 15px',
                    backgroundColor: headerBg,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon icon="portfolio" size={14} />
                        <span style={{ fontSize: '14px', fontWeight: '700' }}>Portfolio Overview</span>
                        <span style={{
                            fontSize: '11px',
                            opacity: 0.7,
                            fontFamily: "'Courier New', monospace"
                        }}>
                            {this.state.profileData.personalInfo.clientId}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button small minimal icon="refresh" title="Refresh Data" />
                        <Button small minimal icon="print" title="Print Report" />
                        <Button small minimal icon="export" title="Export Data" />
                    </div>
                </div>


                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {this.renderMainDashboard()}
                </div>
            </div>
        );
    }

}

export default ProfilePageIndex;