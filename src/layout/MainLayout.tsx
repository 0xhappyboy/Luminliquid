import React from "react"
import TopMenuBar from "../components/top/TopMenu"
import TopMenu from "../components/top/TopMenu"
import TopArea from "../components/top/TopArea"
import BottomArea from "../components/bottom/BottomArea"
import MiddleArea from "../components/center/MiddleArea"

class MainLayout extends React.Component {
    render() {
        return (
            <>
                <TopArea />
                <MiddleArea >
                </MiddleArea>
                <BottomArea />
            </>
        )
    }
}

export default MainLayout