import React, {Component} from "react";
import {Card, Dropdown} from "antd";
import {MenuOutlined} from "@ant-design/icons";
import ChartRenderer from "../chartComponents/ChartRenderer";


const DashboardItemDropdown = ({menu}) => {
    return (
        <Dropdown
            overlay={menu}
            placement="bottomLeft"
            trigger={["click"]}
        >
            <MenuOutlined style={{color: "white"}}/>
        </Dropdown>
    );
};

class DashboardItem extends Component {

    constructor(props) {
        super(props);
        this.state = {};

        let id =  this.props.item.id;
        if (id in localStorage) {
            this.state = JSON.parse(localStorage[id]);
        }

        this.updateState = this.updateState.bind(this);
    }

    updateState(newState) {
        this.setState(newState);
    }

    render() {
        let {item, layoutCallback, queries} = this.props;

        let extra = "";
        if ("menu" in item) {
            extra = <DashboardItemDropdown menu={item.menu(this.state, this.updateState)}/>;
            item.vizState.processData = item.vizState.createProcess(this.state);
        } else if ("titleButton" in item){
            extra = item.titleButton;
        }

        // save latest state here
        localStorage[item.id] = JSON.stringify(this.state);

        let queryResult = "query" in item ? queries[item.query]["queryResult"] : null;

        return <Card
            title={item.name}
            style={{
                height: "100%",
                width: "100%"
            }}
            bodyStyle={item.bodyStyle}
            extra={extra}
        >
            <ChartRenderer item={item} layoutCallback={layoutCallback} queryResult={queryResult}/>
        </Card>;
    }
}


export default DashboardItem;
