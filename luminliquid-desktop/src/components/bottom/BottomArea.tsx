import React from 'react';
import BottomBar from './BottomMenu';
import TickerTape from './PriceMarquee';

class BottomArea extends React.Component {
    render() {
        return (
            <div style={styles.fixedBottom as React.CSSProperties}>
                <TickerTape />
                <BottomBar />
            </div>
        );
    }
}

const styles = {
    fixedBottom: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    }
};

export default BottomArea;