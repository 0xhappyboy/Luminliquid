import React from 'react';
import logo from './logo.svg';
import './App.css';
import { themeManager } from './globals/theme/ThemeManager';
import TopArea from './components/top/TopArea';
import MiddleArea from './components/center/MiddleArea';
import NewsPage from './pages/NewsPage';
import BottomArea from './components/bottom/BottomArea';
import OrderSplitPage from './pages/OrderSplitPage';
import ArbitragePageIndex from './pages/ArbitragePage/ArbitragePageIndex';
import TradePage from './pages/TradePage';
import MarketPage from './pages/MarketPage';
import { BrowserRouter as Router, Route, BrowserRouter, Routes } from 'react-router-dom';
import LendingPageIndex from './pages/LendingPage';
// blueprintjs
require('normalize.css');
require('@blueprintjs/core/lib/css/blueprint.css');
require('@blueprintjs/icons/lib/css/blueprint-icons.css');
class App extends React.Component {
  componentDidMount() {
    themeManager.getTheme();
  }
  render() {
    return (
      <React.StrictMode>
        <BrowserRouter>
          <TopArea />
          <MiddleArea >
            <LendingPageIndex />
            {/* <Routes>
              <Route path='/' element={<NewsPage />} />
              <Route path='/news' element={<NewsPage />} />
              <Route path='/market' element={<MarketPage />} />
              <Route path='/order-split' element={<OrderSplitPage />} />
              <Route path='/arbitrage' element={<ArbitragePageIndex />} />
              <Route path='/trade' element={<TradePage />} />
              <Route path='/lend' element={<LendingPageIndex />} />
            </Routes> */}
          </MiddleArea>
          <BottomArea />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
}

export default App;