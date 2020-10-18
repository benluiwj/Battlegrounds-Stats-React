import Dropdown from "antd/es/dropdown";
import Button from "antd/lib/button";
import DownOutlined from "@ant-design/icons/lib/icons/DownOutlined";
import React, {Component} from "react";
import Menu from "antd/es/menu";
import {DatePicker} from 'antd';
import moment from "moment";


const keyToText = {
    week: 'This Week',
    month: 'This Month',
    allTime: 'All Time',
};

function timeFrameToText(tf) {
    if (moment.isMoment(tf)) return "from " + tf.format("LL");
    if (tf in keyToText) return keyToText[tf];
    return tf;
}

function timeFrameToSelectedKey(tf) {
    if (tf in keyToText) return tf;
    return 'others';
}

class TimeFrameSelector extends Component {

    constructor(props) {
        super(props);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleDatePick = this.handleDatePick.bind(this);
        this.handleVisibleChange = this.handleVisibleChange.bind(this);
        this.state = {visible: false};
    }

    handleMenuClick(e) {
        if (e.key in keyToText) {
            this.setState({visible: false});
            this.props.setTimeFrame(e.key);
        }

    }

    handleDatePick(date, dateString) {
        this.props.setTimeFrame(date);
    }

    handleVisibleChange(flag) {
        this.setState({visible: flag});
    }

    render() {

        const menu = (
            <Menu onClick={this.handleMenuClick}
                  theme="dark"
                  id="timeFrameSelector"
                  selectedKeys={[timeFrameToSelectedKey(this.props.timeFrame)]}>
                <Menu.Item key="week">
                    {timeFrameToText("week")}
                </Menu.Item>
                <Menu.Item key="month">
                    {timeFrameToText("month")}
                </Menu.Item>
                <Menu.Item key="allTime">
                    {timeFrameToText("allTime")}
                </Menu.Item>
                <Menu.Item key="others">
                    <DatePicker onChange={this.handleDatePick}
                                format="LL"
                                value={moment.isMoment(this.props.timeFrame) ? this.props.timeFrame : null}
                                showToday={false}
                                className="timeFramePicker"

                    />
                </Menu.Item>
            </Menu>);


        return <Dropdown overlay={menu}
                         onVisibleChange={this.handleVisibleChange}
                         visible={this.state.visible}
        >
            <Button ghost>
                Time Frame: {timeFrameToText(this.props.timeFrame)} <DownOutlined/>
            </Button>
        </Dropdown>;
    }
}

export default TimeFrameSelector;