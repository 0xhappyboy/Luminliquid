import React from 'react';
import CandleView from 'candleview';
import { themeManager } from '../globals/theme/ThemeManager';
import { overflowManager } from '../globals/theme/OverflowTypeManager';
import { TEST_CANDLEVIEW_DATA8 } from './TradePage/TestData/TestData_3';

interface MultiPanelPageProps {
    children?: React.ReactNode;
}

interface MultiPanelPageState {
    theme: 'dark' | 'light';
}

class MultiPanelPage extends React.Component<MultiPanelPageProps, MultiPanelPageState> {
    private unsubscribe: (() => void) | null = null;

    constructor(props: MultiPanelPageProps) {
        super(props);
        this.state = {
            theme: themeManager.getTheme(),
        };
    }

    private handleThemeChange = (theme: 'dark' | 'light'): void => {
        this.setState({ theme });
    };

    componentDidMount() {
        this.unsubscribe = themeManager.subscribe(this.handleThemeChange);
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    render() {
        const { theme } = this.state;
        const backgroundColor = theme === 'dark' ? '#0F1116' : '#FFFFFF';
        overflowManager.setOverflow('auto');

        return (
            <div style={{
                height: '100%',
                width: '100%',
                backgroundColor,
                display: 'flex',
            }}>
                <CandleView
                    data={TEST_CANDLEVIEW_DATA8}
                    title='Test'
                    theme={theme}
                    i18n={'zh-cn'}
                    leftpanel={true}
                    toppanel={true}
                    terminal={true}
                    ai={true}
                    timezone='America/New_York'
                    timeframe='1m'
                    aiconfigs={[
                        {
                            proxyUrl: 'http://localhost:3000/api',
                            brand: 'aliyun',
                            model: 'qwen-turbo',
                        },
                        {
                            proxyUrl: 'http://localhost:3000/api',
                            brand: 'deepseek',
                            model: 'deepseek-chat',
                        },
                        {
                            proxyUrl: 'http://localhost:3000/api',
                            brand: 'deepseek',
                            model: 'deepseek-chat-lite',
                        },
                    ]}
                />
            </div>
        );
    }
}

export default MultiPanelPage;