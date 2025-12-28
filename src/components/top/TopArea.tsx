import React from "react"
import TopMenuBar from "./TopMenu"
import TopFunctionBar from "./TopFunctionBar"
import { useLocation } from 'react-router-dom'

const withLocation = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const location = useLocation();
    return <Component {...props} location={location} />;
  };
};

class TopArea extends React.Component<{ location?: any }, {}> {
    render() {
        const { location } = this.props;
        const isMultiPanel = location?.pathname === '/multi_panel';
        
        return (
            <div>
                <TopMenuBar />
                {!isMultiPanel && <TopFunctionBar />}
            </div>
        )
    }
}

export default withLocation(TopArea);