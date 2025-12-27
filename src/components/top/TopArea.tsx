import React from "react"
import TopMenuBar from "./TopMenu"
import TradingPanel from "./TopFunctionBar"


class TopArea extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <TopMenuBar />
                <TradingPanel />
            </div>
        )
    }
}
export default TopArea