import React from 'react';
import { HTMLTable } from '@blueprintjs/core';
import '../styles/TradePage.css';

interface TradingLayoutState {
    visibleModules: number;
    windowWidth: number;
    theme: 'dark' | 'light';
    activeTradeTab: string;
    activeTradingInfoTab: string;
    showSymbolPopup: boolean;
}

interface ModuleConfig {
    id: string;
    name: string;
    minWidth: number;
    priority: number;
    component: React.ReactNode;
    fixed?: boolean;
}

const TEST_DATA = {
    balance: [
        { asset: 'USDT', total: 12456.78, available: 8234.56, frozen: 4222.22 },
        { asset: 'BTC', total: 2.5, available: 1.2, frozen: 1.3 },
        { asset: 'ETH', total: 15.8, available: 10.2, frozen: 5.6 },
        { asset: 'BNB', total: 45.6, available: 30.1, frozen: 15.5 },
        { asset: 'SOL', total: 120.5, available: 80.3, frozen: 40.2 },
        { asset: 'ADA', total: 2500, available: 1800, frozen: 700 },
        { asset: 'DOT', total: 180.7, available: 120.4, frozen: 60.3 },
        { asset: 'LINK', total: 85.3, available: 60.1, frozen: 25.2 },
    ],
    positions: [
        { symbol: 'BTC-PERP', side: 'long', amount: 2.5, entryPrice: 41234.56, currentPrice: 42567.89, pnl: 1245.67 },
        { symbol: 'ETH-PERP', side: 'short', amount: 15.0, entryPrice: 2850.45, currentPrice: 2820.12, pnl: -455.0 },
        { symbol: 'SOL-PERP', side: 'long', amount: 50.0, entryPrice: 98.76, currentPrice: 102.34, pnl: 179.0 },
        { symbol: 'ADA-PERP', side: 'long', amount: 1000.0, entryPrice: 0.456, currentPrice: 0.478, pnl: 22.0 },
        { symbol: 'DOT-PERP', side: 'short', amount: 80.0, entryPrice: 7.89, currentPrice: 7.65, pnl: 19.2 },
        { symbol: 'LINK-PERP', side: 'long', amount: 40.0, entryPrice: 14.56, currentPrice: 15.23, pnl: 26.8 },
        { symbol: 'BNB-PERP', side: 'long', amount: 5.0, entryPrice: 320.45, currentPrice: 335.67, pnl: 76.1 },
        { symbol: 'XRP-PERP', side: 'short', amount: 500.0, entryPrice: 0.623, currentPrice: 0.598, pnl: 12.5 },
    ],
    currentOrders: [
        { symbol: 'BTC-PERP', side: 'buy', type: 'limit', price: 42450.0, amount: 1.2, filled: 0.0, status: 'active' },
        { symbol: 'ETH-PERP', side: 'sell', type: 'limit', price: 2860.0, amount: 5.0, filled: 0.0, status: 'active' },
        { symbol: 'SOL-PERP', side: 'buy', type: 'market', price: 0.0, amount: 10.0, filled: 0.0, status: 'active' },
        { symbol: 'ADA-PERP', side: 'sell', type: 'limit', price: 0.485, amount: 500.0, filled: 0.0, status: 'active' },
        { symbol: 'DOT-PERP', side: 'buy', type: 'limit', price: 7.50, amount: 100.0, filled: 0.0, status: 'active' },
        { symbol: 'LINK-PERP', side: 'sell', type: 'limit', price: 15.50, amount: 20.0, filled: 0.0, status: 'active' },
        { symbol: 'BNB-PERP', side: 'buy', type: 'market', price: 0.0, amount: 2.0, filled: 0.0, status: 'active' },
        { symbol: 'XRP-PERP', side: 'sell', type: 'limit', price: 0.615, amount: 300.0, filled: 0.0, status: 'active' },
    ],
    twapOrders: [
        { symbol: 'BTC-PERP', side: 'buy', totalAmount: 5.0, duration: 3600, completed: 2.5, status: 'executing' },
        { symbol: 'ETH-PERP', side: 'sell', totalAmount: 20.0, duration: 1800, completed: 8.0, status: 'executing' },
        { symbol: 'SOL-PERP', side: 'buy', totalAmount: 100.0, duration: 7200, completed: 25.0, status: 'executing' },
        { symbol: 'ADA-PERP', side: 'sell', totalAmount: 2000.0, duration: 5400, completed: 800.0, status: 'executing' },
        { symbol: 'DOT-PERP', side: 'buy', totalAmount: 200.0, duration: 2700, completed: 75.0, status: 'executing' },
        { symbol: 'LINK-PERP', side: 'sell', totalAmount: 50.0, duration: 3600, completed: 15.0, status: 'executing' },
        { symbol: 'BNB-PERP', side: 'buy', totalAmount: 10.0, duration: 1800, completed: 3.5, status: 'executing' },
        { symbol: 'XRP-PERP', side: 'sell', totalAmount: 1000.0, duration: 4500, completed: 300.0, status: 'executing' },
    ],
    tradeHistory: [
        { time: '14:30:45', symbol: 'BTC-PERP', side: 'buy', price: 42567.8, amount: 0.5, fee: 1.28 },
        { time: '14:28:12', symbol: 'ETH-PERP', side: 'sell', price: 2855.2, amount: 2.0, fee: 2.85 },
        { time: '14:25:33', symbol: 'SOL-PERP', side: 'buy', price: 101.5, amount: 15.0, fee: 0.76 },
        { time: '14:20:18', symbol: 'ADA-PERP', side: 'sell', price: 0.472, amount: 800.0, fee: 1.51 },
        { time: '14:15:27', symbol: 'DOT-PERP', side: 'buy', price: 7.72, amount: 50.0, fee: 0.15 },
        { time: '14:10:56', symbol: 'LINK-PERP', side: 'sell', price: 15.12, amount: 10.0, fee: 0.61 },
        { time: '14:05:34', symbol: 'BNB-PERP', side: 'buy', price: 332.8, amount: 1.5, fee: 2.5 },
        { time: '14:00:12', symbol: 'XRP-PERP', side: 'sell', price: 0.605, amount: 400.0, fee: 0.97 },
        { time: '13:55:43', symbol: 'BTC-PERP', side: 'sell', price: 42580.2, amount: 0.3, fee: 0.77 },
        { time: '13:50:29', symbol: 'ETH-PERP', side: 'buy', price: 2848.6, amount: 3.0, fee: 4.27 },
        { time: '13:45:17', symbol: 'SOL-PERP', side: 'sell', price: 102.1, amount: 8.0, fee: 0.41 },
        { time: '13:40:05', symbol: 'ADA-PERP', side: 'buy', price: 0.469, amount: 1200.0, fee: 2.25 },
    ],
    fundingHistory: [
        { time: '14:00:00', symbol: 'BTC-PERP', rate: 0.0001, payment: 0.0025, position: 2.5 },
        { time: '12:00:00', symbol: 'ETH-PERP', rate: -0.0002, payment: -0.0030, position: 15.0 },
        { time: '10:00:00', symbol: 'SOL-PERP', rate: 0.0003, payment: 0.0015, position: 50.0 },
        { time: '08:00:00', symbol: 'ADA-PERP', rate: 0.0004, payment: 0.0020, position: 500.0 },
        { time: '06:00:00', symbol: 'DOT-PERP', rate: -0.0001, payment: -0.0008, position: 80.0 },
        { time: '04:00:00', symbol: 'LINK-PERP', rate: 0.0002, payment: 0.0008, position: 40.0 },
        { time: '02:00:00', symbol: 'BNB-PERP', rate: 0.0005, payment: 0.0025, position: 5.0 },
        { time: '00:00:00', symbol: 'XRP-PERP', rate: -0.0003, payment: -0.0015, position: 500.0 },
    ],
    orderHistory: [
        { time: '14:30:45', symbol: 'BTC-PERP', side: 'buy', type: 'limit', price: 42567.8, amount: 0.5, filled: 0.5, status: 'filled' },
        { time: '14:28:12', symbol: 'ETH-PERP', side: 'sell', type: 'limit', price: 2855.2, amount: 2.0, filled: 2.0, status: 'filled' },
        { time: '14:25:33', symbol: 'SOL-PERP', side: 'buy', type: 'market', price: 101.5, amount: 15.0, filled: 15.0, status: 'filled' },
        { time: '14:20:18', symbol: 'ADA-PERP', side: 'sell', type: 'limit', price: 0.472, amount: 800.0, filled: 800.0, status: 'filled' },
        { time: '14:15:27', symbol: 'DOT-PERP', side: 'buy', type: 'limit', price: 7.72, amount: 50.0, filled: 50.0, status: 'filled' },
        { time: '14:10:56', symbol: 'LINK-PERP', side: 'sell', type: 'limit', price: 15.12, amount: 10.0, filled: 10.0, status: 'filled' },
        { time: '14:05:34', symbol: 'BNB-PERP', side: 'buy', type: 'market', price: 332.8, amount: 1.5, filled: 1.5, status: 'filled' },
        { time: '14:00:12', symbol: 'XRP-PERP', side: 'sell', type: 'limit', price: 0.605, amount: 400.0, filled: 400.0, status: 'filled' },
    ]
};

class TradingLayout extends React.Component<{}, TradingLayoutState> {
    private modules: ModuleConfig[];
    private resizeTimeout: NodeJS.Timeout | null = null;
    private readonly CONTAINER_PADDING = 16;
    private readonly GAP_WIDTH = 1;

    constructor(props: {}) {
        super(props);

        this.state = {
            visibleModules: 3,
            windowWidth: window.innerWidth,
            theme: this.getCurrentTheme(),
            activeTradeTab: 'limit',
            activeTradingInfoTab: 'balance',
            showSymbolPopup: false
        };

        this.modules = [
            {
                id: 'kline',
                name: 'Chart',
                minWidth: 600,
                priority: 1,
                fixed: true,
                component: this.renderKLineChart()
            },
            {
                id: 'orderbook',
                name: 'OrderBook',
                minWidth: 280,
                priority: 2,
                component: this.renderOrderBook()
            },
            {
                id: 'trading',
                name: 'Trading',
                minWidth: 320,
                priority: 3,
                component: this.renderTradingPanel()
            }
        ];
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('click', this.handleClickOutside);
        this.calculateVisibleModules();
        this.applyTheme(this.state.theme);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('click', this.handleClickOutside);
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
    }

    handleClickOutside = (event: MouseEvent) => {
        if (this.state.showSymbolPopup) {
            this.setState({ showSymbolPopup: false });
        }
    };

    getCurrentTheme = (): 'dark' | 'light' => {
        const html = document.documentElement;
        return html.classList.contains('bp4-dark') ? 'dark' : 'light';
    };

    applyTheme = (theme: 'dark' | 'light') => {
        const html = document.documentElement;
        const body = document.body;

        if (theme === 'dark') {
            html.classList.add('bp4-dark');
            html.classList.remove('bp4-light');
            body.style.backgroundColor = '#1C2127';
            body.style.color = '#F5F8FA';
        } else {
            html.classList.add('bp4-light');
            html.classList.remove('bp4-dark');
            body.style.backgroundColor = '#FFFFFF';
            body.style.color = '#182026';
        }
    };

    handleResize = () => {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            this.setState({
                windowWidth: window.innerWidth,
                theme: this.getCurrentTheme()
            });
            this.calculateVisibleModules();
        }, 100);
    };

    calculateVisibleModules = () => {
        const { windowWidth } = this.state;
        const availableWidth = windowWidth - this.CONTAINER_PADDING * 2;

        const fixedModule = this.modules.find(m => m.fixed);
        if (!fixedModule) return;

        let remainingWidth = availableWidth - fixedModule.minWidth - this.GAP_WIDTH;
        let visibleCount = 1;

        const variableModules = this.modules
            .filter(m => !m.fixed)
            .sort((a, b) => a.priority - b.priority);

        for (const module of variableModules) {
            if (remainingWidth >= module.minWidth + this.GAP_WIDTH && visibleCount < 3) {
                remainingWidth -= (module.minWidth + this.GAP_WIDTH);
                visibleCount++;
            } else {
                break;
            }
        }

        this.setState({ visibleModules: Math.max(2, visibleCount) });
    };

    handleTradeTabChange = (tabId: string) => {
        this.setState({ activeTradeTab: tabId });
    };

    handleTradingInfoTabChange = (tabId: string) => {
        this.setState({ activeTradingInfoTab: tabId });
    };

    handleSymbolClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        this.setState(prevState => ({ showSymbolPopup: !prevState.showSymbolPopup }));
    };

    handleMaxClick = (field: 'price' | 'amount') => {
        if (field === 'price') {
        } else {
        }
    };

    renderBalanceTable = () => (
        <div className="trading-info-table-container">
            <HTMLTable striped interactive className="trading-info-table">
                <thead>
                    <tr>
                        <th>Assets</th>
                        <th>Total</th>
                        <th>Available</th>
                        <th>Frozen</th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_DATA.balance.map((item, index) => (
                        <tr key={index}>
                            <td>{item.asset}</td>
                            <td>{item.total.toLocaleString()}</td>
                            <td>{item.available.toLocaleString()}</td>
                            <td>{item.frozen.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </HTMLTable>
        </div>
    );

    renderPositionsTable = () => (
        <div className="trading-info-table-container">
            <HTMLTable striped interactive className="trading-info-table">
                <thead>
                    <tr>
                        <th>Futuers</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Current Price</th>
                        <th>Unrealized profit and loss</th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_DATA.positions.map((item, index) => (
                        <tr key={index}>
                            <td>{item.symbol}</td>
                            <td className={item.side === 'long' ? 'positive' : 'negative'}>
                                {item.side === 'long' ? 'Long' : 'Short'}
                            </td>
                            <td>{item.amount}</td>
                            <td>${item.entryPrice.toLocaleString()}</td>
                            <td>${item.currentPrice.toLocaleString()}</td>
                            <td className={item.pnl >= 0 ? 'positive' : 'negative'}>
                                ${item.pnl.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </HTMLTable></div>
    );

    renderCurrentOrdersTable = () => (
        <div className="trading-info-table-container">
            <HTMLTable striped interactive className="trading-info-table">
                <thead>
                    <tr>
                        <th>Contract</th>
                        <th>Direction</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Filled</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_DATA.currentOrders.map((item, index) => (
                        <tr key={index}>
                            <td>{item.symbol}</td>
                            <td className={item.side === 'buy' ? 'positive' : 'negative'}>
                                {item.side === 'buy' ? 'Buy' : 'Sell'}
                            </td>
                            <td>{item.type === 'limit' ? 'limit' : 'price'}</td>
                            <td>{item.price > 0 ? `$${item.price.toLocaleString()}` : 'price'}</td>
                            <td>{item.amount}</td>
                            <td>{item.filled}</td>
                            <td className="neutral">{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </HTMLTable></div>
    );

    renderTWAPTable = () => (
        <div className="trading-info-table-container">
            <HTMLTable striped interactive className="trading-info-table">
                <thead>
                    <tr>
                        <th>Contract</th>
                        <th>Direction</th>
                        <th>Total Quantity</th>
                        <th>Duration</th>
                        <th>Completed</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_DATA.twapOrders.map((item, index) => (
                        <tr key={index}>
                            <td>{item.symbol}</td>
                            <td className={item.side === 'buy' ? 'positive' : 'negative'}>
                                {item.side === 'buy' ? 'Buy' : 'Sell'}
                            </td>
                            <td>{item.totalAmount}</td>
                            <td>{item.duration} s</td>
                            <td>{item.completed}</td>
                            <td className="neutral">{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </HTMLTable></div>
    );

    renderTradeHistoryTable = () => (
        <div className="trading-info-table-container">
            <HTMLTable striped interactive className="trading-info-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Contract</th>
                        <th>Direction</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Fee</th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_DATA.tradeHistory.map((item, index) => (
                        <tr key={index}>
                            <td>{item.time}</td>
                            <td>{item.symbol}</td>
                            <td className={item.side === 'buy' ? 'positive' : 'negative'}>
                                {item.side === 'buy' ? 'Buy' : 'Sell'}
                            </td>
                            <td>${item.price.toLocaleString()}</td>
                            <td>{item.amount}</td>
                            <td>{item.fee}</td>
                        </tr>
                    ))}
                </tbody>
            </HTMLTable></div>
    );

    renderFundingHistoryTable = () => (
        <div className="trading-info-table-container">
            <HTMLTable striped interactive className="trading-info-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Contract</th>
                        <th>Funding Rate</th>
                        <th>Payment Amount</th>
                        <th>Position Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_DATA.fundingHistory.map((item, index) => (
                        <tr key={index}>
                            <td>{item.time}</td>
                            <td>{item.symbol}</td>
                            <td className={item.rate >= 0 ? 'positive' : 'negative'}>
                                {(item.rate * 100).toFixed(4)}%
                            </td>
                            <td className={item.payment >= 0 ? 'positive' : 'negative'}>
                                {item.payment}
                            </td>
                            <td>{item.position}</td>
                        </tr>
                    ))}
                </tbody>
            </HTMLTable></div>
    );

    renderOrderHistoryTable = () => (
        <div className="trading-info-table-container">
            <HTMLTable striped interactive className="trading-info-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Contract</th>
                        <th>Direction</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Filled</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_DATA.orderHistory.map((item, index) => (
                        <tr key={index}>
                            <td>{item.time}</td>
                            <td>{item.symbol}</td>
                            <td className={item.side === 'buy' ? 'positive' : 'negative'}>
                                {item.side === 'buy' ? 'Buy' : 'Sell'}
                            </td>
                            <td>{item.type === 'limit' ? 'Limit' : 'Price'}</td>
                            <td>{item.price > 0 ? `$${item.price.toLocaleString()}` : 'Price'}</td>
                            <td>{item.amount}</td>
                            <td>{item.filled}</td>
                            <td className="neutral">{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </HTMLTable></div>
    );

    renderTradingInfoContent = () => {
        const { activeTradingInfoTab } = this.state;

        switch (activeTradingInfoTab) {
            case 'balance':
                return this.renderBalanceTable();
            case 'positions':
                return this.renderPositionsTable();
            case 'currentOrders':
                return this.renderCurrentOrdersTable();
            case 'twap':
                return this.renderTWAPTable();
            case 'tradeHistory':
                return this.renderTradeHistoryTable();
            case 'fundingHistory':
                return this.renderFundingHistoryTable();
            case 'orderHistory':
                return this.renderOrderHistoryTable();
            default:
                return this.renderBalanceTable();
        }
    };

    renderTradingInfoPanel = () => (
        <div className="trading-info-container">
            <div className="trading-info-tabs" style={{ overflow: "hidden" }}>
                {[
                    { id: 'balance', label: 'Balance' },
                    { id: 'positions', label: 'Positions' },
                    { id: 'currentOrders', label: 'Current Orders' },
                    { id: 'twap', label: 'TWAP' },
                    { id: 'tradeHistory', label: 'Historical Transaction' },
                    { id: 'fundingHistory', label: 'Funding History' },
                    { id: 'orderHistory', label: 'Historical Orders' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`trading-info-tab ${this.state.activeTradingInfoTab === tab.id ? 'active' : ''}`}
                        onClick={() => this.handleTradingInfoTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="trading-info-content">
                <div className="trading-info-list">
                    {this.renderTradingInfoContent()}
                </div>
            </div>
        </div>
    );

    renderKLineChart = () => (
        <div className="kline-container">
            <div className="kline-header">
                <div className="symbol-info">
                    <div
                        className="symbol"
                        onClick={this.handleSymbolClick}
                    >
                        BTC/USDT
                        <div className={`symbol-popup ${this.state.showSymbolPopup ? 'show' : ''}`}>
                            <div className="symbol-popup-header">BTC/USDT Trading Pair Information</div>
                            <div className="symbol-popup-content">
                                <div>24-hour Trading Volume: $28.5B</div>
                                <div>24-hour Price Change: +2.34%</div>
                                <div>Supported Trading Types: Spot/Perpetual Contracts</div>
                                <div>Minimum Trading Quantity: 0.0001 BTC</div>
                                <div>Price Accuracy: 0.01</div>
                            </div>
                        </div>
                    </div>
                    <span className="price">$42,567.89</span>
                    <span className="change positive">+2.34%</span>
                </div>
                <div className="timeframe-selector">
                    {['1m', '5m', '15m', '1h', '4h', '1d', '1w'].map(tf => (
                        <button key={tf} className="timeframe-btn">{tf}</button>
                    ))}
                </div>
            </div>
            <div className="chart-area">
                <div className="chart-placeholder">
                    Chart Area
                </div>
            </div>
        </div>
    );

    renderOrderBook = () => (
        <div className="orderbook-container">
            <div className="module-header">
                <h3>OrderBook</h3>
                <div className="header-actions">
                    <select className="depth-select">
                        <option>0.1%</option>
                        <option>0.5%</option>
                        <option>1%</option>
                    </select>
                </div>
            </div>

            <div className="orderbook-content">
                <div className="orderbook-section">
                    <div className="section-header">
                        <span>Price (USDT)</span>
                        <span>Quantity (BTC)</span>
                    </div>
                    <div className="bids-list">
                        {this.renderOrderBookData('bid')}
                    </div>
                </div>

                <div className="current-price">
                    <div className="price-main">$42,567.89</div>
                    <div className="price-spread">Spread: $0.89</div>
                </div>

                <div className="orderbook-section">
                    <div className="section-header">
                        <span>Price (USDT)</span>
                        <span>Quantity (BTC)</span>
                    </div>
                    <div className="asks-list">
                        {this.renderOrderBookData('ask')}
                    </div>
                </div>
            </div>
        </div>
    );

    renderOrderBookData = (type: 'bid' | 'ask') => {
        const data = type === 'bid' ? [
            { price: 42567.8, amount: 1.25 },
            { price: 42567.5, amount: 0.85 },
            { price: 42567.2, amount: 2.10 },
            { price: 42566.9, amount: 1.50 },
            { price: 42566.6, amount: 0.95 }
        ] : [
            { price: 42568.0, amount: 0.75 },
            { price: 42568.3, amount: 1.10 },
            { price: 42568.6, amount: 0.95 },
            { price: 42568.9, amount: 1.40 },
            { price: 42569.2, amount: 0.60 }
        ];

        return data.map((order, index) => (
            <div
                key={index}
                className={`order-row ${type}`}
            >
                <span className="price">{order.price.toLocaleString()}</span>
                <span className="amount">{order.amount.toFixed(4)}</span>
            </div>
        ));
    };

    renderTradingPanel = () => (
        <div className="trading-panel-container">
            <div className="module-header">
                <h3>Trade</h3>
                <div className="trading-tabs">
                    <button
                        className={`tab ${this.state.activeTradeTab === 'market' ? 'active' : ''}`}
                        onClick={() => this.handleTradeTabChange('market')}
                    >
                        Market Price
                    </button>
                    <button
                        className={`tab ${this.state.activeTradeTab === 'limit' ? 'active' : ''}`}
                        onClick={() => this.handleTradeTabChange('limit')}
                    >
                        Price Limit
                    </button>
                </div>
            </div>

            <div className="trading-content">
                <div className="side-selector">
                    <button className="side-btn buy active">Long</button>
                    <button className="side-btn sell">Short</button>
                </div>

                <div className="form-group">
                    <label>Price (USDT)</label>
                    <div className="input-with-max">
                        <input
                            type="number"
                            placeholder="0.00"
                            defaultValue="42567.89"
                            disabled={this.state.activeTradeTab === 'market'}
                        />
                        <button
                            className="max-btn"
                            onClick={() => this.handleMaxClick('price')}
                        >
                            MAX
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Quantity (BTC)</label>
                    <div className="input-with-max">
                        <input type="number" placeholder="0.00" />
                        <button
                            className="max-btn"
                            onClick={() => this.handleMaxClick('amount')}
                        >
                            MAX
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Leverage</label>
                    <select defaultValue="10">
                        <option>1x</option>
                        <option>2x</option>
                        <option>5x</option>
                        <option>10x</option>
                    </select>
                </div>

                <button className="trade-action-btn buy">
                    Buy BTC
                </button>

                <div className="balance-info">
                    <div className="balance-row">
                        <span>Balance</span>
                        <span>1,245.67 USDT</span>
                    </div>
                </div>
            </div>
        </div>
    );

    renderAccountInfo = () => (
        <div className="account-container" >
            <div className="account-section" style={{ minHeight: "180px" }}>
                <div className="account-header">
                    <h4>Account Rights</h4>
                </div>
                <div className="account-content">
                    <div className="account-grid">
                        <div className="account-item">
                            <span className="label">Total Rights</span>
                            <span className="value">$12,456.78</span>
                        </div>
                        <div className="account-item">
                            <span className="label">available balance</span>
                            <span className="value">$8,234.56</span>
                        </div>
                        <div className="account-item">
                            <span className="label">frozen amount</span>
                            <span className="value">$4,222.22</span>
                        </div>
                        <div className="account-item">
                            <span className="label">Account equity</span>
                            <span className="value">$28,123.45</span>
                        </div>
                        <div className="account-item">
                            <span className="label">Margin balance</span>
                            <span className="value">$15,678.90</span>
                        </div>
                        <div className="account-item">
                            <span className="label">Unrealized profit and loss</span>
                            <span className="value positive">+$1,245.67</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="account-section">
                <div className="account-header">
                    <h4>Perpetual Contract Overview</h4>
                </div>
                <div className="account-content">
                    <div className="overview-grid">
                        <div className="overview-item">
                            <span className="label">balance</span>
                            <span className="value">$12,345.67</span>
                        </div>
                        <div className="overview-item">
                            <span className="label">Unrealized profit and loss</span>
                            <span className="value positive">+$1,245.67</span>
                        </div>
                        <div className="overview-item">
                            <span className="label">Full Margin Ratio</span>
                            <span className="value">245.8%</span>
                        </div>
                        <div className="overview-item">
                            <span className="label">maintenance margin</span>
                            <span className="value">$2,345.67</span>
                        </div>
                        <div className="overview-item">
                            <span className="label">Cross-margin account leverage</span>
                            <span className="value">3.2x</span>
                        </div>
                        <div className="overview-item">
                            <span className="label">risk level</span>
                            <span className="value safe">Safe</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    render() {
        const { visibleModules, theme } = this.state;

        const visibleModuleComponents = this.modules
            .sort((a, b) => a.priority - b.priority)
            .slice(0, visibleModules);

        return (
            <div className={`trading-layout ${theme}`}>
                <div className="layout-container">
                    <div className="top-panels">
                        {visibleModuleComponents.map((module, index) => (
                            <div
                                key={module.id}
                                className={`module ${module.id} ${module.fixed ? 'fixed' : ''}`}
                                style={{
                                    borderRight: index < visibleModuleComponents.length - 1 ?
                                        `1px solid ${theme === 'dark' ? '#394B59' : '#DCE0E5'}` : 'none'
                                }}
                            >
                                {module.component}
                            </div>
                        ))}
                    </div>

                    <div className="bottom-panels">
                        <div
                            className="module combined"
                            style={{
                                borderRight: `1px solid ${theme === 'dark' ? '#394B59' : '#DCE0E5'}`
                            }}
                        >
                            {this.renderTradingInfoPanel()}
                        </div>
                        <div className="module account">
                            {this.renderAccountInfo()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TradingLayout;