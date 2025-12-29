import React from 'react';
import './App.css';
import { themeManager } from './globals/theme/ThemeManager';
import TopArea from './components/top/TopArea';
import MiddleArea from './components/center/MiddleArea';
import BottomArea from './components/bottom/BottomArea';
import { BrowserRouter as Router, Route, BrowserRouter, Routes } from 'react-router-dom';
import FinanceToolsPageIndex from './pages/FinanceToolsPage';
import MarketPage from './pages/MarketPage';
import NewsPage from './pages/NewsPageIndex';
import ArbitragePageIndex from './pages/ArbitragePage';
import TradePage from './pages/TradePage';
import LendPageIndex from './pages/LendPageIndex';
import TradeStrategyPageIndex from './pages/TradeStrategyPageIndex';
import ProfilePage from './pages/ProfilePageIndex';
import SocialMonitorPageIndex from './pages/SocialMonitorPage';
import ContractAnalysisPageIndex from './pages/ContractAnalysisPage';
import PredictionMarketPage from './pages/PredictionMarket';
import OrderSplitPageIndex from './pages/OrderSplitPage';
import NetworkStatusPageIndex from './pages/NetworkStatusPageIndex';

import SettingPageIndex from './pages/SettingPageIndex';
import MultiPanelPage from './pages/MultiPanelTradePage';

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
            <Routes>
              <Route path='/' element={<MarketPage />} />
              <Route path='/market' element={<MarketPage />} />
              <Route path='/news' element={<NewsPage />} />
              <Route path='/ordersplit' element={<OrderSplitPageIndex />} />
              <Route path='/arbitrage' element={<ArbitragePageIndex />} />
              <Route path='/trade/:exchange/:symbol' element={<TradePage />} />
              <Route path='/trade' element={<TradePage />} />
              <Route path='/lend' element={<LendPageIndex />} />
              <Route path='/tradestrategy' element={<TradeStrategyPageIndex />} />
              <Route path='/tool' element={<FinanceToolsPageIndex />} />
              <Route path='/profile' element={<ProfilePage />} />
              <Route path='/socialmonitor' element={<SocialMonitorPageIndex />} />
              <Route path='/contractanalysis' element={<ContractAnalysisPageIndex />} />
              <Route path='/predictionmarket' element={<PredictionMarketPage />} />
              <Route path='/networkstatus' element={<NetworkStatusPageIndex />} />
              <Route path='/settting' element={<SettingPageIndex />} />
              <Route path='/multi_panel' element={<MultiPanelPage />} />
            </Routes>
          </MiddleArea>
          <BottomArea />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
}

export default App;