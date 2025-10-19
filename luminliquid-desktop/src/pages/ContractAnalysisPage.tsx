import React from "react";
import {
    Icon,
} from "@blueprintjs/core";
import { themeManager } from "../globals/theme/ThemeManager";

interface ContractAnalysisPageProps {
    children?: React.ReactNode;
}

interface ContractAnalysisPageState {
    theme: 'dark' | 'light';
    containerHeight: number;
    selectedFunction: string;
    expandedSections: Set<string>;
    currentFile: string;
}

interface ContractData {
    address: string;
    name: string;
    creator: string;
    creationTime: string;
    transactions: number;
    uniqueUsers: number;
    gasUsed: number;
    tvl: number;
    riskScore: number;
    securityIssues: number;
    codeComplexity: number;
    auditStatus: 'audited' | 'unaudited' | 'suspicious';
    functions: ContractFunction[];
    events: ContractEvent[];
    tokenomics: Tokenomics;
    sourceCode: SourceCode;
}

interface ContractFunction {
    name: string;
    type: 'view' | 'payable' | 'nonpayable';
    visibility: 'public' | 'external' | 'internal' | 'private';
    calls: number;
    gas: number;
    lastCalled: string;
    parameters: FunctionParameter[];
    returnType?: string;
    modifiers: string[];
    description: string;
    risks: string[];
}

interface FunctionParameter {
    name: string;
    type: string;
    description: string;
}

interface ContractEvent {
    name: string;
    count: number;
    lastTriggered: string;
    parameters: EventParameter[];
}

interface EventParameter {
    name: string;
    type: string;
    indexed: boolean;
}

interface Tokenomics {
    totalSupply: number;
    holders: number;
    liquidity: number;
    taxBuy: number;
    taxSell: number;
}

interface SourceCode {
    files: {
        [fileName: string]: string;
    };
    selectedFile: string;
}

class ContractAnalysisPage extends React.Component<ContractAnalysisPageProps, ContractAnalysisPageState> {
    private unsubscribe: (() => void) | null = null;
    private containerRef: React.RefObject<HTMLDivElement | null>;

    private generateContractData = (): ContractData => {
        return {
            address: "0x742d35Cc6634C0532925a3b8D4B...",
            name: "Uniswap V3 Router",
            creator: "0x1f9840a85d5aF5bf1D1762F925BD...",
            creationTime: "2023-05-15 14:23:45",
            transactions: 2456789,
            uniqueUsers: 156234,
            gasUsed: 456789123,
            tvl: 24567890.45,
            riskScore: 23,
            securityIssues: 2,
            codeComplexity: 78,
            auditStatus: 'audited',
            functions: [
                {
                    name: 'swapExactTokensForTokens',
                    type: 'payable',
                    visibility: 'external',
                    calls: 123456,
                    gas: 125000,
                    lastCalled: '2 min ago',
                    parameters: [
                        { name: 'amountIn', type: 'uint256', description: 'Amount of input tokens to swap' },
                        { name: 'amountOutMin', type: 'uint256', description: 'Minimum amount of output tokens' },
                        { name: 'path', type: 'address[]', description: 'Array of token addresses' },
                        { name: 'to', type: 'address', description: 'Recipient address' },
                        { name: 'deadline', type: 'uint256', description: 'Transaction deadline timestamp' }
                    ],
                    returnType: 'uint256[]',
                    modifiers: ['nonReentrant'],
                    description: 'Swaps an exact amount of input tokens for as many output tokens as possible',
                    risks: ['Reentrancy risk mitigated by nonReentrant']
                },
                {
                    name: 'addLiquidity',
                    type: 'payable',
                    visibility: 'external',
                    calls: 45678,
                    gas: 234000,
                    lastCalled: '5 min ago',
                    parameters: [
                        { name: 'tokenA', type: 'address', description: 'First token address' },
                        { name: 'tokenB', type: 'address', description: 'Second token address' },
                        { name: 'amountADesired', type: 'uint256', description: 'Desired amount of token A' },
                        { name: 'amountBDesired', type: 'uint256', description: 'Desired amount of token B' },
                        { name: 'amountAMin', type: 'uint256', description: 'Minimum amount of token A' },
                        { name: 'amountBMin', type: 'uint256', description: 'Minimum amount of token B' },
                        { name: 'to', type: 'address', description: 'Recipient address' },
                        { name: 'deadline', type: 'uint256', description: 'Transaction deadline' }
                    ],
                    returnType: '(uint256, uint256, uint256)',
                    modifiers: ['nonReentrant'],
                    description: 'Adds liquidity to a pool',
                    risks: ['Front-running risk', 'Slippage risk']
                },
                {
                    name: 'getAmountsOut',
                    type: 'view',
                    visibility: 'public',
                    calls: 567890,
                    gas: 45000,
                    lastCalled: '1 min ago',
                    parameters: [
                        { name: 'amountIn', type: 'uint256', description: 'Input amount' },
                        { name: 'path', type: 'address[]', description: 'Token path' }
                    ],
                    returnType: 'uint256[]',
                    modifiers: [],
                    description: 'Returns amounts out for given input amount',
                    risks: ['No significant risks']
                }
            ],
            events: [
                {
                    name: 'Swap', count: 1234567, lastTriggered: '10 sec ago', parameters: [
                        { name: 'sender', type: 'address', indexed: true },
                        { name: 'amount0In', type: 'uint256', indexed: false },
                        { name: 'amount1Out', type: 'uint256', indexed: false }
                    ]
                },
                {
                    name: 'Mint', count: 234567, lastTriggered: '2 min ago', parameters: [
                        { name: 'sender', type: 'address', indexed: true },
                        { name: 'amount0', type: 'uint256', indexed: false },
                        { name: 'amount1', type: 'uint256', indexed: false }
                    ]
                }
            ],
            tokenomics: {
                totalSupply: 1000000000,
                holders: 12567,
                liquidity: 45678900.23,
                taxBuy: 2.5,
                taxSell: 3.0
            },
            sourceCode: {
                selectedFile: 'UniswapV3Router.sol',
                files: {
                    'UniswapV3Router.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UniswapV3Router {
    address public factory;
    address public WETH9;
    
    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }
    
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256[] memory amounts) {
        require(amountIn > 0, "Invalid input amount");
        require(block.timestamp <= deadline, "Transaction expired");
        
        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output");
        
        // Transfer logic
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV3Library.pairFor(factory, path[0], path[1]), amountIn
        );
        _swap(amounts, path, to);
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(block.timestamp <= deadline, "Transaction expired");
        
        (amountA, amountB) = _calculateLiquidity(
            tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin
        );
        
        address pair = UniswapV3Library.pairFor(factory, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IUniswapV3Pair(pair).mint(to);
    }
    
    function getAmountsOut(
        uint256 amountIn,
        address[] memory path
    ) public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i; i < path.length - 1; i++) {
            (uint256 reserveIn, uint256 reserveOut) = UniswapV3Library.getReserves(
                factory, path[i], path[i + 1]
            );
            amounts[i + 1] = UniswapV3Library.getAmountOut(
                amounts[i], reserveIn, reserveOut
            );
        }
    }
}`,
                    'UniswapV3Library.sol': `// Library contract for Uniswap V3 utilities...`,
                    'TransferHelper.sol': `// Helper contract for safe token transfers...`
                }
            }
        };
    };

    private contractData: ContractData = this.generateContractData();

    constructor(props: ContractAnalysisPageProps) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement | null>();
        this.state = {
            theme: themeManager.getTheme(),
            containerHeight: 0,
            selectedFunction: 'swapExactTokensForTokens',
            expandedSections: new Set(['metrics', 'functions']),
            currentFile: 'UniswapV3Router.sol'
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

    private handleFunctionSelect = (functionName: string) => {
        this.setState({ selectedFunction: functionName });
    };

    private toggleSection = (sectionKey: string) => {
        this.setState(prevState => {
            const newExpandedSections = new Set(prevState.expandedSections);
            if (newExpandedSections.has(sectionKey)) {
                newExpandedSections.delete(sectionKey);
            } else {
                newExpandedSections.add(sectionKey);
            }
            return { expandedSections: newExpandedSections };
        });
    };

    private handleFileSelect = (fileName: string) => {
        this.setState({ currentFile: fileName });
    };

    componentDidMount() {
        this.updateContainerHeight();
        window.addEventListener('resize', this.debouncedResize);
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedResize);
        if (this.unsubscribe) this.unsubscribe();
    }

    private applyGlobalTheme = () => {
        const { theme } = this.state;
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const hoverBgColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
        const selectedBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';

        return `
      .contract-analysis-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      
      .contract-analysis-scrollbar::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
        border-radius: 2px;
      }
      
      .contract-analysis-scrollbar::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
        border-radius: 2px;
      }
      
      .function-item.selected {
        background-color: ${selectedBgColor} !important;
        border-color: ${primaryColor} !important;
      }
      
      .function-item:hover {
        background-color: ${hoverBgColor} !important;
      }
      
      .code-keyword { color: ${theme === 'dark' ? '#FF79C6' : '#D33682'}; }
      .code-function { color: ${theme === 'dark' ? '#50FA7B' : '#2E8B57'}; }
      .code-variable { color: ${theme === 'dark' ? '#F8F8F2' : '#333333'}; }
      .code-comment { color: ${theme === 'dark' ? '#6272A4' : '#6A737D'}; }
      .code-string { color: ${theme === 'dark' ? '#F1FA8C' : '#032F62'}; }
      .code-number { color: ${theme === 'dark' ? '#BD93F9' : '#005CC5'}; }
    `;
    };

    private formatNumber = (num: number): string => {
        if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    private renderLeftPanel = () => {
        const { theme, expandedSections, selectedFunction } = this.state;
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

        const metrics = [
            { label: 'TXNS', value: this.contractData.transactions.toLocaleString(), icon: 'exchange' },
            { label: 'USERS', value: this.contractData.uniqueUsers.toLocaleString(), icon: 'people' },
            { label: 'GAS USED', value: (this.contractData.gasUsed / 1000000).toFixed(1) + 'M', icon: 'fuel' },
            { label: 'TVL', value: this.formatNumber(this.contractData.tvl), icon: 'dollar' },
        ];

        return (
            <div style={{
                width: '280px',
                backgroundColor: cardBg,
                borderRight: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                flexShrink: 0
            }}>
                {/* Header */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: textColor }}>
                            {this.contractData.name}
                        </h3>
                        <span className={`audit-badge ${this.contractData.auditStatus}`}
                            style={{
                                padding: '1px 6px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                fontWeight: '600',
                                backgroundColor: this.contractData.auditStatus === 'audited' ? '#2E8B57' :
                                    this.contractData.auditStatus === 'unaudited' ? '#FFA500' : '#DC143C',
                                color: 'white'
                            }}>
                            {this.contractData.auditStatus}
                        </span>
                    </div>
                    <div style={{ fontSize: '11px', color: secondaryTextColor, fontFamily: 'monospace' }}>
                        {this.contractData.address.slice(0, 20)}...
                    </div>
                </div>

                {/* Metrics Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1px',
                    backgroundColor: borderColor,
                    borderBottom: `1px solid ${borderColor}`
                }}>
                    {metrics.map((metric, index) => (
                        <div key={index} style={{
                            padding: '10px 12px',
                            backgroundColor: cardBg,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <Icon icon={metric.icon as any} size={12} color={secondaryTextColor} />
                            <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>
                                {metric.value}
                            </div>
                            <div style={{ fontSize: '10px', color: secondaryTextColor, marginTop: '2px' }}>
                                {metric.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Risk & Complexity */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1px',
                    backgroundColor: borderColor,
                    borderBottom: `1px solid ${borderColor}`
                }}>
                    <div style={{ padding: '10px 12px', backgroundColor: cardBg, textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: secondaryTextColor }}>RISK SCORE</div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: this.contractData.riskScore < 30 ? '#2E8B57' :
                                this.contractData.riskScore < 70 ? '#FFA500' : '#DC143C'
                        }}>
                            {this.contractData.riskScore}/100
                        </div>
                    </div>
                    <div style={{ padding: '10px 12px', backgroundColor: cardBg, textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: secondaryTextColor }}>COMPLEXITY</div>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>
                            {this.contractData.codeComplexity}%
                        </div>
                    </div>
                </div>

                {/* Functions List */}
                <div style={{ flex: 1, overflow: 'auto' }} className="contract-analysis-scrollbar">
                    <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: secondaryTextColor }}>
                        FUNCTIONS ({this.contractData.functions.length})
                    </div>
                    {this.contractData.functions.map((func, index) => (
                        <div
                            key={func.name}
                            className={`function-item ${selectedFunction === func.name ? 'selected' : ''}`}
                            onClick={() => this.handleFunctionSelect(func.name)}
                            style={{
                                padding: '8px 16px',
                                borderLeft: selectedFunction === func.name ? `3px solid ${theme === 'dark' ? '#A7B6C2' : '#404854'}` : '3px solid transparent',
                                backgroundColor: selectedFunction === func.name ?
                                    (theme === 'dark' ? '#3C4858' : '#E1E5E9') : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: '600' }}>
                                    {func.name}
                                </div>
                                <span style={{
                                    padding: '1px 4px',
                                    borderRadius: '4px',
                                    fontSize: '9px',
                                    backgroundColor: func.type === 'view' ?
                                        (theme === 'dark' ? '#2D4F2D' : '#E8F5E8') :
                                        (theme === 'dark' ? '#4F2D2D' : '#F5E8E8'),
                                    color: func.type === 'view' ? '#2E8B57' : '#DC143C'
                                }}>
                                    {func.type}
                                </span>
                            </div>
                            <div style={{ fontSize: '10px', color: secondaryTextColor, marginTop: '4px' }}>
                                {func.calls.toLocaleString()} calls • {func.gas.toLocaleString()} gas
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    private renderCenterPanel = () => {
        const { theme, currentFile } = this.state;
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';

        // Simple syntax highlighting
        const highlightCode = (code: string) => {
            return code
                .replace(/(function|contract|pragma|returns|require|public|external|view|payable|nonReentrant)\b/g, '<span class="code-keyword">$1</span>')
                .replace(/(swapExactTokensForTokens|addLiquidity|getAmountsOut)\b/g, '<span class="code-function">$1</span>')
                .replace(/(amountIn|amountOutMin|path|to|deadline)\b/g, '<span class="code-variable">$1</span>')
                .replace(/(".*?"|'.*?')/g, '<span class="code-string">$1</span>')
                .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
                .replace(/(\b\d+\b)/g, '<span class="code-number">$1</span>');
        };

        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* File Tabs */}
                <div style={{
                    display: 'flex',
                    backgroundColor: theme === 'dark' ? '#0F1116' : '#F8F9FA',
                    borderBottom: `1px solid ${borderColor}`,
                    flexShrink: 0
                }}>
                    {Object.keys(this.contractData.sourceCode.files).map(fileName => (
                        <div
                            key={fileName}
                            onClick={() => this.handleFileSelect(fileName)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: currentFile === fileName ? '600' : '400',
                                borderBottom: currentFile === fileName ? `2px solid ${theme === 'dark' ? '#A7B6C2' : '#404854'}` : 'none',
                                cursor: 'pointer',
                                backgroundColor: currentFile === fileName ? cardBg : 'transparent'
                            }}
                        >
                            {fileName}
                        </div>
                    ))}
                </div>

                {/* Code Editor */}
                <div style={{
                    flex: 1,
                    padding: '0',
                    backgroundColor: cardBg,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.4'
                }} className="contract-analysis-scrollbar">
                    <pre style={{ margin: 0, padding: '16px', paddingBottom: '50px' }}
                        dangerouslySetInnerHTML={{
                            __html: highlightCode(this.contractData.sourceCode.files[currentFile])
                        }}
                    />
                </div>
            </div>
        );
    };

    private renderRightPanel = () => {
        const { theme, selectedFunction } = this.state;
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

        const selectedFunc = this.contractData.functions.find(f => f.name === selectedFunction);
        if (!selectedFunc) return null;

        return (
            <div style={{
                width: '320px',
                backgroundColor: cardBg,
                borderLeft: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                flexShrink: 0
            }}>
                {/* Function Header */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>
                            {selectedFunc.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{
                                padding: '1px 6px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                backgroundColor: selectedFunc.type === 'view' ?
                                    (theme === 'dark' ? '#2D4F2D' : '#E8F5E8') :
                                    (theme === 'dark' ? '#4F2D2D' : '#F5E8E8'),
                                color: selectedFunc.type === 'view' ? '#2E8B57' : '#DC143C'
                            }}>
                                {selectedFunc.type}
                            </span>
                            <span style={{
                                padding: '1px 6px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                backgroundColor: theme === 'dark' ? '#2D3746' : '#F1F3F5',
                                color: secondaryTextColor
                            }}>
                                {selectedFunc.visibility}
                            </span>
                        </div>
                    </div>
                    <div style={{ fontSize: '11px', color: secondaryTextColor }}>
                        {selectedFunc.description}
                    </div>
                </div>

                {/* Usage Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1px',
                    backgroundColor: borderColor,
                    borderBottom: `1px solid ${borderColor}`
                }}>
                    <div style={{ padding: '8px 12px', backgroundColor: cardBg, textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: secondaryTextColor }}>CALLS</div>
                        <div style={{ fontSize: '12px', fontWeight: '700' }}>
                            {selectedFunc.calls.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ padding: '8px 12px', backgroundColor: cardBg, textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: secondaryTextColor }}>AVG GAS</div>
                        <div style={{ fontSize: '12px', fontWeight: '700' }}>
                            {selectedFunc.gas.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Parameters */}
                <div style={{ flex: 1, overflow: 'auto' }} className="contract-analysis-scrollbar">
                    <div style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>PARAMETERS</div>
                        {selectedFunc.parameters.map((param, index) => (
                            <div key={index} style={{
                                marginBottom: '8px',
                                padding: '8px',
                                backgroundColor: theme === 'dark' ? '#2D323D' : '#F8F9FA',
                                borderRadius: '4px',
                                border: `1px solid ${borderColor}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: '600' }}>
                                        {param.name}
                                    </span>
                                    <span style={{
                                        fontSize: '10px',
                                        color: secondaryTextColor,
                                        backgroundColor: theme === 'dark' ? '#3C4858' : '#E1E5E9',
                                        padding: '1px 4px',
                                        borderRadius: '3px'
                                    }}>
                                        {param.type}
                                    </span>
                                </div>
                                <div style={{ fontSize: '10px', color: secondaryTextColor }}>
                                    {param.description}
                                </div>
                            </div>
                        ))}

                        {/* Return Type */}
                        {selectedFunc.returnType && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>RETURNS</div>
                                <div style={{
                                    padding: '6px 8px',
                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#F8F9FA',
                                    borderRadius: '4px',
                                    border: `1px solid ${borderColor}`,
                                    fontFamily: 'monospace',
                                    fontSize: '11px'
                                }}>
                                    {selectedFunc.returnType}
                                </div>
                            </div>
                        )}

                        {/* Modifiers */}
                        {selectedFunc.modifiers.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>MODIFIERS</div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {selectedFunc.modifiers.map((modifier, index) => (
                                        <span key={index} style={{
                                            padding: '2px 6px',
                                            fontSize: '10px',
                                            backgroundColor: theme === 'dark' ? '#3C4858' : '#E1E5E9',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace'
                                        }}>
                                            {modifier}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Risks */}
                        {selectedFunc.risks.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#DC143C' }}>
                                    RISK ANALYSIS
                                </div>
                                {selectedFunc.risks.map((risk, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '6px',
                                        marginBottom: '4px',
                                        fontSize: '11px',
                                        color: secondaryTextColor
                                    }}>
                                        <Icon icon="warning-sign" size={10} color="#DC143C" />
                                        <span>{risk}</span>
                                    </div>
                                ))}
                            </div>
                        )}
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
                    backgroundColor,
                    overflow: 'hidden'
                }}
            >
                <style>{this.applyGlobalTheme()}</style>

                {this.renderLeftPanel()}
                {this.renderCenterPanel()}
                {this.renderRightPanel()}
            </div>
        );
    }
}

export default ContractAnalysisPage;