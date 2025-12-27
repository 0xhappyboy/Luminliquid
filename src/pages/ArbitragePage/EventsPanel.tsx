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

        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const headerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const hoverBg = theme === 'dark' ? '#2D323D' : '#F1F3F5';
        const newEventBg = theme === 'dark' ? '#2D323D' : '#F1F3F5';

        return (
            <>
                <div style={{
                    height: `${headerHeight}px`,
                    padding: '8px 12px',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                    backgroundColor: headerBg
                }}>
                    <h3 style={{ 
                        margin: 0, 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: textColor
                    }}>
                        Live Events
                    </h3>
                    <span style={{ 
                        fontSize: '9px', 
                        color: secondaryTextColor 
                    }}>
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
                            borderBottom: `1px solid ${borderColor}`,
                            fontSize: '10px',
                            cursor: 'pointer',
                            backgroundColor: event.id === this.eventsCounter ? newEventBg : 'transparent',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = hoverBg;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = event.id === this.eventsCounter ? newEventBg : 'transparent';
                        }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                    <span style={{
                                        padding: '1px 3px',
                                        backgroundColor: event.type === 'arbitrage' ? '#2E8B57' :
                                            event.type === 'liquidation' ? '#DC143C' :
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
                                        color: secondaryTextColor,
                                        minWidth: '38px'
                                    }}>
                                        {event.timestamp}
                                    </span>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: event.status === 'completed' ? '#2E8B57' :
                                            event.status === 'executing' ? '#F4B400' : '#4285F4',
                                        animation: event.status === 'executing' ? 'pulse 1.5s infinite' : 'none'
                                    }} />
                                </div>
                                <span style={{
                                    fontSize: '9px',
                                    fontWeight: '600',
                                    color: '#2E8B57'
                                }}>
                                    {event.profit}
                                </span>
                            </div>
                            <div style={{
                                fontWeight: '600',
                                marginBottom: '3px',
                                color: textColor,
                                fontSize: '9px',
                                lineHeight: '1.2'
                            }}>
                                {event.description}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '8px',
                                    color: secondaryTextColor
                                }}>
                                    {event.exchanges}
                                </span>
                                <span style={{
                                    fontSize: '8px',
                                    fontWeight: '600',
                                    color: textColor
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