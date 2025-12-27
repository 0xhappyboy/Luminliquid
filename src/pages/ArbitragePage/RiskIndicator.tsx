import React from "react";

interface RiskIndicatorProps {
    theme: 'dark' | 'light';
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    status: 'good' | 'warning' | 'normal';
}

interface RiskIndicatorState {
    isHovered: boolean;
}

class RiskIndicator extends React.Component<RiskIndicatorProps, RiskIndicatorState> {
    constructor(props: RiskIndicatorProps) {
        super(props);
        this.state = {
            isHovered: false
        };
    }

    handleMouseEnter = () => {
        this.setState({ isHovered: true });
    };

    handleMouseLeave = () => {
        this.setState({ isHovered: false });
    };

    render() {
        const { theme, label, value, change, trend, status } = this.props;
        const { isHovered } = this.state;

        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        const textColor = theme === 'dark' ? '#E8EAED' : '#1A1D24';
        const secondaryTextColor = theme === 'dark' ? '#8F99A8' : '#5F6B7C';
        const borderColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';
        const hoverBorderColor = theme === 'dark' ? '#A7B6C2' : '#404854';
        const hoverBgColor = theme === 'dark' ? '#2D3746' : '#F1F3F5';

        const statusColor = status === 'good' ? '#2E8B57' :
            status === 'warning' ? '#F4B400' :
                secondaryTextColor;

        const changeColor = trend === 'up' ? '#2E8B57' : '#DC143C';

        const progressBgColor = theme === 'dark' ? '#2D323D' : '#E1E5E9';

        return (
            <div
                style={{
                    padding: '4px',
                    border: `1px solid ${isHovered ? hoverBorderColor : borderColor}`,
                    borderRadius: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    backgroundColor: isHovered ? hoverBgColor : backgroundColor
                }}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                title={`${label}: ${value} (${change})`}
            >
                <div style={{
                    color: secondaryTextColor,
                    fontSize: '8px',
                    fontWeight: '600',
                    marginBottom: '2px'
                }}>
                    {label}
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                }}>
                    <span style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: textColor
                    }}>
                        {value}
                    </span>
                    <span style={{
                        fontSize: '7px',
                        color: changeColor,
                        fontWeight: '600'
                    }}>
                        {trend === 'up' ? '↗' : '↘'} {change}
                    </span>
                </div>
                <div style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: progressBgColor,
                    borderRadius: '1px',
                    marginTop: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: status === 'good' ? '80%' : status === 'warning' ? '50%' : '30%',
                        height: '100%',
                        backgroundColor: statusColor,
                        borderRadius: '1px',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>
        );
    }
}

export default RiskIndicator;