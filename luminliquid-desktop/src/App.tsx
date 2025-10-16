import React from 'react';
import logo from './logo.svg';
import './App.css';
import MainLayout from './layout/MainLayout';
import TopArea from './components/top/TopArea';
import BottomArea from './components/bottom/BottomArea';
import { themeManager } from './globals/theme/ThemeManager';

require('normalize.css');
require('@blueprintjs/core/lib/css/blueprint.css');
require('@blueprintjs/icons/lib/css/blueprint-icons.css');

class App extends React.Component {
  componentDidMount() {
    themeManager.getTheme();
  }

  render() {
    return (
      <>
        {/* top area */}
        <TopArea />
        {/* bottom area */}
        <BottomArea />
      </>
    );
  }
}

export default App;