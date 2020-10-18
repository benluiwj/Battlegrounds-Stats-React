import Dropdown from "antd/es/dropdown";
import Button from "antd/lib/button";
import {Slider} from "antd";
import DownOutlined from "@ant-design/icons/lib/icons/DownOutlined";
import React, {Component} from "react";
import Menu from "antd/es/menu";
import "./MmrSelector.css";

class MmrSelector extends Component {

    constructor(props) {
        super(props);
        this.handleVisibleChange = this.handleVisibleChange.bind(this);
        this.state = {visible: false};
    }


    handleVisibleChange(flag) {
        this.setState({visible: flag});
    }

    render() {

        const menu = (
            <Menu theme="dark">
                <Menu.Item>
                    <Slider range
                            tooltipPlacement="bottom"
                            defaultValue={this.props.mmr}
                            min={this.props.minMmrRange}
                            max={this.props.maxMmrRange}
                            step={500}
                            onAfterChange={(value)=>{this.props.updateMmr(value)}}
                    />
                </Menu.Item>
            </Menu>);


        return <Dropdown overlay={menu}
                         onVisibleChange={this.handleVisibleChange}
                         visible={this.state.visible}
        >
            <Button style={{marginRight:"1em"}} ghost>
                MMR Range: {this.props.mmr[0]} to {this.props.mmr[1]} <DownOutlined/>
            </Button>
        </Dropdown>;
    }
}

export default MmrSelector;