import BootstrapTable from 'react-bootstrap-table-next';
import "./ExpandableTable.css";
import React from "react";
import {CaretDownOutlined, CaretRightOutlined, PlusOutlined, MinusOutlined} from "@ant-design/icons";
import ChartRenderer from "../chartComponents/ChartRenderer";
import {gql} from "apollo-boost";
import {getQueryResult} from "../utilities/utilities";
import {useQuery} from "@apollo/react-hooks";
import {
    getArchetypesFromStorage,
    minionsAndAttributesToArchetype,
} from "../dashboard/dashItems/Archetypes";
import {averageStats, processMinionString} from "../utilities/minions";

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
    const typeTest = getArchetypesFromStorage();
    return item.gameRecord.boardSet.map(d => {
        let {minions, attributes, stats} = processMinionString(d.minions);
        d.archetype = minionsAndAttributesToArchetype(typeTest, minions, attributes);
        d.self = d.isSelf ? "Yes" : "";
        d.key = `${d.hero}-${d.turn}-${d.isSelf}`;

        if (stats.length > 0) {
            const {avgAtk, avgHealth} = averageStats(stats);
            d.avgStats = `<span className="no-wrap">${avgAtk.toFixed(1)} / ${avgHealth.toFixed(1)}</span>`;
        } else {
            d.avgStats = '-';
        }
        return d;
    }).sort(sortHistory);
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
                        minions
                    }
                }
            }`;

    return <ChartRenderer item={{
        query: "gameRecord",
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
    }}/>;
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