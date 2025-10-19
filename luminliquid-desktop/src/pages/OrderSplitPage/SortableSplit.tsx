import { Button, NumericInput, Tag } from "@blueprintjs/core";
import React from "react";

interface OrderSplit {
    id: string;
    percentage: number;
    quantity: number;
    legs: OrderLeg[];
    status: 'draft' | 'submitted' | 'executing' | 'completed' | 'cancelled';
    parentOrderId: string;
    timestamp: string;
}

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

class SortableSplit extends React.Component<{
    split: OrderSplit;
    index: number;
    theme: 'dark' | 'light';
    selectedSplit: string | null;
    onSelect: (id: string) => void;
    onRemoveLeg: (splitId: string, legId: string) => void;
    onExecuteSplit: (splitId: string) => void;
    onLegQuantityChange: (splitId: string, legId: string, quantity: number) => void;
    onDragStart?: (id: string) => void;
    onDragEnd?: () => void;
}> {
    private nodeRef = React.createRef<HTMLDivElement>();

    getStatusColor = (status: string): string => {
        switch (status) {
            case 'filled': return '#2E8B57';
            case 'partial': return '#FFA500';
            case 'pending': return '#1E90FF';
            case 'cancelled': return '#DC143C';
            case 'submitted': return '#9C27B0';
            case 'executing': return '#FF8C00';
            case 'completed': return '#2E8B57';
            case 'draft': return '#8F99A8';
            default: return '#8F99A8';
        }
    };

    getSideColor = (side: 'buy' | 'sell'): string => {
        return side === 'buy' ? '#2E8B57' : '#DC143C';
    };

    handleMouseDown = (e: React.MouseEvent) => {
        this.props.onDragStart?.(this.props.split.id);
    };

    handleMouseUp = () => {
        this.props.onDragEnd?.();
    };

    render() {
        const { split, index, theme, selectedSplit, onSelect, onRemoveLeg, onExecuteSplit, onLegQuantityChange } = this.props;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const cardBg = theme === 'dark' ? '#1A1D24' : '#F8F9FA';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const primaryColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const hoverBgColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';
        const selectedBgColor = theme === 'dark' ? '#3C4858' : '#E1E5E9';

        return (
            <div ref={this.nodeRef}>
                <div
                    style={{
                        padding: '8px',
                        backgroundColor: cardBg,
                        border: `1px solid ${selectedSplit === split.id ? primaryColor : borderColor}`,
                        borderBottom: `1px solid ${borderColor}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => onSelect(split.id)}
                >
                    <div
                        style={{ cursor: 'grab' }}
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: textColor
                                }}>
                                    Split {index + 1} - {split.percentage.toFixed(1)}%
                                </h4>
                                <Tag
                                    minimal
                                    style={{
                                        fontSize: '9px',
                                        padding: '1px 4px',
                                        color: this.getStatusColor(split.status),
                                        backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                                        border: `1px solid ${theme === 'dark' ? '#3A4250' : '#E1E5E9'}`
                                    }}
                                >
                                    {split.status.toUpperCase()}
                                </Tag>
                            </div>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: textColor
                            }}>
                                Qty: {split.quantity}
                            </div>
                        </div>
                    </div>

                    <div style={{ minHeight: '40px' }}>
                        {split.legs.map((leg) => (
                            <div
                                key={leg.id}
                                style={{
                                    padding: '4px 6px',
                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                                    borderLeft: `3px solid ${leg.exchangeColor}`,
                                    marginBottom: '2px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '0px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                        <div style={{
                                            fontSize: '9px',
                                            fontWeight: '600',
                                            color: textColor,
                                            minWidth: '60px'
                                        }}>
                                            {leg.exchange}
                                        </div>
                                        <Tag
                                            minimal
                                            style={{
                                                fontSize: '7px',
                                                padding: '1px 3px',
                                                color: this.getSideColor(leg.side),
                                                backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                                                border: `1px solid ${theme === 'dark' ? '#3A4250' : '#E1E5E9'}`
                                            }}
                                        >
                                            {leg.side.toUpperCase()}
                                        </Tag>
                                        <NumericInput
                                            small
                                            value={leg.quantity}
                                            onValueChange={(value) => onLegQuantityChange(split.id, leg.id, value)}
                                            min={0}
                                            stepSize={1}
                                            minorStepSize={0.1}
                                            style={{
                                                width: '60px',
                                                fontSize: '8px',
                                                height: '20px',
                                                backgroundColor: theme === 'dark' ? '#1A1D24' : '#FFFFFF',
                                                color: textColor,
                                                border: `1px solid ${borderColor}`
                                            }}
                                            buttonProps={{
                                                style: {
                                                    backgroundColor: theme === 'dark' ? '#2D323D' : '#F1F5F9',
                                                    color: textColor
                                                }
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{
                                            fontSize: '8px',
                                            color: textColor,
                                            minWidth: '45px'
                                        }}>
                                            ${leg.price.toFixed(2)}
                                        </div>
                                        <Button
                                            small
                                            minimal
                                            icon="cross"
                                            style={{
                                                padding: '1px',
                                                width: '16px',
                                                height: '16px',
                                                color: secondaryTextColor
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveLeg(split.id, leg.id);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <Button
                            small
                            intent="success"
                            text="Execute"
                            style={{
                                fontSize: '9px',
                                flex: 1,
                                height: '22px',
                                backgroundColor: theme === 'dark' ? '#2E8B57' : '#2E8B57',
                                border: `1px solid ${theme === 'dark' ? '#3A7A5A' : '#2A7850'}`
                            }}
                            onClick={() => onExecuteSplit(split.id)}
                            disabled={split.legs.length === 0}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default SortableSplit;