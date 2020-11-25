import React from "react";
import {Layout} from 'antd';

import ChartRenderer from "../chartComponents/ChartRenderer";
import {dateTimeFormatter, sortRecordsByDate} from "../utilities/utilities";

import "./HistoryPage.css"
import {gql} from "apollo-boost";
import Header from "../header/Header";
import {useParams} from "react-router";
import {useQuery} from "@apollo/react-hooks";

const HistoryPage = () => {
    let {player} = useParams();
    player = player.replace("-", "#");

    const vizState = {
        "chartType": "expandableTable",
        processData: (data) => {
            return {
                columns: [
                    {
                        text: 'Date & Time',
                        dataField: 'dateTime',
                    }, {
                        text: 'Hero',
                        dataField: 'hero',
                    }, {
                        text: 'Minion Types in Game',
                        dataField: 'minionTypes',
                    }, {
                        text: 'Position',
                        dataField: 'position',
                    }, {
                        text: 'MMR',
                        dataField: 'mmr',
                    }, {
                        text: 'MMR Change',
                        dataField: 'mmrChange',
                    },
                ],
                data: processHistoryData(data),
                key: 'dateTime',
                expandedKey: 'key',
                expandedColumns: [
                    {
                        text: 'Hero',
                        dataField: 'hero',
                    }, {
                        text: 'Turn',
                        dataField: 'turn',
                    }, {
                        text: 'Minions',
                        dataField: 'minions',
                        formatter: (cell, row, rowIndex, formatExtraData) => {
                            return <div dangerouslySetInnerHTML={{__html: cell}}/>;
                        }
                    }, {
                        text: 'Archetype',
                        dataField: 'archetype',
                    }, {
                        text: 'Average Stats',
                        dataField: 'avgStats',
                        formatter: (cell, row, rowIndex, formatExtraData) => {
                            return <div dangerouslySetInnerHTML={{__html: cell}}/>;
                        }
                    }, {
                        text: 'Result',
                        dataField: 'combatResult',
                    },
                ],
            }
        }
    };

    const queryResult = useQuery(gql`{
                    allGameRecords(player:"${player}") {
                        position
                        mmr
                        mmrChange
                        minionTypes
                        hero
                        dateTime
                        id
                    }
                }`);

    return <Layout style={{height: "100%"}}>
        <Header/>
        <Layout.Content className="layout" style={{padding: '0 50px'}}>
            <div className="site-layout-content">
                <ChartRenderer item={{vizState: vizState, query: "allGameRecords"}} queryResult={queryResult}/>
            </div>
        </Layout.Content>
    </Layout>;
};

function formatMinionTypes(text){
    if (text == null) return null;

    let t = text.split(/[;:]/g);
    return <>{t[1]}, <span style={{textDecoration:"line-through"}}>{t[3]}</span></>;

}

const processHistoryData = (data) => {

    let formatter = dateTimeFormatter("LLL");

    let result = data.allGameRecords
        .sort(sortRecordsByDate)
        .map((item) => {
            return {
                ...item,
                minionTypes: formatMinionTypes(item.minionTypes),
                dateTime: formatter(item.dateTime),
            }
        });

    return result.reverse();
};


export default HistoryPage;