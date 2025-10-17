import React from "react";


interface EventsPanelProps {
    theme: 'dark' | 'light';
    headerHeight: number;
    scrollbarStyles: any;
    panelHeight: number;
}

interface EventsPanelState {
    events: any[];
    isHovered: boolean;
}

class EventsPanel extends React.Component<EventsPanelProps, EventsPanelState> {
    private eventsInterval: NodeJS.Timeout | null = null;
    private scrollContainerRef = React.createRef<HTMLDivElement>();
    private eventsCounter = 6;

    constructor(props: EventsPanelProps) {
        super(props);
        this.state = {
            events: [
                {
                    id: 1,
                    timestamp: this.getCurrentTime(),
                    type: 'arbitrage',
                    description: 'Large ETH Spot-Futures Arb Executed on Deribit',
                    size: '2,450 ETH',
                    profit: '+$12.4K',
                    exchanges: 'Binance → Deribit',
                    status: 'completed'
                },
                {
                    id: 2,
                    timestamp: this.getCurrentTime(-60),
                    type: 'liquidation',
                    description: 'Cascade Liquidation on Perp DEX - $4.2M in Positions',
                    size: '$4.2M',
                    profit: '+$86.5K',
                    exchanges: 'dYdX, GMX',
                    status: 'completed'
                },
                {
                    id: 3,
                    timestamp: this.getCurrentTime(-120),
                    type: 'flash_loan',
                    description: 'Complex Flash Loan Arb on Aave v3',
                    size: '$5.8M',
                    profit: '+$23.1K',
                    exchanges: 'Aave, Uniswap',
                    status: 'executing'
                }
            ],
            isHovered: false
        };
    }

    componentDidMount() {
        this.startEventsFeed();
    }

    componentWillUnmount() {
        if (this.eventsInterval) {
            clearInterval(this.eventsInterval);
        }
    }

    getCurrentTime = (offsetSeconds: number = 0) => {
        const now = new Date();
        now.setSeconds(now.getSeconds() + offsetSeconds);
        return now.toTimeString().split(' ')[0].substring(0, 8);
    };

    startEventsFeed = () => {
        this.eventsInterval = setInterval(() => {
            if (!this.state.isHovered) {
                this.addNewEvent();
            }
        }, 3000); 
    };

    addNewEvent = () => {
        const eventTemplates = [
            {
                type: 'arbitrage' as const,
                description: 'Cross-Exchange Stablecoin Arb USDC/USDT',
                size: '$8.3M',
                profit: '+$15.2K',
                exchanges: 'Coinbase → Kraken',
                status: 'completed' as const
            },
            {
                type: 'market_making' as const,
                description: 'Aggressive Market Making on BTC Perp',
                size: '$12.5M',
                profit: '+$8.7K',
                exchanges: 'Binance, OKX',
                status: 'active' as const
            },
            {
                type: 'funding_rate' as const,
                description: 'Funding Rate Arb on ETH Perpetual',
                size: '1,250 ETH',
                profit: '+$6.8K',
                exchanges: 'FTX, Bybit',
                status: 'completed' as const
            },
            {
                type: 'flash_loan' as const,
                description: 'Flash Loan Position on Compound',
                size: '$3.2M',
                profit: '+$18.9K',
                exchanges: 'Compound, Uniswap',
                status: 'executing' as const
            }
        ];

        const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];

        this.eventsCounter++;
        const newEvent = {
            id: this.eventsCounter,
            timestamp: this.getCurrentTime(),
            ...template
        };

        this.setState(prevState => ({
            events: [newEvent, ...prevState.events.slice(0, 9)] 
        }), () => {
            
            if (this.scrollContainerRef.current && !this.state.isHovered) {
                this.scrollContainerRef.current.scrollTop = 0;
            }
        });
    };

    handleMouseEnter = () => {
        this.setState({ isHovered: true });
    };

    handleMouseLeave = () => {
        this.setState({ isHovered: false });
    };

    render() {
        const { theme, headerHeight, scrollbarStyles } = this.props;
        const { events } = this.state;

        return (
            <>
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
                    <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>Live Events</h3>
                    <span style={{ fontSize: '9px', color: theme === 'dark' ? '#8A9BA8' : '#5C7080' }}>
                        Real-time
                    </span>
                </div>
                <div
                    ref={this.scrollContainerRef}
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        overflowX: 'hidden' as const,
                        minHeight: 0,
                        ...scrollbarStyles
                    }}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                >
                    {events.map((event) => (
                        <div key={`event-${event.id}`} style={{
                            padding: '6px 8px',
                            borderBottom: `1px solid ${theme === 'dark' ? '#5C7080' : '#E1E8ED'}`,
                            fontSize: '10px',
                            cursor: 'pointer',
                            backgroundColor: event.id === this.eventsCounter ?
                                (theme === 'dark' ? '#2A3843' : '#F0F5F9') : 'transparent',
                            transition: 'background-color 0.2s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                    <span style={{
                                        padding: '1px 3px',
                                        backgroundColor: event.type === 'arbitrage' ? '#0F9D58' :
                                            event.type === 'liquidation' ? '#DB4437' :
                                                event.type === 'flash_loan' ? '#4285F4' : '#F4B400',
                                        color: 'white',
                                        borderRadius: '2px',
                                        fontSize: '7px',
                                        fontWeight: '600',
                                        minWidth: event.type === 'flash_loan' ? '40px' : '32px',
                                        textAlign: 'center'
                                    }}>
                                        {event.type.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span style={{
                                        fontSize: '8px',
                                        color: theme === 'dark' ? '#8A9BA8' : '#5C7080',
                                        minWidth: '38px'
                                    }}>
                                        {event.timestamp}
                                    </span>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: event.status === 'completed' ? '#0F9D58' :
                                            event.status === 'executing' ? '#F4B400' : '#4285F4',
                                        animation: event.status === 'executing' ? 'pulse 1.5s infinite' : 'none'
                                    }} />
                                </div>
                                <span style={{
                                    fontSize: '9px',
                                    fontWeight: '600',
                                    color: '#0F9D58'
                                }}>
                                    {event.profit}
                                </span>
                            </div>
                            <div style={{
                                fontWeight: '600',
                                marginBottom: '3px',
                                color: theme === 'dark' ? '#F5F8FA' : '#182026',
                                fontSize: '9px',
                                lineHeight: '1.2'
                            }}>
                                {event.description}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '8px',
                                    color: theme === 'dark' ? '#8A9BA8' : '#5C7080'
                                }}>
                                    {event.exchanges}
                                </span>
                                <span style={{
                                    fontSize: '8px',
                                    fontWeight: '600',
                                    color: theme === 'dark' ? '#F5F8FA' : '#182026'
                                }}>
                                    Size: {event.size}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }
}

export default EventsPanel;

