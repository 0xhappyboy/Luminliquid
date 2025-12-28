import React from "react"
import { themeManager } from "../../globals/theme/ThemeManager";
import { overflowManager } from "../../globals/theme/OverflowTypeManager";
import { withRouter } from "../../WithRouter";

interface MiddleAreaProps {
  location?: any;
}

interface MiddleAreaState {
  contentHeight: number;
  theme: 'dark' | 'light',
  overflow: 'auto' | 'hidden' | 'scroll' | 'visible';
}

class MiddleArea extends React.Component<MiddleAreaProps, MiddleAreaState> {
  private contentRef: React.RefObject<HTMLDivElement>;
  private unsubscribe: (() => void) | null = null;
  private unsubscribeOverflow: (() => void) | null = null;
  private TOP_AREA_HEIGHT = 90;
  private BOTTOM_AREA_HEIGHT = 60;

  constructor(props: MiddleAreaProps) {
    super(props);
    this.contentRef = React.createRef() as React.RefObject<HTMLDivElement>;
    this.state = {
      theme: themeManager.getTheme(),
      contentHeight: 0,
      overflow: overflowManager.getOverflow()
    };
  }

  getCurrentTheme = (): 'dark' | 'light' => {
    return document.documentElement.classList.contains('bp4-dark') ? 'dark' : 'light';
  };

  handleThemeChange = (event: any) => {
    const newTheme = event.detail?.theme ||
      (document.documentElement.classList.contains('bp4-dark') ? 'dark' : 'light');
    this.setState({ theme: newTheme });
  };

  componentDidMount() {
    this.updateContentHeight();
    window.addEventListener('resize', this.updateContentHeight);
    this.unsubscribe = themeManager.subscribe((theme) => {
      this.setState({ theme });
    });
    this.unsubscribeOverflow = overflowManager.subscribe((overflow) => {
      this.setState({ overflow });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateContentHeight);
  }

  updateContentHeight = () => {
    const container = this.contentRef.current;
    const { location } = this.props;
    const isMultiPanel = location?.pathname === '/multi_panel';
    if (container) {
      const windowHeight = window.innerHeight;
      let contentHeight;
      if (isMultiPanel) {
        contentHeight = windowHeight - this.BOTTOM_AREA_HEIGHT - 30;
      } else {
        contentHeight = windowHeight - this.TOP_AREA_HEIGHT - this.BOTTOM_AREA_HEIGHT;
      }
      this.setState({ contentHeight });
    }
  }

  componentDidUpdate(prevProps: MiddleAreaProps) {
    if (prevProps.location?.pathname !== this.props.location?.pathname) {
      this.updateContentHeight();
    }
  }

  handleOverflowChange = (overflow: 'auto' | 'hidden' | 'scroll' | 'visible') => {
    this.setState({ overflow });
  };

  render() {
    const { contentHeight, overflow } = this.state;
    const { theme } = this.state;
    const backgroundColor = theme === 'dark' ? '#1C2127' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
    const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
    return (
      <div
        ref={this.contentRef}
        style={{
          height: contentHeight > 0 ? `${contentHeight}px` : 'calc(100vh - 110px)',
          overflow: overflow,
          width: '100%',
          backgroundColor: backgroundColor,
          color: textColor,
          borderColor: borderColor,
        }}
      >
        {this.props.children}
      </div>
    )
  }
}

export default withRouter(MiddleArea);