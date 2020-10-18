import React from "react";
import Table from "antd/es/table";

class DashWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.updateDashDimensions = this.updateDashDimensions.bind(this);
    }

    updateDashDimensions() {
        let height = this.myRef.current.offsetHeight;
        this.props.layoutCallback(height);
    }

    componentDidMount() {
        this.updateDashDimensions();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.dataSource.length !== this.props.dataSource.length) {
            this.updateDashDimensions();
        }
    }

    render() {
        return (<div ref={this.myRef}>
            <Table pagination={false}
                   columns={this.props.columns}
                   dataSource={this.props.dataSource}
                   rowKey={this.props.rowKey}
                   size="small"
            />
        </div>);
    }

}

export default DashWrapper;