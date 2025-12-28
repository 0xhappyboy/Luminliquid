import React from "react"
import TopMenuBar from "./TopMenu"
import TopFunctionBar from "./TopFunctionBar"


class TopArea extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <TopMenuBar />
                <TopFunctionBar />
            </div>
        )
    }
}
export default TopArea