import React from "react";
import { Icon } from "@blueprintjs/core";

// 从原文件复制相关的接口定义
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

interface SolanaContractAnalysisPanelProps {
    theme: 'dark' | 'light';
    selectedFunction: string;
    functions: ContractFunction[];
    onFunctionSelect: (functionName: string) => void;
}

class SolanaContractAnalysisPanel extends React.Component<SolanaContractAnalysisPanelProps> {

    private applyPanelTheme = () => {
        const { theme } = this.props;
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const hoverBgColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
        const selectedBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';

        return `
            .function-analysis-scrollbar::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            
            .function-analysis-scrollbar::-webkit-scrollbar-track {
                background: ${theme === 'dark' ? '#1A1D24' : '#F8F9FA'};
                border-radius: 2px;
            }
            
            .function-analysis-scrollbar::-webkit-scrollbar-thumb {
                background: ${theme === 'dark' ? '#5A6270' : '#C4C9D1'};
                border-radius: 2px;
            }

            .function-analysis-item:hover {
                background-color: ${hoverBgColor} !important;
            }

            .function-analysis-item.selected {
                background-color: ${selectedBgColor} !important;
                border-color: ${primaryColor} !important;
            }
        `;
    };

    render() {
        const { theme, selectedFunction, functions, onFunctionSelect } = this.props;
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';

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
                        Function Analysis
                    </h3>
                    <div style={{
                        fontSize: '11px',
                        color: secondaryTextColor,
                        marginTop: '4px'
                    }}>
                        {functions.length} functions analyzed
                    </div>
                </div>

                {/* Functions Analysis Content with Scroll */}
                <div style={{ flex: 1, overflow: 'auto' }} className="function-analysis-scrollbar">
                    <div style={{ padding: '0' }}>
                        {functions.map((func, funcIndex) => (
                            <div
                                key={func.name}
                                className={`function-analysis-item ${selectedFunction === func.name ? 'selected' : ''}`}
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
                                            backgroundColor: func.type === 'view' ?
                                                (theme === 'dark' ? '#2D4F2D' : '#E8F5E8') :
                                                (theme === 'dark' ? '#4F2D2D' : '#F5E8E8'),
                                            color: func.type === 'view' ? '#2E8B57' : '#DC143C'
                                        }}>
                                            {func.type}
                                        </span>
                                        <span style={{
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            backgroundColor: theme === 'dark' ? '#2D3A4F' : '#E8F0FE',
                                            color: theme === 'dark' ? '#87CEEB' : '#1A73E8'
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
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default SolanaContractAnalysisPanel;