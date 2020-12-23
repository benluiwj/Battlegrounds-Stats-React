import React, {Component} from "react";

import {Link} from "react-router-dom";

import Dashboard from "./Dashboard";
import DashboardItem from "./DashboardItem";
import Header from "../header/Header";
import {Layout, Alert} from "antd";

import TimeFrameSelector from "../header/TimeFrameSelector";
import "antd/dist/antd.css";
import moment from "moment";

import "./DashboardPage.css";
import {getQueryResult, playerFromUrl} from "../utilities/utilities";

import {withRouter} from "react-router";
import MmrOverTime from "./dashItems/MmrOverTime";
import TurnStatistics from "./dashItems/TurnStatistics";
import GamesOverTime from "./dashItems/GamesOverTime";
import hero_localize from "../utilities/localization";
import MmrSelector from "../header/MmrSelector";
import routes from "../utilities/routes";
import {archetypeItem} from "./dashItems/Archetypes";


const processHeroData = (data, player) => {
    let heroes = {};
    data.allGameRecords.forEach((item) => {
        let hero = item.hero;

        if (hero == "NOOOOOOOOOOOO" || hero == "unknown") return;

        if (!player && hero in hero_localize) hero = hero_localize[hero];

        if (!(hero in heroes))
            heroes[hero] = {
                count: 0,
                totalPos: 0,
                mmrCount: 0,
                totalMmrChange: 0,
            };

        heroes[hero].count++;
        heroes[hero].totalPos += item.position;

        if (item.mmrChange !== null) {
            heroes[hero].mmrCount++;
            heroes[hero].totalMmrChange += item.mmrChange;
        }
    });

    let result = Object.entries(heroes).map((data) => {
            let hero = data[0];
            let uriHero = encodeURI(hero);
            let heroLink = player ? routes.playerHero(player, uriHero) : routes.hero(uriHero);

            let mmrChange;
            if (data[1].mmrCount === 0) {
                mmrChange = "-";
            } else {
                let suffix = data[1].mmrCount === 1 ? "" : "s";
                let change = Math.round(data[1].totalMmrChange / data[1].mmrCount);
                let sign = "";
                if (change > 0) sign = '+';

                mmrChange = <span>
                    {sign}{change}
                    &nbsp;&nbsp;
                    <span style={{color: "#ee40f7"}}>({data[1].mmrCount} Game{suffix})</span>
                </span>;
            }

            let position = (data[1].totalPos / data[1].count).toFixed(2);

            return {
                'hero': <Link to={heroLink}>{hero}</Link>,
                'count': data[1].count,
                'avg_position': position,
                'mmr_change': mmrChange,
            }
        }
    );

    result.sort((a, b) => {
        if (a.avg_position > b.avg_position) return 1;
        if (a.avg_position < b.avg_position) return -1;
        return 0;
    });

    return result;
};


export function getTimeFrameFromStorage() {

    if (localStorage.timeFrame) {
        let tf = moment(localStorage.timeFrame);
        if (!tf.isValid()) return localStorage.timeFrame;
        return tf;
    }
    return "month";
}

const MIN_MMR = 0;
const MAX_MMR = 15000;

function getMmrFromStorage() {

    let minMmr = MIN_MMR, maxMmr = MAX_MMR;
    if (localStorage.minMmr && !isNaN(localStorage.minMmr)) {
        minMmr = localStorage.minMmr;
    }
    if (localStorage.maxMmr && !isNaN(localStorage.maxMmr)) {
        maxMmr = localStorage.maxMmr;
    }

    return [minMmr, maxMmr];
}

// holds logic that includes the page header
export class DashboardPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            timeFrame: getTimeFrameFromStorage(),
            mmr: getMmrFromStorage(),
        };
        this.setTimeFrame = this.setTimeFrame.bind(this);
        this.setMmr = this.setMmr.bind(this);
    }

    setMmr(mmr) {
        localStorage.minMmr = mmr[0];
        localStorage.maxMmr = mmr[1];
        this.setState({mmr: mmr});
    }

    setTimeFrame(t) {
        localStorage.timeFrame = moment.isMoment(t) ? t.format() : t;
        this.setState({timeFrame: t});
    }

    timeFrameToDate() {
        let tf;
        if (this.state.timeFrame === 'week') tf = moment().subtract(7, 'day');
        else if (this.state.timeFrame === 'month') tf = moment().subtract(1, 'month');
        else if (this.state.timeFrame === 'allTime') tf = moment("20190801", "YYYYMMDD");
        else tf = this.state.timeFrame;
        return tf.format();
    }

    render() {

        let queryParams = `dateTime:"${this.timeFrameToDate()}"`;
        let player = this.props.match.params.player;
        if (player) queryParams += `, player:"${playerFromUrl(player)}"`;
        else queryParams += `, minMmr:${this.state.mmr[0]}, maxMmr:${this.state.mmr[1]}`;

        const data = {
            "dashboardItems": []
        };

        if (player) {
            data.dashboardItems.push(MmrOverTime);
        } else {
            // in main page
            data.dashboardItems.push(GamesOverTime);
        }

        // add Top Heroes table
        data.dashboardItems.push({
            "id": "heroRankings",
            "layout": {"x": 0, "y": 8, "w": 4, "h": 10, "minW": 3},
            "query": "allGameRecords",
            "queryFields": {
                position: null,
                hero: null,
                mmrChange: null,
            },
            "vizState": {
                "chartType": "table",
                processData: (data) => {
                    return {
                        columns: [
                            {
                                title: 'Hero',
                                dataIndex: 'hero',
                            }, {
                                title: 'Average Position',
                                dataIndex: 'avg_position',
                            }, {
                                title: 'Count',
                                dataIndex: 'count',
                            }, {
                                title: 'Average MMR Change',
                                dataIndex: 'mmr_change',
                            },
                        ],
                        data: processHeroData(data, player),
                        key: 'hero',
                    }
                }
            },
            "bodyStyle": {padding: 0},
            "name": "Top Heroes",
            "__typename": "DashboardItem"
        });

        // add Archetypes table
        data.dashboardItems.push(archetypeItem);

        // add turn statistics table
        if (player) {
            data.dashboardItems.push(TurnStatistics(queryParams));
        }

        let alertMsg = <div>
            Nov 13, 2020 - Download the new <a href="https://github.com/jawslouis/Battlegrounds-Match-Data/releases">0.4.7
            plugin</a> to fix upload issues
            with the latest Hearthstone and HDT patch.
        </div>;

        return (
            <Layout style={{height: "100%"}}>
                <Header>
                    {!player &&
                    <MmrSelector mmr={this.state.mmr} updateMmr={this.setMmr} minMmrRange={MIN_MMR}
                                 maxMmrRange={MAX_MMR}/>}
                    <TimeFrameSelector timeFrame={this.state.timeFrame} setTimeFrame={this.setTimeFrame}/>
                </Header>
                <Layout.Content>
                    {/*<Alert message={alertMsg} type="info" style={{textAlign: "center"}}/>*/}
                    <DashboardQueryProcessor data={data} player={player} queryParams={queryParams}/>
                </Layout.Content>
            </Layout>
        );
    }
}

export const DashboardQueryProcessor = ({player, data, queryParams}) => {

    const queries = [];
    // data structure:
    // [ allGameRecord: {
    //     field1: [sub1, sub2, ... ],
    //     field2: ...
    // } ]
    data.dashboardItems.forEach(item => {
        if (!("query" in item)) return;

        if (!(item.query in queries)) {
            queries[item.query] = {};
        }
        for (let [key, val] of Object.entries(item.queryFields)) {
            if (!(key in queries[item.query])) {
                queries[item.query][key] = [];
            }

            if (val == null) continue;

            let fieldList = queries[item.query][key];
            for (let field of val) {
                if (!fieldList.includes(field)) {
                    fieldList.push(field);
                }
            }
        }
    });

    for (let [query, params] of Object.entries(queries)) {

        params["queryResult"] = getQueryResult(params, query, queryParams);
    }

    return <Dashboard dashboardItems={data.dashboardItems} player={player} queries={queries}/>;

};


export default withRouter(DashboardPage);
