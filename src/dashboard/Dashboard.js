import React, {Component} from "react";
import RGL, {WidthProvider} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import DashboardItem from "./DashboardItem";

const ReactGridLayout = WidthProvider(RGL);

const defaultLayout = i => ({
    x: i.x || 0,
    y: i.y || 0,
    w: i.w || 4,
    h: i.h || 8,
    minW: i.minW || 4,
    minH: 8
});


function getStorageString(player) {
    if (player) return player;
    return "main";
}

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {};


        let storageString = getStorageString(props.player);
        if ("layout" in localStorage) {
            let allLayout = JSON.parse(localStorage.layout);
            // localstorage.layout data structure:
            // {
            //     user1: {"layout1":[...], "layout2":[...]},
            //     main: {"layout1":[...], "layout2":[...]}
            // }
            if (storageString in allLayout) this.state = allLayout[storageString];
        }

        this.updateLayoutHeight = this.updateLayoutHeight.bind(this);
        this.processDashboardItem = this.processDashboardItem.bind(this);
    }

    processDashboardItem(item) {
        let layoutCallback = this.updateLayoutHeight(item.id);
        return (
            <div key={item.id}>
                <DashboardItem item={item} layoutCallback={layoutCallback} queries={this.props.queries}/>
            </div>
        );
    }

    updateLayoutHeight(layoutId) {
        return (h) => {
            this.setState((state, props) => {
                let newLayout = {};

                if (layoutId in state) newLayout = {[layoutId]: state[layoutId]};
                else newLayout[layoutId] = {};

                newLayout[layoutId].h = Math.ceil(h / 60 + 1);
                return newLayout;
            });
        };
    }

    render() {
        let {dashboardItems, player} = this.props;
        let storageString = getStorageString(player);

        let onLayoutChange = newLayout => {

            let newLayoutState = {};
            newLayout.forEach(i => {
                newLayoutState[i.i] = i;
            });

            let storedState = {};
            if ("layout" in localStorage) {
                storedState = JSON.parse(localStorage.layout);
            }

            storedState[storageString] = newLayoutState;
            localStorage.layout = JSON.stringify(storedState);
        };



        let layoutProp = dashboardItems.map(item => {
            let layout;

            if (item.id in this.state) layout = {...defaultLayout(item.layout), ...this.state[item.id]};
            else layout = defaultLayout(item.layout);

            layout.i = item.id;
            return layout;
        });

        return (
            <ReactGridLayout cols={12} rowHeight={50} onLayoutChange={onLayoutChange} layout={layoutProp}>
                {dashboardItems.map(this.processDashboardItem)}
            </ReactGridLayout>
        );
    }
}


export default Dashboard;
