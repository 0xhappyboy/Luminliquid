import React from 'react';
import { Card, Elevation, Button, HTMLTable, InputGroup, NumericInput, Slider, Tag, Checkbox, ProgressBar, Collapse, Icon } from '@blueprintjs/core';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ReactECharts from 'echarts-for-react';
import { themeManager } from '../../globals/theme/ThemeManager';
import { overflowManager } from '../../globals/theme/OverflowTypeManager';
import SortableSplit from './SortableSplit';

interface OrderLeg {
  id: string;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  filledQuantity: number;
  price: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  avgFillPrice: number;
  exchangeColor: string;
  timestamp: string;
}

interface OrderSplit {
  id: string;
  percentage: number;
  quantity: number;
  legs: OrderLeg[];
  status: 'draft' | 'submitted' | 'executing' | 'completed' | 'cancelled';
  parentOrderId: string;
  timestamp: string;
}

interface Exchange {
  name: string;
  color: string;
  latency: number;
  fee: number;
  availableBalance: number;
  filledOrders: number;
}

interface TradeRecord {
  id: string;
  parentOrderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  totalQuantity: number;
  totalValue: number;
  avgPrice: number;
  status: 'completed' | 'partial' | 'cancelled';
  timestamp: string;
  legs: OrderLeg[];
  profitLoss: number;
  profitLossPercentage: number;
  isExpanded: boolean;
}

interface OrderSplittingState {
  theme: 'dark' | 'light';
  totalQuantity: number;
  symbol: string;
  side: 'buy' | 'sell';
  splits: OrderSplit[];
  exchanges: Exchange[];
  price: number;
  activeId: string | null;
  selectedSplit: string | null;
  isDragging: boolean;
  containerHeight: number;
  expandedTrades: Set<string>;
  slippageTolerance: number;
  executionSpeed: number;
  containerWidth: number;
  showRightPanel: boolean;
}

class OrderSplitPage extends React.Component<{}, OrderSplittingState> {
  private unsubscribe: (() => void) | null = null;
  private containerRef = React.createRef<HTMLDivElement>();
  private tradeHistoryRef = React.createRef<HTMLDivElement>();
  private exchangeTableRef = React.createRef<HTMLDivElement>();
  private resizeObserver: ResizeObserver | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      theme: themeManager.getTheme(),
      totalQuantity: 1000,
      symbol: 'BTC/USDT',
      side: 'buy',
      price: 45000,
      activeId: null,
      selectedSplit: null,
      isDragging: false,
      containerHeight: 800,
      expandedTrades: new Set(),
      slippageTolerance: 0.5,
      executionSpeed: 50,
      containerWidth: 0,
      showRightPanel: true,
      splits: [
        {
          id: 'split-1',
          percentage: 40,
          quantity: 400,
          status: 'draft',
          parentOrderId: 'parent-1',
          timestamp: '2024-01-15 10:30:00',
          legs: [
            {
              id: 'leg-1-1',
              exchange: 'Binance',
              symbol: 'BTC/USDT',
              side: 'buy',
              quantity: 200,
              filledQuantity: 0,
              price: 44980,
              status: 'pending',
              avgFillPrice: 0,
              exchangeColor: '#F3BA2F',
              timestamp: '2024-01-15 10:30:01'
            },
            {
              id: 'leg-1-2',
              exchange: 'Coinbase',
              symbol: 'BTC/USDT',
              side: 'buy',
              quantity: 200,
              filledQuantity: 0,
              price: 45020,
              status: 'pending',
              avgFillPrice: 0,
              exchangeColor: '#0052FF',
              timestamp: '2024-01-15 10:30:02'
            }
          ]
        },
        {
          id: 'split-2',
          percentage: 35,
          quantity: 350,
          status: 'draft',
          parentOrderId: 'parent-1',
          timestamp: '2024-01-15 10:30:00',
          legs: [
            {
              id: 'leg-2-1',
              exchange: 'Kraken',
              symbol: 'BTC/USDT',
              side: 'buy',
              quantity: 350,
              filledQuantity: 0,
              price: 44990,
              status: 'pending',
              avgFillPrice: 0,
              exchangeColor: '#5521B5',
              timestamp: '2024-01-15 10:30:03'
            }
          ]
        }
      ],
      exchanges: [
        { name: 'Binance', color: '#F3BA2F', latency: 45, fee: 0.1, availableBalance: 25000, filledOrders: 1245 },
        { name: 'Coinbase', color: '#0052FF', latency: 65, fee: 0.25, availableBalance: 18000, filledOrders: 892 },
        { name: 'Kraken', color: '#5521B5', latency: 55, fee: 0.16, availableBalance: 15000, filledOrders: 567 },
        { name: 'FTX', color: '#02A6C2', latency: 35, fee: 0.07, availableBalance: 22000, filledOrders: 734 },
        { name: 'Bitfinex', color: '#4EA24C', latency: 75, fee: 0.2, availableBalance: 12000, filledOrders: 423 },
        { name: 'Huobi', color: '#0093E6', latency: 60, fee: 0.15, availableBalance: 19000, filledOrders: 678 }
      ]
    };
  }

  tradeRecords: TradeRecord[] = [
    {
      id: 'trade-1',
      parentOrderId: 'parent-1',
      symbol: 'BTC/USDT',
      side: 'buy',
      totalQuantity: 750,
      totalValue: 33750000,
      avgPrice: 45000,
      status: 'completed',
      timestamp: '2024-01-15 10:30:00',
      profitLoss: 12500,
      profitLossPercentage: 3.7,
      isExpanded: false,
      legs: [
        {
          id: 'leg-1-1',
          exchange: 'Binance',
          symbol: 'BTC/USDT',
          side: 'buy',
          quantity: 200,
          filledQuantity: 200,
          price: 44980,
          status: 'filled',
          avgFillPrice: 44975,
          exchangeColor: '#F3BA2F',
          timestamp: '2024-01-15 10:30:01'
        },
        {
          id: 'leg-1-2',
          exchange: 'Coinbase',
          symbol: 'BTC/USDT',
          side: 'buy',
          quantity: 200,
          filledQuantity: 200,
          price: 45020,
          status: 'filled',
          avgFillPrice: 45015,
          exchangeColor: '#0052FF',
          timestamp: '2024-01-15 10:30:02'
        },
        {
          id: 'leg-2-1',
          exchange: 'Kraken',
          symbol: 'BTC/USDT',
          side: 'buy',
          quantity: 350,
          filledQuantity: 350,
          price: 44990,
          status: 'filled',
          avgFillPrice: 44985,
          exchangeColor: '#5521B5',
          timestamp: '2024-01-15 10:30:03'
        }
      ]
    },
    {
      id: 'trade-2',
      parentOrderId: 'parent-2',
      symbol: 'ETH/USDT',
      side: 'sell',
      totalQuantity: 500,
      totalValue: 1250000,
      avgPrice: 2500,
      status: 'completed',
      timestamp: '2024-01-15 09:15:00',
      profitLoss: -8500,
      profitLossPercentage: -2.1,
      isExpanded: false,
      legs: [
        {
          id: 'leg-3-1',
          exchange: 'Binance',
          symbol: 'ETH/USDT',
          side: 'sell',
          quantity: 300,
          filledQuantity: 300,
          price: 2510,
          status: 'filled',
          avgFillPrice: 2508,
          exchangeColor: '#F3BA2F',
          timestamp: '2024-01-15 09:15:01'
        },
        {
          id: 'leg-3-2',
          exchange: 'FTX',
          symbol: 'ETH/USDT',
          side: 'sell',
          quantity: 200,
          filledQuantity: 200,
          price: 2485,
          status: 'filled',
          avgFillPrice: 2487,
          exchangeColor: '#02A6C2',
          timestamp: '2024-01-15 09:15:02'
        }
      ]
    },
    {
      id: 'trade-3',
      parentOrderId: 'parent-3',
      symbol: 'SOL/USDT',
      side: 'buy',
      totalQuantity: 1000,
      totalValue: 120000,
      avgPrice: 120,
      status: 'completed',
      timestamp: '2024-01-15 08:45:00',
      profitLoss: 3200,
      profitLossPercentage: 2.7,
      isExpanded: false,
      legs: [
        {
          id: 'leg-4-1',
          exchange: 'Binance',
          symbol: 'SOL/USDT',
          side: 'buy',
          quantity: 500,
          filledQuantity: 500,
          price: 119.5,
          status: 'filled',
          avgFillPrice: 119.3,
          exchangeColor: '#F3BA2F',
          timestamp: '2024-01-15 08:45:01'
        },
        {
          id: 'leg-4-2',
          exchange: 'Coinbase',
          symbol: 'SOL/USDT',
          side: 'buy',
          quantity: 500,
          filledQuantity: 500,
          price: 120.5,
          status: 'filled',
          avgFillPrice: 120.2,
          exchangeColor: '#0052FF',
          timestamp: '2024-01-15 08:45:02'
        }
      ]
    },
    {
      id: 'trade-4',
      parentOrderId: 'parent-4',
      symbol: 'ADA/USDT',
      side: 'sell',
      totalQuantity: 5000,
      totalValue: 25000,
      avgPrice: 5,
      status: 'completed',
      timestamp: '2024-01-14 16:20:00',
      profitLoss: -1200,
      profitLossPercentage: -4.8,
      isExpanded: false,
      legs: [
        {
          id: 'leg-5-1',
          exchange: 'Kraken',
          symbol: 'ADA/USDT',
          side: 'sell',
          quantity: 3000,
          filledQuantity: 3000,
          price: 5.1,
          status: 'filled',
          avgFillPrice: 5.08,
          exchangeColor: '#5521B5',
          timestamp: '2024-01-14 16:20:01'
        },
        {
          id: 'leg-5-2',
          exchange: 'Huobi',
          symbol: 'ADA/USDT',
          side: 'sell',
          quantity: 2000,
          filledQuantity: 2000,
          price: 4.9,
          status: 'filled',
          avgFillPrice: 4.92,
          exchangeColor: '#0093E6',
          timestamp: '2024-01-14 16:20:02'
        }
      ]
    },
    {
      id: 'trade-5',
      parentOrderId: 'parent-5',
      symbol: 'DOT/USDT',
      side: 'buy',
      totalQuantity: 800,
      totalValue: 56000,
      avgPrice: 70,
      status: 'completed',
      timestamp: '2024-01-14 14:10:00',
      profitLoss: 1800,
      profitLossPercentage: 3.2,
      isExpanded: false,
      legs: [
        {
          id: 'leg-6-1',
          exchange: 'Bitfinex',
          symbol: 'DOT/USDT',
          side: 'buy',
          quantity: 400,
          filledQuantity: 400,
          price: 69.5,
          status: 'filled',
          avgFillPrice: 69.3,
          exchangeColor: '#4EA24C',
          timestamp: '2024-01-14 14:10:01'
        },
        {
          id: 'leg-6-2',
          exchange: 'FTX',
          symbol: 'DOT/USDT',
          side: 'buy',
          quantity: 400,
          filledQuantity: 400,
          price: 70.5,
          status: 'filled',
          avgFillPrice: 70.2,
          exchangeColor: '#02A6C2',
          timestamp: '2024-01-14 14:10:02'
        }
      ]
    },
    {
      id: 'trade-6',
      parentOrderId: 'parent-6',
      symbol: 'LINK/USDT',
      side: 'sell',
      totalQuantity: 1200,
      totalValue: 18000,
      avgPrice: 15,
      status: 'completed',
      timestamp: '2024-01-14 11:30:00',
      profitLoss: 950,
      profitLossPercentage: 5.3,
      isExpanded: false,
      legs: [
        {
          id: 'leg-7-1',
          exchange: 'Binance',
          symbol: 'LINK/USDT',
          side: 'sell',
          quantity: 600,
          filledQuantity: 600,
          price: 15.2,
          status: 'filled',
          avgFillPrice: 15.1,
          exchangeColor: '#F3BA2F',
          timestamp: '2024-01-14 11:30:01'
        },
        {
          id: 'leg-7-2',
          exchange: 'Coinbase',
          symbol: 'LINK/USDT',
          side: 'sell',
          quantity: 600,
          filledQuantity: 600,
          price: 14.8,
          status: 'filled',
          avgFillPrice: 14.9,
          exchangeColor: '#0052FF',
          timestamp: '2024-01-14 11:30:02'
        }
      ]
    },
    {
      id: 'trade-7',
      parentOrderId: 'parent-7',
      symbol: 'BNB/USDT',
      side: 'buy',
      totalQuantity: 200,
      totalValue: 60000,
      avgPrice: 300,
      status: 'completed',
      timestamp: '2024-01-14 10:15:00',
      profitLoss: 1500,
      profitLossPercentage: 2.5,
      isExpanded: false,
      legs: [
        {
          id: 'leg-8-1',
          exchange: 'Binance',
          symbol: 'BNB/USDT',
          side: 'buy',
          quantity: 200,
          filledQuantity: 200,
          price: 299.5,
          status: 'filled',
          avgFillPrice: 299.2,
          exchangeColor: '#F3BA2F',
          timestamp: '2024-01-14 10:15:01'
        }
      ]
    },
    {
      id: 'trade-8',
      parentOrderId: 'parent-8',
      symbol: 'XRP/USDT',
      side: 'sell',
      totalQuantity: 5000,
      totalValue: 3000,
      avgPrice: 0.6,
      status: 'completed',
      timestamp: '2024-01-14 09:45:00',
      profitLoss: -200,
      profitLossPercentage: -6.7,
      isExpanded: false,
      legs: [
        {
          id: 'leg-9-1',
          exchange: 'Kraken',
          symbol: 'XRP/USDT',
          side: 'sell',
          quantity: 3000,
          filledQuantity: 3000,
          price: 0.61,
          status: 'filled',
          avgFillPrice: 0.608,
          exchangeColor: '#5521B5',
          timestamp: '2024-01-14 09:45:01'
        },
        {
          id: 'leg-9-2',
          exchange: 'Coinbase',
          symbol: 'XRP/USDT',
          side: 'sell',
          quantity: 2000,
          filledQuantity: 2000,
          price: 0.59,
          status: 'filled',
          avgFillPrice: 0.592,
          exchangeColor: '#0052FF',
          timestamp: '2024-01-14 09:45:02'
        }
      ]
    },
    {
      id: 'trade-9',
      parentOrderId: 'parent-9',
      symbol: 'MATIC/USDT',
      side: 'buy',
      totalQuantity: 3000,
      totalValue: 2700,
      avgPrice: 0.9,
      status: 'completed',
      timestamp: '2024-01-14 08:30:00',
      profitLoss: 180,
      profitLossPercentage: 6.7,
      isExpanded: false,
      legs: [
        {
          id: 'leg-10-1',
          exchange: 'Binance',
          symbol: 'MATIC/USDT',
          side: 'buy',
          quantity: 1500,
          filledQuantity: 1500,
          price: 0.89,
          status: 'filled',
          avgFillPrice: 0.888,
          exchangeColor: '#F3BA2F',
          timestamp: '2024-01-14 08:30:01'
        },
        {
          id: 'leg-10-2',
          exchange: 'FTX',
          symbol: 'MATIC/USDT',
          side: 'buy',
          quantity: 1500,
          filledQuantity: 1500,
          price: 0.91,
          status: 'filled',
          avgFillPrice: 0.908,
          exchangeColor: '#02A6C2',
          timestamp: '2024-01-14 08:30:02'
        }
      ]
    },
    {
      id: 'trade-10',
      parentOrderId: 'parent-10',
      symbol: 'AVAX/USDT',
      side: 'sell',
      totalQuantity: 400,
      totalValue: 12000,
      avgPrice: 30,
      status: 'completed',
      timestamp: '2024-01-13 17:20:00',
      profitLoss: 600,
      profitLossPercentage: 5.0,
      isExpanded: false,
      legs: [
        {
          id: 'leg-11-1',
          exchange: 'Kraken',
          symbol: 'AVAX/USDT',
          side: 'sell',
          quantity: 400,
          filledQuantity: 400,
          price: 30.2,
          status: 'filled',
          avgFillPrice: 30.1,
          exchangeColor: '#5521B5',
          timestamp: '2024-01-13 17:20:01'
        }
      ]
    }
  ];

  componentDidMount() {
    this.unsubscribe = themeManager.subscribe((theme) => {
      this.setState({ theme });
    });
    overflowManager.setOverflow('hidden');
    this.updateContainerHeight();
    this.updateContainerWidth();
    window.addEventListener('resize', this.updateContainerHeight);
    window.addEventListener('resize', this.updateContainerWidth);

    if (this.containerRef.current && this.containerRef.current.parentElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateContainerHeight();
        this.updateContainerWidth();
      });
      this.resizeObserver.observe(this.containerRef.current.parentElement);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('resize', this.updateContainerHeight);
    window.removeEventListener('resize', this.updateContainerWidth);
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

  getScrollbarStyles = () => {
    const { theme } = this.state;
    const trackColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
    const thumbColor = theme === 'dark' ? '#5A6270' : '#C4C9D1';
    const thumbHoverColor = theme === 'dark' ? '#767E8C' : '#A8AFB8';

    return {
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
      scrollbarWidth: 'thin' as const,
      scrollbarColor: `${thumbColor} ${trackColor}`
    };
  };

  formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      this.setState({ activeId: null, isDragging: false });
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const oldIndex = this.state.splits.findIndex(split => split.id === activeId);
    const newIndex = this.state.splits.findIndex(split => split.id === overId);

    if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
      const newSplits = [...this.state.splits];
      const [movedSplit] = newSplits.splice(oldIndex, 1);
      newSplits.splice(newIndex, 0, movedSplit);
      this.setState({ splits: newSplits });
    }

    this.setState({ activeId: null, isDragging: false });
  };

  handleDragStart = (id: string) => {
    this.setState({ activeId: id, isDragging: true });
  };

  handleDragEndLocal = () => {
    this.setState({ isDragging: false });
  };

  handleSlippageChange = (value: number) => {
    this.setState({ slippageTolerance: value });
  };

  handleExecutionSpeedChange = (value: number) => {
    this.setState({ executionSpeed: value });
  };

  addLegToSplit = (splitId: string, exchange: Exchange) => {
    const { splits } = this.state;
    const splitIndex = splits.findIndex(s => s.id === splitId);
    if (splitIndex === -1) return;

    const split = splits[splitIndex];
    const newLeg: OrderLeg = {
      id: `leg-${Date.now()}`,
      exchange: exchange.name,
      symbol: this.state.symbol,
      side: this.state.side,
      quantity: 50,
      filledQuantity: 0,
      price: this.state.price * (1 + (Math.random() - 0.5) * 0.001),
      status: 'pending',
      avgFillPrice: 0,
      exchangeColor: exchange.color,
      timestamp: new Date().toISOString()
    };

    const newSplits = [...splits];
    newSplits[splitIndex] = {
      ...split,
      legs: [...split.legs, newLeg]
    };

    this.setState({ splits: newSplits });
  };

  removeLeg = (splitId: string, legId: string) => {
    const { splits } = this.state;
    const splitIndex = splits.findIndex(s => s.id === splitId);
    if (splitIndex === -1) return;

    const split = splits[splitIndex];
    const legIndex = split.legs.findIndex(l => l.id === legId);
    if (legIndex === -1) return;

    const legToRemove = split.legs[legIndex];
    const newLegs = split.legs.filter(l => l.id !== legId);

    const newQuantity = split.quantity - legToRemove.quantity;
    const newPercentage = (newQuantity / this.state.totalQuantity) * 100;

    const newSplits = [...splits];
    newSplits[splitIndex] = {
      ...split,
      quantity: newQuantity,
      percentage: newPercentage,
      legs: newLegs
    };

    this.setState({ splits: newSplits });
  };

  updateLegQuantity = (splitId: string, legId: string, quantity: number) => {
    const { splits } = this.state;
    const splitIndex = splits.findIndex(s => s.id === splitId);
    if (splitIndex === -1) return;

    const split = splits[splitIndex];
    const legIndex = split.legs.findIndex(l => l.id === legId);
    if (legIndex === -1) return;

    const oldQuantity = split.legs[legIndex].quantity;
    const quantityDiff = quantity - oldQuantity;

    const newLegs = [...split.legs];
    newLegs[legIndex] = {
      ...newLegs[legIndex],
      quantity
    };

    const newQuantity = split.quantity + quantityDiff;
    const newPercentage = (newQuantity / this.state.totalQuantity) * 100;

    const newSplits = [...splits];
    newSplits[splitIndex] = {
      ...split,
      quantity: newQuantity,
      percentage: newPercentage,
      legs: newLegs
    };

    this.setState({ splits: newSplits });
  };

  executeSplit = (splitId: string) => {
    const { splits } = this.state;
    const splitIndex = splits.findIndex(s => s.id === splitId);
    if (splitIndex === -1) return;

    const split = splits[splitIndex];
    const newLegs = split.legs.map(leg => ({
      ...leg,
      status: 'filled' as const,
      filledQuantity: leg.quantity,
      avgFillPrice: leg.price * (1 + (Math.random() - 0.5) * 0.0005)
    }));

    const newSplits = [...splits];
    newSplits[splitIndex] = {
      ...split,
      status: 'completed',
      legs: newLegs
    };

    this.setState({ splits: newSplits });
  };

  toggleTradeExpanded = (tradeId: string) => {
    const newExpanded = new Set(this.state.expandedTrades);
    if (newExpanded.has(tradeId)) {
      newExpanded.delete(tradeId);
    } else {
      newExpanded.add(tradeId);
    }
    this.setState({ expandedTrades: newExpanded });
  };

  getStatusColor = (status: string): string => {
    switch (status) {
      case 'filled':
      case 'completed': return '#2E8B57';
      case 'partial': return '#FFA500';
      case 'pending': return '#1E90FF';
      case 'cancelled': return '#DC143C';
      default: return '#8F99A8';
    }
  };

  getSideColor = (side: 'buy' | 'sell'): string => {
    return side === 'buy' ? '#2E8B57' : '#DC143C';
  };

  renderExchangePanel = () => {
    const { theme, exchanges, selectedSplit } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const headerBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const rowBg = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const rowHoverBg = theme === 'dark' ? '#2D323D' : '#F8F9FA';

    const exchangeScrollbarStyles = `
        .exchange-table-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .exchange-table-scroll::-webkit-scrollbar-track {
            background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
            border-radius: 3px;
        }
        .exchange-table-scroll::-webkit-scrollbar-thumb {
            background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
            border-radius: 3px;
        }
        .exchange-table-scroll::-webkit-scrollbar-thumb:hover {
            background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
        }
    `;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '200px' }}>
        <style>{exchangeScrollbarStyles}</style>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: textColor,
          paddingLeft: '12px'
        }}>
          Available Exchanges
        </h4>
        <div
          ref={this.exchangeTableRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${borderColor}`,
            borderRadius: '0px',
            overflow: 'hidden',
            backgroundColor: rowBg
          }}
        >
          <div style={{
            flexShrink: 0,
            backgroundColor: headerBg,
            borderBottom: `1px solid ${borderColor}`
          }}>
            <HTMLTable compact style={{ width: '100%', fontSize: '11px', margin: 0 }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: textColor,
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: headerBg
                  }}>
                    Exchange
                  </th>
                  <th style={{
                    padding: '8px',
                    textAlign: 'right',
                    color: textColor,
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: headerBg
                  }}>
                    Latency
                  </th>
                  <th style={{
                    padding: '8px',
                    textAlign: 'right',
                    color: textColor,
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: headerBg
                  }}>
                    Fee
                  </th>
                  <th style={{
                    padding: '8px',
                    textAlign: 'center',
                    color: textColor,
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: headerBg
                  }}>
                    Action
                  </th>
                </tr>
              </thead>
            </HTMLTable>
          </div>

          <div
            style={{
              flex: 1,
              overflow: 'auto'
            }}
            className="exchange-table-scroll"
          >
            <HTMLTable compact style={{ width: '100%', fontSize: '11px', margin: 0 }}>
              <tbody>
                {exchanges.map((exchange) => (
                  <tr
                    key={exchange.name}
                    style={{
                      borderBottom: `1px solid ${borderColor}`,
                      backgroundColor: rowBg,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = rowHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = rowBg;
                    }}
                  >
                    <td style={{ padding: '6px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: exchange.color
                          }}
                        />
                        <span style={{ fontWeight: '600', color: textColor, fontSize: '11px' }}>
                          {exchange.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: textColor, fontSize: '11px' }}>
                      {exchange.latency}ms
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: textColor, fontSize: '11px' }}>
                      {exchange.fee}%
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <Button
                        small
                        minimal
                        text="Add"
                        style={{ fontSize: '10px', padding: '2px 6px', height: '20px' }}
                        onClick={() => selectedSplit && this.addLegToSplit(selectedSplit, exchange)}
                        disabled={!selectedSplit}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </HTMLTable>
          </div>
        </div>
      </div>
    );
  };

  renderTradeRecords = () => {
    const { theme, expandedTrades } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const rowBg = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const rowHoverBg = theme === 'dark' ? '#2D323D' : '#F8F9FA';
    const expandedBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';

    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: textColor,
          paddingLeft: '12px'
        }}>
          Trade History
        </h4>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${borderColor}`,
            borderRadius: '0px',
            overflow: 'hidden',
            backgroundColor: rowBg
          }}
        >
          <div style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0
          }}
            className="custom-scrollbar"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              margin: 0,
              padding: 0
            }}>
              {this.tradeRecords.map((trade) => (
                <div
                  key={trade.id}
                  style={{
                    backgroundColor: rowBg,
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    margin: 0,
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!expandedTrades.has(trade.id)) {
                      e.currentTarget.style.backgroundColor = rowHoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!expandedTrades.has(trade.id)) {
                      e.currentTarget.style.backgroundColor = rowBg;
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      minHeight: '40px',
                      margin: 0,
                      backgroundColor: expandedTrades.has(trade.id) ? expandedBg : 'transparent'
                    }}
                    onClick={() => this.toggleTradeExpanded(trade.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, margin: 0 }}>
                      <Icon
                        icon={expandedTrades.has(trade.id) ? "chevron-down" : "chevron-right"}
                        size={12}
                        color={textColor}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, margin: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, minWidth: '70px', margin: 0 }}>
                          {trade.symbol}
                        </div>
                        <Tag
                          minimal
                          style={{
                            fontSize: '9px',
                            padding: '2px 4px',
                            color: this.getSideColor(trade.side),
                            margin: 0,
                            backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                            border: `1px solid ${theme === 'dark' ? '#3A4250' : '#E1E5E9'}`
                          }}
                        >
                          {trade.side.toUpperCase()}
                        </Tag>
                        <div style={{ fontSize: '10px', color: textColor, margin: 0 }}>
                          {trade.totalQuantity} @ {this.formatNumber(trade.avgPrice)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: trade.profitLoss >= 0 ? '#2E8B57' : '#DC143C',
                        minWidth: '70px',
                        textAlign: 'right',
                        margin: 0
                      }}>
                        {trade.profitLoss >= 0 ? '+' : ''}{this.formatCurrency(trade.profitLoss)}
                      </div>
                      <Tag
                        minimal
                        style={{
                          fontSize: '9px',
                          padding: '2px 4px',
                          color: this.getStatusColor(trade.status),
                          margin: 0,
                          backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                          border: `1px solid ${theme === 'dark' ? '#3A4250' : '#E1E5E9'}`
                        }}
                      >
                        {trade.status.toUpperCase()}
                      </Tag>
                    </div>
                  </div>

                  <Collapse isOpen={expandedTrades.has(trade.id)}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: expandedBg,
                      borderTop: `1px solid ${borderColor}`,
                      margin: 0
                    }}>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: textColor,
                        margin: 0,
                        marginBottom: '5px',
                      }}>
                        Sub-Orders ({trade.legs.length})
                      </div>
                      {trade.legs.map((leg) => (
                        <div
                          key={leg.id}
                          style={{
                            padding: '6px',
                            backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                            borderLeft: `3px solid ${leg.exchangeColor}`,
                            marginBottom: '4px',
                            borderRadius: '0px',
                            border: `1px solid ${borderColor}`,
                            margin: '0 0 4px 0'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                              <div style={{ fontSize: '9px', fontWeight: '600', color: textColor, minWidth: '60px', margin: 0 }}>
                                {leg.exchange}
                              </div>
                              <div style={{ fontSize: '9px', color: textColor, margin: 0 }}>
                                {leg.filledQuantity}/{leg.quantity}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                              <div style={{ fontSize: '9px', color: textColor, margin: 0 }}>
                                Avg: ${leg.avgFillPrice.toFixed(2)}
                              </div>
                              <Tag
                                minimal
                                style={{
                                  fontSize: '8px',
                                  padding: '1px 3px',
                                  color: this.getStatusColor(leg.status),
                                  margin: 0,
                                  backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                                  border: `1px solid ${theme === 'dark' ? '#3A4250' : '#E1E5E9'}`
                                }}
                              >
                                {leg.status.toUpperCase()}
                              </Tag>
                            </div>
                          </div>
                          <div style={{ fontSize: '8px', color: theme === 'dark' ? '#8F99A8' : '#5F6B7C', marginTop: '2px', margin: 0 }}>
                            Time: {leg.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderStatsPanel = () => {
    const { theme } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const cardBg = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const mutedTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
    const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';

    const statsData = {
      totalTrades: 156,
      successRate: 87.2,
      avgProfit: 2.4,
      totalVolume: 4520000,
      activeOrders: 8,
      completedToday: 23
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '140px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: textColor,
          paddingLeft: '12px'
        }}>
          Trading Statistics
        </h4>
        <div
          style={{
            flex: 1,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '0px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: mutedTextColor }}>Total Trades</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: textColor }}>{statsData.totalTrades}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: mutedTextColor }}>Success Rate</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#2E8B57' }}>{statsData.successRate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: mutedTextColor }}>Avg Profit</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#2E8B57' }}>+{statsData.avgProfit}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: mutedTextColor }}>Total Volume</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: textColor }}>${(statsData.totalVolume / 1000000).toFixed(1)}M</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: mutedTextColor }}>Active Orders</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: textColor }}>{statsData.activeOrders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: mutedTextColor }}>Completed Today</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: textColor }}>{statsData.completedToday}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: mutedTextColor }}>Performance Score</span>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#2E8B57' }}>Excellent</span>
            </div>
            <ProgressBar
              value={0.87}
              intent="success"
              style={{ height: '4px', marginBottom: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: mutedTextColor }}>
              <span>Latency: 45ms</span>
              <span>Fill Rate: 98.3%</span>
              <span>Accuracy: 95.7%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderLeftPanel = () => {
    const { theme, splits, totalQuantity, showRightPanel } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';

    return (
      <div style={{
        flex: showRightPanel ? '0 0 55%' : '1',
        minWidth: showRightPanel ? '600px' : '800px',
        maxWidth: showRightPanel ? '55%' : '100%',
        borderRight: showRightPanel ? `1px solid ${borderColor}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor
      }}>
        <div style={{
          padding: '12px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          backgroundColor
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: textColor
          }}>
            Order Splits
            {!showRightPanel && (
              <span style={{
                fontSize: '11px',
                color: theme === 'dark' ? '#8F99A8' : '#5F6B7C',
                marginLeft: '8px'
              }}>
              </span>
            )}
          </h2>
          <div style={{ fontSize: '10px', color: textColor }}>
            Total: {splits.reduce((sum, split) => sum + split.quantity, 0)} / {totalQuantity}
          </div>
        </div>

        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '8px',
          backgroundColor
        }}>
          <DndContext onDragEnd={this.handleDragEnd}>
            <SortableContext items={splits.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div>
                {splits.map((split, index) => (
                  <SortableSplit
                    key={split.id}
                    split={split}
                    index={index}
                    theme={theme}
                    selectedSplit={this.state.selectedSplit}
                    onSelect={(id) => this.setState({ selectedSplit: id })}
                    onRemoveLeg={this.removeLeg}
                    onExecuteSplit={this.executeSplit}
                    onLegQuantityChange={this.updateLegQuantity}
                    onDragStart={this.handleDragStart}
                    onDragEnd={this.handleDragEndLocal}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    );
  };

  renderMiddlePanel = () => {
    const { theme, selectedSplit, slippageTolerance, executionSpeed, splits } = this.state;
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';

    return (
      <div style={{
        flex: '0 0 25%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${borderColor}`,
        height: '100%',
        overflow: 'hidden',
        backgroundColor
      }}>
        <div style={{
          padding: '12px',
          borderBottom: `1px solid ${borderColor}`,
          paddingLeft: '0px',
          paddingRight: '0px',
          paddingBottom: '0px',
          backgroundColor
        }}>
          {this.renderExchangePanel()}
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          backgroundColor
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: textColor
          }}>
            Execution Parameters
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{
                fontSize: '10px',
                marginBottom: '4px',
                display: 'block',
                color: textColor
              }}>
                Slippage Tolerance: {slippageTolerance}%
              </label>
              <Slider
                min={0}
                max={2}
                stepSize={0.1}
                value={slippageTolerance}
                onChange={this.handleSlippageChange}
                labelStepSize={0.5}
                showTrackFill={false}
              />
            </div>
            <div>
              <label style={{
                fontSize: '10px',
                marginBottom: '4px',
                display: 'block',
                color: textColor
              }}>
                Execution Speed: {executionSpeed}%
              </label>
              <Slider
                min={0}
                max={100}
                stepSize={10}
                value={executionSpeed}
                onChange={this.handleExecutionSpeedChange}
                labelStepSize={50}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Checkbox
                label="Post Only"
                style={{ fontSize: '10px', color: textColor, margin: 0 }}
              />
              <Checkbox
                label="Reduce Only"
                style={{ fontSize: '10px', color: textColor, margin: 0 }}
              />
              <Checkbox
                label="Iceberg Order"
                style={{ fontSize: '10px', color: textColor, margin: 0 }}
              />
            </div>
            <Button
              intent="primary"
              text="Execute All Splits"
              style={{ fontSize: '10px', height: '28px' }}
              onClick={() => splits.forEach(split => this.executeSplit(split.id))}
            />
          </div>
        </div>
      </div>
    );
  };

  renderRightPanel = () => {
    const { theme, containerHeight } = this.state;
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';

    return (
      <div style={{
        flex: '0 0 20%',
        display: 'flex',
        flexDirection: 'column',
        height: containerHeight || '100vh',
        overflow: 'hidden',
        backgroundColor
      }}>
        <div style={{
          flex: '0 0 40%',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          borderBottom: `1px solid ${borderColor}`,
          overflow: 'hidden',
          paddingLeft: '0px',
          paddingRight: '0px',
          paddingBottom: '0px',
          backgroundColor
        }}>
          {this.renderStatsPanel()}
        </div>

        <div style={{
          flex: '0 0 60%',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          overflow: 'hidden',
          paddingLeft: '0px',
          paddingRight: '0px',
          paddingBottom: '0px',
          backgroundColor
        }}>
          {this.renderTradeRecords()}
        </div>
      </div>
    );
  };

  render() {
    const { theme, containerHeight, showRightPanel } = this.state;
    const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    overflowManager.setOverflow('hidden');

    const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: ${theme === 'dark' ? '#5A6270 #1A1D24' : '#C4C9D1 #F8F9FA'};
    }
  `;

    return (
      <div
        ref={this.containerRef}
        style={{
          padding: '0',
          backgroundColor: backgroundColor,
          minHeight: '100vh',
          color: textColor,
          display: 'flex',
          height: containerHeight || '100vh',
          minWidth: '800px',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        <style>{scrollbarStyles}</style>

        {this.renderLeftPanel()}
        {this.renderMiddlePanel()}
        {showRightPanel && this.renderRightPanel()}
      </div>
    );
  }
}

export default OrderSplitPage;