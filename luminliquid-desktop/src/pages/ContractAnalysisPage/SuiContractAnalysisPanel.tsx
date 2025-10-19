import React from "react";
import { Icon } from "@blueprintjs/core";

// Sui网络合约函数接口定义
interface SuiContractFunction {
    name: string;
    type: 'view' | 'entry' | 'private';
    visibility: 'public' | 'friend' | 'private';
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

interface SuiContractAnalysisPanelProps {
    theme: 'dark' | 'light';
    selectedFunction: string;
    functions: SuiContractFunction[];
    onFunctionSelect: (functionName: string) => void;
}

// 示例数据 - 在实际使用中可以从props传入
const defaultSuiFunctions: SuiContractFunction[] = [
    {
        name: "transfer",
        type: 'entry',
        visibility: 'public',
        calls: 1250,
        gas: 45000,
        lastCalled: '2024-01-15',
        parameters: [
            { name: "coin", type: "Coin<SUI>", description: "要转移的代币" },
            { name: "recipient", type: "address", description: "接收者地址" }
        ],
        returnType: "void",
        modifiers: [],
        description: "转移SUI代币到指定地址",
        risks: ["重入攻击风险", "权限验证"]
    },
    {
        name: "get_balance",
        type: 'view',
        visibility: 'public',
        calls: 3200,
        gas: 12000,
        lastCalled: '2024-01-16',
        parameters: [
            { name: "owner", type: "address", description: "查询余额的地址" }
        ],
        returnType: "u64",
        modifiers: [],
        description: "查询指定地址的余额",
        risks: []
    },
    {
        name: "mint_token",
        type: 'entry',
        visibility: 'public',
        calls: 450,
        gas: 78000,
        lastCalled: '2024-01-14',
        parameters: [
            { name: "amount", type: "u64", description: "铸造数量" },
            { name: "recipient", type: "address", description: "接收者地址" }
        ],
        returnType: "void",
        modifiers: ["only_owner"],
        description: "铸造新的代币",
        risks: ["无限铸造风险", "权限控制"]
    }
];

class SuiContractAnalysisPanel extends React.Component<SuiContractAnalysisPanelProps> {

    // 提供默认props值
    static defaultProps = {
        theme: 'dark' as const,
        selectedFunction: '',
        functions: defaultSuiFunctions,
        onFunctionSelect: (functionName: string) => { }
    };

    private applyPanelTheme = () => {
        const { theme } = this.props;
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const hoverBgColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
        const selectedBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';

        return `
            .sui-function-analysis-scrollbar::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            
            .sui-function-analysis-scrollbar::-webkit-scrollbar-track {
                background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
                border-radius: 2px;
            }
            
            .sui-function-analysis-scrollbar::-webkit-scrollbar-thumb {
                background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
                border-radius: 2px;
            }

            .sui-function-analysis-item:hover {
                background-color: ${hoverBgColor} !important;
            }

            .sui-function-analysis-item.selected {
                background-color: ${selectedBgColor} !important;
                border-color: ${primaryColor} !important;
            }
        `;
    };

    // 获取Sui函数类型对应的颜色
    private getFunctionTypeColor = (type: string, theme: 'dark' | 'light') => {
        switch (type) {
            case 'view':
                return {
                    bg: theme === 'dark' ? '#2D4F2D' : '#E8F5E8',
                    color: '#2E8B57'
                };
            case 'entry':
                return {
                    bg: theme === 'dark' ? '#4F2D3D' : '#F5E8EE',
                    color: '#C71585'
                };
            case 'private':
                return {
                    bg: theme === 'dark' ? '#3D3D2D' : '#F5F5E8',
                    color: '#DAA520'
                };
            default:
                return {
                    bg: theme === 'dark' ? '#4F2D2D' : '#F5E8E8',
                    color: '#DC143C'
                };
        }
    };

    // 获取Sui可见性对应的颜色
    private getVisibilityColor = (visibility: string, theme: 'dark' | 'light') => {
        switch (visibility) {
            case 'public':
                return {
                    bg: theme === 'dark' ? '#2D4F3D' : '#E8F5ED',
                    color: theme === 'dark' ? '#98FB98' : '#228B22'
                };
            case 'friend':
                return {
                    bg: theme === 'dark' ? '#3D3D4F' : '#EDE8F5',
                    color: theme === 'dark' ? '#D8BFD8' : '#9370DB'
                };
            case 'private':
                return {
                    bg: theme === 'dark' ? '#4F3D2D' : '#F5EDE8',
                    color: theme === 'dark' ? '#DEB887' : '#CD853F'
                };
            default:
                return {
                    bg: theme === 'dark' ? '#2D3A4F' : '#E8F0FE',
                    color: theme === 'dark' ? '#87CEEB' : '#1A73E8'
                };
        }
    };

    render() {
        const { theme, selectedFunction, functions, onFunctionSelect } = this.props;
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

        // 确保functions不为undefined
        const displayFunctions = functions || [];

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
                <style>{this.applyPanelTheme()}</style>

                {/* Panel Header */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${borderColor}`,
                    backgroundColor: theme === 'dark' ? '#15181E' : '#F8F9FA'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: textColor
                    }}>
                        Sui Function Analysis
                    </h3>
                    <div style={{
                        fontSize: '11px',
                        color: secondaryTextColor,
                        marginTop: '4px'
                    }}>
                        {displayFunctions.length} functions analyzed
                    </div>
                </div>

                {/* Functions Analysis Content with Scroll */}
                <div style={{ flex: 1, overflow: 'auto' }} className="sui-function-analysis-scrollbar">
                    <div style={{ padding: '0' }}>
                        {displayFunctions.map((func, funcIndex) => {
                            const typeColors = this.getFunctionTypeColor(func.type, theme);
                            const visibilityColors = this.getVisibilityColor(func.visibility, theme);

                            return (
                                <div
                                    key={func.name}
                                    className={`sui-function-analysis-item ${selectedFunction === func.name ? 'selected' : ''}`}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: selectedFunction === func.name ?
                                            (theme === 'dark' ? '#2D323D' : '#F8F9FA') :
                                            cardBg,
                                        borderBottom: `1px solid ${borderColor}`,
                                        borderLeft: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => onFunctionSelect(func.name)}
                                >
                                    {/* Function Header */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <h4 style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: textColor,
                                            fontFamily: 'monospace'
                                        }}>
                                            {func.name}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                backgroundColor: typeColors.bg,
                                                color: typeColors.color
                                            }}>
                                                {func.type}
                                            </span>
                                            <span style={{
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                backgroundColor: visibilityColors.bg,
                                                color: visibilityColors.color
                                            }}>
                                                {func.visibility}
                                            </span>
                                            {func.modifiers.map((modifier, idx) => (
                                                <span key={idx} style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    backgroundColor: theme === 'dark' ? '#3D2D4F' : '#F3E8FD',
                                                    color: theme === 'dark' ? '#D8BFD8' : '#8B4513'
                                                }}>
                                                    {modifier}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Function Stats */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '8px',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: secondaryTextColor }}>CALLS</div>
                                            <div style={{ fontSize: '12px', fontWeight: '700' }}>
                                                {func.calls.toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: secondaryTextColor }}>GAS</div>
                                            <div style={{ fontSize: '12px', fontWeight: '700' }}>
                                                {func.gas.toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: secondaryTextColor }}>LAST CALLED</div>
                                            <div style={{ fontSize: '10px', fontWeight: '600' }}>
                                                {func.lastCalled}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: secondaryTextColor }}>RETURN</div>
                                            <div style={{
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                fontFamily: 'monospace'
                                            }}>
                                                {func.returnType || 'void'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parameters */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: secondaryTextColor,
                                            marginBottom: '6px'
                                        }}>
                                            PARAMETERS ({func.parameters.length})
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {func.parameters.map((param, paramIndex) => (
                                                <div key={paramIndex} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    padding: '4px 0'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontFamily: 'monospace',
                                                            fontWeight: '600',
                                                            color: textColor
                                                        }}>
                                                            {param.name}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '9px',
                                                            fontFamily: 'monospace',
                                                            color: secondaryTextColor
                                                        }}>
                                                            {param.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {func.description && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: secondaryTextColor,
                                                marginBottom: '6px'
                                            }}>
                                                DESCRIPTION
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                color: textColor,
                                                lineHeight: '1.4'
                                            }}>
                                                {func.description}
                                            </div>
                                        </div>
                                    )}

                                    {/* Risks */}
                                    {func.risks.length > 0 && (
                                        <div>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: secondaryTextColor,
                                                marginBottom: '6px'
                                            }}>
                                                RISKS ({func.risks.length})
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {func.risks.map((risk, riskIndex) => (
                                                    <div key={riskIndex} style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '6px',
                                                        padding: '4px 0'
                                                    }}>
                                                        <Icon
                                                            icon="warning-sign"
                                                            size={10}
                                                            color="#FFA500"
                                                            style={{ marginTop: '1px', flexShrink: 0 }}
                                                        />
                                                        <span style={{
                                                            fontSize: '10px',
                                                            color: '#FFA500'
                                                        }}>
                                                            {risk}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default SuiContractAnalysisPanel;