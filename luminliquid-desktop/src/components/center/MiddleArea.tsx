import React from "react"
import { themeManager } from "../../globals/theme/ThemeManager";

interface MiddleAreaProps { }

interface MiddleAreaState {
  contentHeight: number;
  theme: 'dark' | 'light',
}

class MiddleArea extends React.Component<MiddleAreaProps, MiddleAreaState> {

  private contentRef: React.RefObject<HTMLDivElement>;
  private unsubscribe: (() => void) | null = null;

  constructor(props: MiddleAreaProps) {
    super(props);
    this.contentRef = React.createRef() as React.RefObject<HTMLDivElement>;
    this.state = {
      theme: themeManager.getTheme(),
      contentHeight: 0
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
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateContentHeight);
  }

  updateContentHeight = () => {
    const container = this.contentRef.current;
    if (container) {
      const headerHeight = 84;
      const footerHeight = 54;
      const windowHeight = window.innerHeight;
      const contentHeight = window.innerHeight - headerHeight - footerHeight;
      this.setState({ contentHeight });
    }
  }

  render() {
    const { contentHeight } = this.state;
    const { theme, } = this.state;
    const backgroundColor = theme === 'dark' ? '#1C2127' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#F5F8FA' : '#182026';
    const borderColor = theme === 'dark' ? '#394B59' : '#DCE0E5';
    return (
      <div
        ref={this.contentRef}
        style={{
          height: contentHeight > 0 ? `${contentHeight}px` : 'calc(100vh - 110px)',
          overflow: 'auto' as 'auto',
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

export default MiddleArea