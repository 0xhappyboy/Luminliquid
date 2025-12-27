import React from "react";
import {
  Icon,
  Spinner,
  Dialog
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";

interface NetworkStatusPageIndexProps {
  children?: React.ReactNode;
}

interface NetworkStatusPageIndexState {
  theme: 'dark' | 'light';
  containerHeight: number;
  selectedNetwork: string;
  currentTime: number;
  isSidebarCollapsed: boolean;
  selectedBlock: BlockInfo | null;
  isBlockDialogOpen: boolean;
}

interface BlockInfo {
  height: number;
  hash: string;
  timestamp: number;
  transactions: number;
  validator: string;
  size: number;
  gasUsed?: number;
  gasLimit?: number;
  rewards?: number;
  parentHash: string;
  stateRoot: string;
  receiptsRoot: string;
  miner?: string;
  difficulty?: number;
  totalDifficulty?: number;
  extraData: string;
  nonce: string;
  baseFeePerGas?: number;
  burntFees?: number;
}

interface NetworkStatus {
  name: string;
  chainId: string;
  blockHeight: number;
  blockTime: number;
  totalTransactions: number;
  activeValidators: number;
  totalStaked: number;
  inflationRate: number;
  bondedTokens: number;
  communityPool: number;
  latestBlocks: BlockInfo[];
  status: 'online' | 'offline' | 'syncing';
  latency: number;
  version: string;
  peers: number;
  uptime: number;
  marketCap: number;
  tokenPrice: number;
  dailyVolume: number;
  hashrate: string;
  difficulty: number;
  avgBlockSize: number;
  pendingTransactions: number;
  governanceProposals: number;
  smartContracts: number;
  decentralizedApps: number;
  totalSupply: number;
  circulatingSupply: number;
}

class NetworkStatusPageIndex extends React.Component<NetworkStatusPageIndexProps, NetworkStatusPageIndexState> {
  private unsubscribe: (() => void) | null = null;
  private containerRef: React.RefObject<HTMLDivElement | null>;
  private resizeObserver: ResizeObserver | null = null;
  private blockUpdateInterval: NodeJS.Timeout | null = null;
  private timeInterval: NodeJS.Timeout | null = null;

  private networks: { [key: string]: NetworkStatus } = {
    'kasplex': {
      name: 'Kasplex',
      chainId: 'kasplex-1',
      blockHeight: 374033085,
      blockTime: 2,
      totalTransactions: 25658288,
      activeValidators: 150,
      totalStaked: 2450000000,
      inflationRate: 0.08,
      bondedTokens: 0.68,
      communityPool: 4500000,
      latestBlocks: [],
      status: 'online',
      latency: 45,
      version: 'v0.9.1',
      peers: 89,
      uptime: 99.98,
      marketCap: 28500000000,
      tokenPrice: 0.125,
      dailyVolume: 450000000,
      hashrate: '845.2 TH/s',
      difficulty: 15478239,
      avgBlockSize: 86542,
      pendingTransactions: 1245,
      governanceProposals: 12,
      smartContracts: 4567,
      decentralizedApps: 234,
      totalSupply: 28000000000,
      circulatingSupply: 22800000000
    },
    'ethereum': {
      name: 'Ethereum',
      chainId: '1',
      blockHeight: 18456789,
      blockTime: 12,
      totalTransactions: 2156789123,
      activeValidators: 895623,
      totalStaked: 31245678,
      inflationRate: 0.005,
      bondedTokens: 0.72,
      communityPool: 123456,
      latestBlocks: [],
      status: 'online',
      latency: 120,
      version: 'v1.12.0',
      peers: 4500,
      uptime: 99.99,
      marketCap: 385000000000,
      tokenPrice: 3200.45,
      dailyVolume: 12500000000,
      hashrate: '958.7 PH/s',
      difficulty: 15478239654,
      avgBlockSize: 95623,
      pendingTransactions: 45678,
      governanceProposals: 8,
      smartContracts: 456789,
      decentralizedApps: 4567,
      totalSupply: 120000000,
      circulatingSupply: 118000000
    },
    'solana': {
      name: 'Solana',
      chainId: 'mainnet-beta',
      blockHeight: 245678123,
      blockTime: 0.4,
      totalTransactions: 4567891234,
      activeValidators: 2345,
      totalStaked: 412345678,
      inflationRate: 0.055,
      bondedTokens: 0.75,
      communityPool: 5678901,
      latestBlocks: [],
      status: 'online',
      latency: 85,
      version: 'v1.17.0',
      peers: 1800,
      uptime: 99.85,
      marketCap: 125000000000,
      tokenPrice: 145.67,
      dailyVolume: 3500000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 123456,
      pendingTransactions: 23456,
      governanceProposals: 15,
      smartContracts: 23456,
      decentralizedApps: 1234,
      totalSupply: 568000000,
      circulatingSupply: 421000000
    },
    'bnb-chain': {
      name: 'BNB Chain',
      chainId: '56',
      blockHeight: 34567890,
      blockTime: 3,
      totalTransactions: 456789012,
      activeValidators: 41,
      totalStaked: 56789012,
      inflationRate: 0.035,
      bondedTokens: 0.82,
      communityPool: 234567,
      latestBlocks: [],
      status: 'online',
      latency: 65,
      version: 'v1.2.5',
      peers: 1200,
      uptime: 99.97,
      marketCap: 89000000000,
      tokenPrice: 580.23,
      dailyVolume: 1800000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 75643,
      pendingTransactions: 7890,
      governanceProposals: 6,
      smartContracts: 123456,
      decentralizedApps: 567,
      totalSupply: 157000000,
      circulatingSupply: 153000000
    },
    'base': {
      name: 'Base',
      chainId: '8453',
      blockHeight: 5678901,
      blockTime: 2,
      totalTransactions: 234567890,
      activeValidators: 0,
      totalStaked: 0,
      inflationRate: 0,
      bondedTokens: 0,
      communityPool: 0,
      latestBlocks: [],
      status: 'online',
      latency: 95,
      version: 'L2',
      peers: 650,
      uptime: 99.96,
      marketCap: 0,
      tokenPrice: 0,
      dailyVolume: 450000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 65432,
      pendingTransactions: 3456,
      governanceProposals: 3,
      smartContracts: 34567,
      decentralizedApps: 289,
      totalSupply: 0,
      circulatingSupply: 0
    },
    'arbitrum': {
      name: 'Arbitrum',
      chainId: '42161',
      blockHeight: 12345678,
      blockTime: 0.25,
      totalTransactions: 567890123,
      activeValidators: 0,
      totalStaked: 0,
      inflationRate: 0,
      bondedTokens: 0,
      communityPool: 0,
      latestBlocks: [],
      status: 'online',
      latency: 75,
      version: 'Nitro',
      peers: 850,
      uptime: 99.98,
      marketCap: 0,
      tokenPrice: 0,
      dailyVolume: 890000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 71234,
      pendingTransactions: 5678,
      governanceProposals: 5,
      smartContracts: 67890,
      decentralizedApps: 456,
      totalSupply: 0,
      circulatingSupply: 0
    },
    'polygon': {
      name: 'Polygon',
      chainId: '137',
      blockHeight: 45678901,
      blockTime: 2,
      totalTransactions: 345678901,
      activeValidators: 100,
      totalStaked: 23456789,
      inflationRate: 0.02,
      bondedTokens: 0.65,
      communityPool: 1234567,
      latestBlocks: [],
      status: 'online',
      latency: 80,
      version: 'v0.4.3',
      peers: 950,
      uptime: 99.95,
      marketCap: 85000000000,
      tokenPrice: 0.85,
      dailyVolume: 650000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 68901,
      pendingTransactions: 2345,
      governanceProposals: 7,
      smartContracts: 234567,
      decentralizedApps: 789,
      totalSupply: 10000000000,
      circulatingSupply: 9200000000
    },
    'avalanche': {
      name: 'Avalanche',
      chainId: '43114',
      blockHeight: 34567890,
      blockTime: 2,
      totalTransactions: 234567890,
      activeValidators: 1200,
      totalStaked: 34567890,
      inflationRate: 0.045,
      bondedTokens: 0.78,
      communityPool: 2345678,
      latestBlocks: [],
      status: 'online',
      latency: 70,
      version: 'v1.9.0',
      peers: 1100,
      uptime: 99.97,
      marketCap: 12000000000,
      tokenPrice: 12.34,
      dailyVolume: 350000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 71234,
      pendingTransactions: 1567,
      governanceProposals: 4,
      smartContracts: 123456,
      decentralizedApps: 456,
      totalSupply: 720000000,
      circulatingSupply: 360000000
    },
    'optimism': {
      name: 'Optimism',
      chainId: '10',
      blockHeight: 67890123,
      blockTime: 2,
      totalTransactions: 456789012,
      activeValidators: 0,
      totalStaked: 0,
      inflationRate: 0,
      bondedTokens: 0,
      communityPool: 0,
      latestBlocks: [],
      status: 'online',
      latency: 85,
      version: 'Bedrock',
      peers: 720,
      uptime: 99.96,
      marketCap: 0,
      tokenPrice: 0,
      dailyVolume: 780000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 64532,
      pendingTransactions: 2890,
      governanceProposals: 2,
      smartContracts: 56789,
      decentralizedApps: 234,
      totalSupply: 0,
      circulatingSupply: 0
    },
    'fantom': {
      name: 'Fantom',
      chainId: '250',
      blockHeight: 56789012,
      blockTime: 1,
      totalTransactions: 345678901,
      activeValidators: 60,
      totalStaked: 45678901,
      inflationRate: 0.025,
      bondedTokens: 0.71,
      communityPool: 987654,
      latestBlocks: [],
      status: 'online',
      latency: 55,
      version: 'v1.2.0',
      peers: 480,
      uptime: 99.93,
      marketCap: 850000000,
      tokenPrice: 0.25,
      dailyVolume: 120000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 53421,
      pendingTransactions: 890,
      governanceProposals: 5,
      smartContracts: 78901,
      decentralizedApps: 345,
      totalSupply: 3175000000,
      circulatingSupply: 2540000000
    },
    'cosmos': {
      name: 'Cosmos',
      chainId: 'cosmoshub-4',
      blockHeight: 14567890,
      blockTime: 6,
      totalTransactions: 123456789,
      activeValidators: 175,
      totalStaked: 234567890,
      inflationRate: 0.07,
      bondedTokens: 0.63,
      communityPool: 3456789,
      latestBlocks: [],
      status: 'online',
      latency: 95,
      version: 'v0.45.0',
      peers: 350,
      uptime: 99.99,
      marketCap: 3800000000,
      tokenPrice: 8.45,
      dailyVolume: 85000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 45678,
      pendingTransactions: 234,
      governanceProposals: 9,
      smartContracts: 12345,
      decentralizedApps: 167,
      totalSupply: 286000000,
      circulatingSupply: 238000000
    },
    'polkadot': {
      name: 'Polkadot',
      chainId: 'polkadot',
      blockHeight: 15678901,
      blockTime: 6,
      totalTransactions: 98765432,
      activeValidators: 297,
      totalStaked: 765432109,
      inflationRate: 0.1,
      bondedTokens: 0.75,
      communityPool: 4567890,
      latestBlocks: [],
      status: 'online',
      latency: 110,
      version: 'v0.9.32',
      peers: 680,
      uptime: 99.98,
      marketCap: 8500000000,
      tokenPrice: 5.67,
      dailyVolume: 150000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 56789,
      pendingTransactions: 456,
      governanceProposals: 11,
      smartContracts: 23456,
      decentralizedApps: 278,
      totalSupply: 1220000000,
      circulatingSupply: 1120000000
    },
    'near': {
      name: 'NEAR',
      chainId: 'mainnet',
      blockHeight: 87654321,
      blockTime: 1.2,
      totalTransactions: 345678901,
      activeValidators: 100,
      totalStaked: 567890123,
      inflationRate: 0.05,
      bondedTokens: 0.68,
      communityPool: 2345678,
      latestBlocks: [],
      status: 'online',
      latency: 65,
      version: '1.35.0',
      peers: 420,
      uptime: 99.96,
      marketCap: 3500000000,
      tokenPrice: 1.45,
      dailyVolume: 95000000,
      hashrate: 'N/A',
      difficulty: 0,
      avgBlockSize: 67890,
      pendingTransactions: 1234,
      governanceProposals: 6,
      smartContracts: 45678,
      decentralizedApps: 189,
      totalSupply: 1000000000,
      circulatingSupply: 845000000
    }
  };

  constructor(props: NetworkStatusPageIndexProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement | null>();
    this.state = {
      theme: themeManager.getTheme(),
      containerHeight: 0,
      selectedNetwork: 'kasplex',
      currentTime: Date.now(),
      isSidebarCollapsed: false,
      selectedBlock: null,
      isBlockDialogOpen: false
    };

    Object.keys(this.networks).forEach(networkKey => {
      this.generateLatestBlocks(networkKey);
    });
  }

  private generateLatestBlocks = (networkKey: string) => {
    const network = this.networks[networkKey];
    const blocks: BlockInfo[] = [];
    const baseHeight = network.blockHeight;
    
    for (let i = 0; i < 20; i++) {
      const isEVM = ['ethereum', 'bnb-chain', 'polygon', 'avalanche', 'fantom', 'arbitrum', 'base', 'optimism'].includes(networkKey);
      
      blocks.push({
        height: baseHeight - i,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: Date.now() - (i * network.blockTime * 1000),
        transactions: Math.floor(Math.random() * 250),
        validator: `val${Math.floor(Math.random() * 1000)}`,
        size: Math.floor(Math.random() * 50000) + 50000,
        gasUsed: isEVM ? Math.floor(Math.random() * 15000000) : undefined,
        gasLimit: isEVM ? 30000000 : undefined,
        rewards: Math.random() * 5,
        parentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        stateRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        receiptsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        miner: isEVM ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
        difficulty: isEVM ? Math.floor(Math.random() * 1000000000000) : undefined,
        totalDifficulty: isEVM ? Math.floor(Math.random() * 1000000000000000) : undefined,
        extraData: `0x${Math.random().toString(16).substr(2, 32)}`,
        nonce: `0x${Math.random().toString(16).substr(2, 16)}`,
        baseFeePerGas: isEVM ? Math.floor(Math.random() * 1000000000) : undefined,
        burntFees: isEVM ? Math.floor(Math.random() * 5000000000000000) : undefined
      });
    }
    
    this.networks[networkKey].latestBlocks = blocks;
  };

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

  private simulateNewBlock = (networkKey: string) => {
    const network = this.networks[networkKey];
    if (network.status !== 'online') return;

    const isEVM = ['ethereum', 'bnb-chain', 'polygon', 'avalanche', 'fantom', 'arbitrum', 'base', 'optimism'].includes(networkKey);

    const newBlock: BlockInfo = {
      height: network.blockHeight + 1,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: Date.now(),
      transactions: Math.floor(Math.random() * 250),
      validator: `val${Math.floor(Math.random() * 1000)}`,
      size: Math.floor(Math.random() * 50000) + 50000,
      gasUsed: isEVM ? Math.floor(Math.random() * 15000000) : undefined,
      gasLimit: isEVM ? 30000000 : undefined,
      rewards: Math.random() * 5,
      parentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      stateRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
      receiptsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
      miner: isEVM ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
      difficulty: isEVM ? Math.floor(Math.random() * 1000000000000) : undefined,
      totalDifficulty: isEVM ? Math.floor(Math.random() * 1000000000000000) : undefined,
      extraData: `0x${Math.random().toString(16).substr(2, 32)}`,
      nonce: `0x${Math.random().toString(16).substr(2, 16)}`,
      baseFeePerGas: isEVM ? Math.floor(Math.random() * 1000000000) : undefined,
      burntFees: isEVM ? Math.floor(Math.random() * 5000000000000000) : undefined
    };

    network.blockHeight = newBlock.height;
    network.totalTransactions += newBlock.transactions;

    network.latestBlocks.unshift(newBlock);
    if (network.latestBlocks.length > 20) {
      network.latestBlocks.pop();
    }

    this.forceUpdate();
  };

  private startBlockSimulation = () => {
    Object.keys(this.networks).forEach(networkKey => {
      const network = this.networks[networkKey];
      if (network.status === 'online') {
        setInterval(() => {
          this.simulateNewBlock(networkKey);
        }, network.blockTime * 1000);
      }
    });
  };

  componentDidMount() {
    this.updateContainerHeight();
    window.addEventListener('resize', this.debouncedResize);
    this.unsubscribe = themeManager.subscribe(this.handleThemeChange);

    if (this.containerRef.current?.parentElement) {
      this.resizeObserver = new ResizeObserver(this.updateContainerHeight);
      this.resizeObserver.observe(this.containerRef.current.parentElement);
    }

    this.timeInterval = setInterval(() => {
      this.setState({ currentTime: Date.now() });
    }, 1000);

    setTimeout(() => {
      this.startBlockSimulation();
    }, 2000);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResize);
    if (this.unsubscribe) this.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.blockUpdateInterval) {
      clearInterval(this.blockUpdateInterval);
    }
  }

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
      .global-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      
      .global-scrollbar::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        border-radius: 2px;
      }
      
      .global-scrollbar::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 2px;
      }
      
      .global-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${theme === 'dark' ? '#767E8C' : '#A8AFB8'};
      }
      
      .network-item-hover:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .network-item-selected {
        background-color: ${selectedBgColor} !important;
        color: ${theme === 'dark' ? '#FFFFFF' : '#182026'} !important;
        font-weight: 600 !important;
      }

      .block-pulse {
        animation: blockPulse 2s ease-in-out infinite;
      }

      @keyframes blockPulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }

      .status-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
        flex-shrink: 0;
      }

      .status-online {
        background-color: #2E8B57;
      }

      .status-syncing {
        background-color: #FFA500;
      }

      .status-offline {
        background-color: #DC143C;
      }

      .block-hash {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 10px;
        letter-spacing: -0.5px;
      }
    `;
  };

  private formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toLocaleString();
  };

  private formatTimeAgo = (timestamp: number): string => {
    const diff = (this.state.currentTime - timestamp) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  private handleNetworkSelect = (networkKey: string) => {
    this.setState({ selectedNetwork: networkKey });
  };

  private toggleSidebar = () => {
    this.setState(prevState => ({ 
      isSidebarCollapsed: !prevState.isSidebarCollapsed 
    }));
  };

  private handleBlockClick = (block: BlockInfo) => {
    this.setState({ 
      selectedBlock: block,
      isBlockDialogOpen: true 
    });
  };

  private handleCloseBlockDialog = () => {
    this.setState({ 
      selectedBlock: null,
      isBlockDialogOpen: false 
    });
  };

  private truncateHash = (hash: string, start: number = 8, end: number = 6): string => {
    if (hash.length <= start + end) return hash;
    return `${hash.substring(0, start)}...${hash.substring(hash.length - end)}`;
  };

  private renderBlockDialog = () => {
    const { theme, selectedBlock } = this.state;
    if (!selectedBlock) return null;

    const bgColor = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const cardBgColor = theme === 'dark' ? '#0F1116' : '#F8F9FA';

    const isEVM = selectedBlock.gasUsed !== undefined;

    return (
      <Dialog
        isOpen={this.state.isBlockDialogOpen}
        onClose={this.handleCloseBlockDialog}
        title={`Block #${selectedBlock.height}`}
        style={{
          width: '90vw',
          maxWidth: '1200px',
          backgroundColor: bgColor,
          paddingBottom: 0
        }}
      >
        <div style={{ 
          padding: '16px', 
          backgroundColor: bgColor,
          maxHeight: '70vh',
          overflowY: 'auto'
        }} className="global-scrollbar">
          {/* Block Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>Block Height</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {selectedBlock.height}
              </div>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>Timestamp</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {new Date(selectedBlock.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Hashes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>Block Hash</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor }} className="block-hash">
                {selectedBlock.hash}
              </div>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>Parent Hash</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor }} className="block-hash">
                {selectedBlock.parentHash}
              </div>
            </div>
          </div>

          {/* Block Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '10px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '10px', color: secondaryTextColor, marginBottom: '2px' }}>Transactions</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {selectedBlock.transactions}
              </div>
            </div>
            <div style={{
              padding: '10px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '10px', color: secondaryTextColor, marginBottom: '2px' }}>Size</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {this.formatNumber(selectedBlock.size)} bytes
              </div>
            </div>
            <div style={{
              padding: '10px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '10px', color: secondaryTextColor, marginBottom: '2px' }}>Validator</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {selectedBlock.validator}
              </div>
            </div>
            {selectedBlock.rewards && (
              <div style={{
                padding: '10px',
                backgroundColor: cardBgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '4px'
              }}>
                <div style={{ fontSize: '10px', color: secondaryTextColor, marginBottom: '2px' }}>Rewards</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                  {selectedBlock.rewards.toFixed(4)}
                </div>
              </div>
            )}
          </div>

          {/* EVM Specific Data */}
          {isEVM && (
            <>
              <div style={{
                padding: '8px 12px',
                backgroundColor: cardBgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                  EVM Data
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '6px'
                }}>
                  {selectedBlock.gasUsed && selectedBlock.gasLimit && (
                    <>
                      <div>
                        <div style={{ fontSize: '10px', color: secondaryTextColor }}>Gas Used</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                          {this.formatNumber(selectedBlock.gasUsed)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: secondaryTextColor }}>Gas Limit</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                          {this.formatNumber(selectedBlock.gasLimit)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: secondaryTextColor }}>Gas Usage</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                          {((selectedBlock.gasUsed / selectedBlock.gasLimit) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                  {selectedBlock.baseFeePerGas && (
                    <div>
                      <div style={{ fontSize: '10px', color: secondaryTextColor }}>Base Fee</div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                        {this.formatNumber(selectedBlock.baseFeePerGas)} wei
                      </div>
                    </div>
                  )}
                  {selectedBlock.burntFees && (
                    <div>
                      <div style={{ fontSize: '10px', color: secondaryTextColor }}>Burnt Fees</div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                        {this.formatNumber(selectedBlock.burntFees)}
                      </div>
                    </div>
                  )}
                  {selectedBlock.miner && (
                    <div>
                      <div style={{ fontSize: '10px', color: secondaryTextColor }}>Miner</div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                        {this.truncateHash(selectedBlock.miner)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Data */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: cardBgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>State Root</div>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: textColor }} className="block-hash">
                    {selectedBlock.stateRoot}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: cardBgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '11px', color: secondaryTextColor, marginBottom: '4px' }}>Receipts Root</div>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: textColor }} className="block-hash">
                    {selectedBlock.receiptsRoot}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Additional Data */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px'
          }}>
            <div style={{
              padding: '10px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '10px', color: secondaryTextColor, marginBottom: '2px' }}>Extra Data</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {this.truncateHash(selectedBlock.extraData, 6, 4)}
              </div>
            </div>
            <div style={{
              padding: '10px',
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '10px', color: secondaryTextColor, marginBottom: '2px' }}>Nonce</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {this.truncateHash(selectedBlock.nonce, 4, 4)}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    );
  };

  private renderNetworkList = () => {
    const { theme, selectedNetwork, isSidebarCollapsed } = this.state;
    const bgColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

    const sidebarWidth = isSidebarCollapsed ? '60px' : '200px';

    return (
      <div style={{
        backgroundColor: bgColor,
        borderRight: `1px solid ${borderColor}`,
        width: sidebarWidth,
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '12px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          flexShrink: 0
        }}>
          {!isSidebarCollapsed && (
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              color: textColor
            }}>
              Networks
            </div>
          )}
          <Icon 
            icon={isSidebarCollapsed ? "double-chevron-right" : "double-chevron-left"} 
            size={12} 
            color={secondaryTextColor}
            onClick={this.toggleSidebar}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Network List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 4px'
        }} className="global-scrollbar">
          {Object.keys(this.networks).map(networkKey => {
            const network = this.networks[networkKey];
            const isSelected = selectedNetwork === networkKey;
            
            return (
              <div
                key={networkKey}
                onClick={() => this.handleNetworkSelect(networkKey)}
                className={`network-item-hover ${isSelected ? 'network-item-selected' : ''}`}
                style={{
                  padding: isSidebarCollapsed ? '10px 8px' : '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  borderRadius: '4px',
                  border: `1px solid ${isSelected ? borderColor : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={isSidebarCollapsed ? `${network.name} (${network.blockHeight})` : undefined}
              >
                <span className={`status-indicator status-${network.status}`} />
                
                {!isSidebarCollapsed && (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '12px',
                        color: isSelected ? textColor : textColor,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {network.name}
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: secondaryTextColor,
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        #{this.formatNumber(network.blockHeight)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  private renderNetworkOverview = () => {
    const { theme, selectedNetwork, containerHeight } = this.state;
    const network = this.networks[selectedNetwork];
    
    const bgColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
    const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
    const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
    const cardBgColor = theme === 'dark' ? '#1A1D24' : '#F8F9FA';

    // 计算内容区域高度
    const headerHeight = 49;
    const metricsHeight = 80;
    const blocksHeaderHeight = 33;
    const availableHeight = containerHeight - headerHeight - metricsHeight - blocksHeaderHeight;

    return (
      <div style={{
        flex: 1,
        backgroundColor: bgColor,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Network Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '12px 16px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBgColor,
          flexShrink: 0
        }}>
          <span className={`status-indicator status-${network.status}`} />
          <h2 style={{ 
            margin: 0, 
            color: textColor,
            fontSize: '16px',
            fontWeight: '700'
          }}>
            {network.name}
          </h2>
          <span style={{ 
            fontSize: '11px', 
            color: secondaryTextColor,
            backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
            padding: '2px 6px',
            borderRadius: '3px',
            fontFamily: 'monospace'
          }}>
            {network.chainId}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: secondaryTextColor }}>Uptime</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {network.uptime}%
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: secondaryTextColor }}>Latency</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'monospace' }}>
                {network.latency}ms
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Real-time Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderBottom: `1px solid ${borderColor}`,
            flexShrink: 0
          }}>
            {[
              { 
                label: 'Block', 
                value: network.blockHeight.toLocaleString(),
                icon: 'cube',
                color: '#2E8B57'
              },
              { 
                label: 'Block Time', 
                value: `${network.blockTime}s`,
                icon: 'time',
                color: '#4169E1'
              },
              { 
                label: 'Transactions', 
                value: this.formatNumber(network.totalTransactions),
                icon: 'exchange',
                color: '#FFA500'
              },
              { 
                label: 'Pending', 
                value: this.formatNumber(network.pendingTransactions),
                icon: 'inbox',
                color: '#9370DB'
              },
              { 
                label: 'Validators', 
                value: this.formatNumber(network.activeValidators),
                icon: 'people',
                color: '#20B2AA'
              },
              { 
                label: 'Peers', 
                value: network.peers.toString(),
                icon: 'graph',
                color: '#32CD32'
              },
              { 
                label: 'Hash Rate', 
                value: network.hashrate,
                icon: 'dashboard',
                color: '#DC143C'
              },
              { 
                label: 'Block Size', 
                value: this.formatNumber(network.avgBlockSize),
                icon: 'expand-all',
                color: '#FF69B4'
              }
            ].map((metric, index) => (
              <div key={index} style={{
                padding: '8px 12px',
                borderRight: index < 7 ? `1px solid ${borderColor}` : 'none',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: cardBgColor
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Icon icon={metric.icon as any} size={10} color={metric.color} />
                  <span style={{ fontSize: '10px', color: secondaryTextColor }}>{metric.label}</span>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  color: textColor,
                  fontFamily: 'monospace',
                  lineHeight: '1.2'
                }}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            height: `${availableHeight * 0.5}px`,
            minHeight: '180px',
            flexShrink: 0
          }}>
            {/* Economic Metrics */}
            <div style={{
              borderRight: `1px solid ${borderColor}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '8px 12px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: cardBgColor,
                flexShrink: 0
              }}>
                <h3 style={{ 
                  color: textColor, 
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ECONOMIC METRICS
                </h3>
              </div>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px'
              }} className="global-scrollbar">
                <div style={{
                  display: 'grid',
                  gap: '4px'
                }}>
                  {[
                    { label: 'Total Staked', value: `$${this.formatNumber(network.totalStaked)}`, icon: 'dollar' },
                    { label: 'Inflation Rate', value: `${(network.inflationRate * 100).toFixed(2)}%`, icon: 'trending-up' },
                    { label: 'Bonded Ratio', value: `${(network.bondedTokens * 100).toFixed(1)}%`, icon: 'link' },
                    { label: 'Community Pool', value: `$${this.formatNumber(network.communityPool)}`, icon: 'bank-account' },
                    { label: 'Token Price', value: network.tokenPrice > 0 ? `$${network.tokenPrice.toFixed(2)}` : 'N/A', icon: 'tag' },
                    { label: 'Market Cap', value: network.marketCap > 0 ? `$${this.formatNumber(network.marketCap)}` : 'N/A', icon: 'chart' },
                    { label: 'Daily Volume', value: network.dailyVolume > 0 ? `$${this.formatNumber(network.dailyVolume)}` : 'N/A', icon: 'flows' },
                    { label: 'Total Supply', value: network.totalSupply > 0 ? this.formatNumber(network.totalSupply) : 'N/A', icon: 'circle' },
                    { label: 'Circulating', value: network.circulatingSupply > 0 ? this.formatNumber(network.circulatingSupply) : 'N/A', icon: 'refresh' }
                  ].map((metric, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                      borderRadius: '3px',
                      border: `1px solid ${borderColor}`,
                      fontSize: '11px',
                      flexShrink: 0
                    }}>
                      <Icon icon={metric.icon as any} size={10} color={secondaryTextColor} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10px', color: secondaryTextColor, whiteSpace: 'nowrap' }}>{metric.label}</div>
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: '600',
                          color: textColor,
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {metric.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Network Statistics */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '8px 12px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: cardBgColor,
                flexShrink: 0
              }}>
                <h3 style={{ 
                  color: textColor, 
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  NETWORK STATS
                </h3>
              </div>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px'
              }} className="global-scrollbar">
                <div style={{
                  display: 'grid',
                  gap: '4px'
                }}>
                  {[
                    { label: 'Version', value: network.version, icon: 'code' },
                    { label: 'Proposals', value: network.governanceProposals.toString(), icon: 'grouped-bar-chart' },
                    { label: 'Smart Contracts', value: this.formatNumber(network.smartContracts), icon: 'application' },
                    { label: 'DApps', value: this.formatNumber(network.decentralizedApps), icon: 'mobile-video' },
                    { label: 'Difficulty', value: network.difficulty > 0 ? this.formatNumber(network.difficulty) : 'N/A', icon: 'predictive-analysis' },
                    { label: 'Block Reward', value: network.latestBlocks[0]?.rewards ? `${network.latestBlocks[0].rewards.toFixed(4)}` : 'N/A', icon: 'dollar' }
                  ].map((metric, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      backgroundColor: theme === 'dark' ? '#0F1116' : '#FFFFFF',
                      borderRadius: '3px',
                      border: `1px solid ${borderColor}`,
                      fontSize: '11px',
                      flexShrink: 0
                    }}>
                      <Icon icon={metric.icon as any} size={10} color={secondaryTextColor} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10px', color: secondaryTextColor, whiteSpace: 'nowrap' }}>{metric.label}</div>
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: '600',
                          color: textColor,
                          fontFamily: metric.label === 'Version' ? 'monospace' : 'inherit',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {metric.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Latest Blocks Section - 20 Blocks */}
          <div style={{
            borderTop: `1px solid ${borderColor}`,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '200px'
          }}>
            <div style={{
              padding: '8px 12px',
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: cardBgColor,
              flexShrink: 0
            }}>
              <h3 style={{ 
                color: textColor, 
                margin: 0,
                fontSize: '12px',
                fontWeight: '600'
              }}>
                LATEST BLOCKS (20)
              </h3>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '6px',
              alignContent: 'flex-start'
            }} className="global-scrollbar">
              {network.latestBlocks.map((block, index) => (
                <div
                  key={block.height}
                  className={index === 0 ? 'block-pulse' : ''}
                  onClick={() => this.handleBlockClick(block)}
                  style={{
                    padding: '8px',
                    backgroundColor: cardBgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    lineHeight: '1.3',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2D323D' : '#F1F3F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = cardBgColor;
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon icon="cube" size={10} color={secondaryTextColor} />
                      <span style={{ fontWeight: '600', color: textColor, fontFamily: 'monospace', fontSize: '11px' }}>
                        #{block.height}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '9px', 
                      color: secondaryTextColor,
                      backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                      padding: '1px 4px',
                      borderRadius: '2px'
                    }}>
                      {this.formatTimeAgo(block.timestamp)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: secondaryTextColor, fontSize: '9px' }}>{block.transactions} tx</span>
                    <span style={{ color: secondaryTextColor, fontSize: '9px' }}>{this.truncateHash(block.validator)}</span>
                  </div>
                  
                  {block.gasUsed && block.gasLimit && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '9px',
                        color: secondaryTextColor,
                        marginBottom: '2px'
                      }}>
                        <span>Gas: {this.formatNumber(block.gasUsed)}</span>
                        <span>{((block.gasUsed / block.gasLimit) * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ 
                        height: '3px', 
                        backgroundColor: theme === 'dark' ? '#2D323D' : '#E1E5E9',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#2E8B57',
                          width: `${(block.gasUsed / block.gasLimit) * 100}%`
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
        
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {this.renderNetworkList()}
          {this.renderNetworkOverview()}
        </div>

        {this.renderBlockDialog()}
      </div>
    );
  }
}

export default NetworkStatusPageIndex;