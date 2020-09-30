import BootstrapTable from 'react-bootstrap-table-next';
import "./ExpandableTable.css";
import React from "react";
import {CaretDownOutlined, CaretRightOutlined, PlusOutlined, MinusOutlined} from "@ant-design/icons";
import ChartRenderer from "./ChartRenderer";
import {gql} from "apollo-boost";
import {getQueryResult} from "../utilities/utilities";
import {useQuery} from "@apollo/react-hooks";

// Class is created to properly animate expanding rows of varying heights
class ExpandableRow extends BootstrapTable {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidMount() {
        let elem = this.myRef.current.parentNode;
        const setHeight = () => {
            elem.parentNode.style.maxHeight = elem.offsetHeight + 'px';
        };
        setTimeout(setHeight, 20);
        elem.parentNode.id = 'expandRow-' + this.props.index;
    }

    render() {
        return (<div ref={this.myRef} className="expand-row">
            {super.render()}
        </div>);
    }
}

const collapseRow = (row) => {
    document.querySelector("#expandRow-" + row).style.maxHeight = 0;
};

const processExpandedData = (item) => {
    return item.gameRecord.boardSet.map(d => {
        d.minions = minionSetToString(d.minionSet);
        d.self = d.isSelf ? "Yes" : "";
        d.key = `${d.hero}-${d.turn}-${d.isSelf}`;
        d.avgStats = `<span className="no-wrap">${d.avgAttack} / ${d.avgHealth}</span>`;
        return d;
    }).sort(sortHistory);
};


function minionToString(minion) {
    let keywords = "";
    if (minion.keywords) keywords = ' ' + minion.keywords;
    return `<span class="no-wrap">${minion.name} (${minion.attack}/${minion.health}${keywords})</span>`;
}


const minionSetToString = (mSet) => {
    return mSet.map(m => minionToString(m)).join(", ");
};


function sortHistory(a, b) {
    if (a.turn == b.turn) {
        return a.isSelf ? -1 : 1;
    }
    return b.turn - a.turn;
}


function renderExpandableRow(record, resultSet, index) {

    let rawQuery = gql`{
                gameRecord(id:${record.id}) {
                    boardSet {
                        hero
                        isSelf
                        dateTime
                        combatResult
                        turn
                        avgAttack
                        avgHealth
                        archetype
                        minionSet {
                           name
                           attack
                           health
                           keywords
                        }
                    }
                }
            }`;

    return <ChartRenderer item={{
        query:"gameRecord",
        rawQuery: rawQuery,
        vizState: {
            "chartType": "expandableRow",
            processData: (data) => {
                return {
                    columns: resultSet.expandedColumns,
                    data: processExpandedData(data),
                    keyField: resultSet.expandedKey,
                    index: index,
                };
            }
        }
    }} />;
}

const ExpandableTable = ({resultSet}) => {
    return (
        <BootstrapTable
            columns={resultSet.columns}
            data={resultSet.data}
            keyField={resultSet.key}
            rowClasses="main-row"
            id="main-table"
            expandRow={{
                renderer: (record, index) => renderExpandableRow(record, resultSet, index),
                showExpandColumn: true,
                onExpand: (row, isExpand, rowIndex, e) => {
                    if (!isExpand) {
                        collapseRow(rowIndex);
                    }
                },
                expandColumnRenderer: ({expanded, rowKey, expandable}) => {
                    if (expanded) return <CaretDownOutlined/>;
                    else return <CaretRightOutlined/>;
                },
                expandHeaderColumnRenderer: ({isAnyExpands}) => {
                    if (isAnyExpands) return <MinusOutlined/>;
                    else return <PlusOutlined/>;
                }
            }}

        />
    )
};


export {ExpandableTable, ExpandableRow};