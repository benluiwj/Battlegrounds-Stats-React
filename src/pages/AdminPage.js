import React, {Component} from "react";

import Header from "../header/Header";
import {Layout} from "antd";

import TimeFrameSelector from "../header/TimeFrameSelector";

import "antd/dist/antd.css";
import moment from "moment";

import "../dashboard/DashboardPage.css";
import {playerFromUrl} from "../utilities/utilities";

import {withRouter} from "react-router";
import GamesOverTime from "../dashboard/dashItems/GamesOverTime";
import {DashboardQueryProcessor, getTimeFrameFromStorage} from "../dashboard/DashboardPage";


const processPlayerData = (data) => {

    let gameHistory = {};
    let mmrRanges = [];

    data.allGameRecords.forEach((item) => {
        let date = moment(item.dateTime).format("LL");
        if (!(date in gameHistory)) gameHistory[date] = {};
        let mmrRange = Math.floor(item.mmr / 1000) * 1000;

        if (!(mmrRanges.includes(mmrRange))) mmrRanges.push(mmrRange);

        gameHistory[date][item.player] = mmrRange; // use latest mmr. overwrite earlier mmr in the day
    });


    let series = Object.entries(gameHistory)
        .sort((a, b) => {
            return moment(a[0]).diff(moment(b[0]));
        }).map((item) => {

            let mmrCounts = {};
            for (const player in item[1]) {
                let m = item[1][player];
                if (!(m in mmrCounts)) mmrCounts[m] = 0;
                mmrCounts[m]++;
            }

            return {
                date: item[0],
                ...mmrCounts,
            }
        });

    let seriesNames = [];
    mmrRanges.sort((a, b) => parseInt(a) - parseInt(b));
    for (let m of mmrRanges) {
        seriesNames.push({
            key: m,
            title: m + ' to ' + (parseInt(m) + 999),
        });
    }

    return {
        data: series,
        seriesNames: seriesNames,
        xAxisFormat: "LL",
        unit: "Players",
    }
};


// holds logic that includes the page header
export class AdminPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            timeFrame: getTimeFrameFromStorage(),
            mmr: [0, 15000],
        };
        this.setTimeFrame = this.setTimeFrame.bind(this);
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

        data.dashboardItems.push(GamesOverTime);

        const playersOverTime = {
            "id": "playersOverTime",
            "layout": {"x": 0, "y": 9, "w": 12, "h": 8},
            "query": "allGameRecords",
            "queryFields": {
                dateTime: null,
                player: null,
                mmr: null,
            },
            "vizState": {
                chartType: "area",
                processData: processPlayerData,
            },
            "name": "Players Over Time",
            "__typename": "DashboardItem"
        };

        data.dashboardItems.push(playersOverTime);

        return (
            <Layout style={{height: "100%"}}>
                <Header>
                    <TimeFrameSelector timeFrame={this.state.timeFrame} setTimeFrame={this.setTimeFrame}/>
                </Header>
                <Layout.Content>
                    <DashboardQueryProcessor data={data} player={player} queryParams={queryParams}/>
                </Layout.Content>
            </Layout>
        );
    }
}


export default withRouter(AdminPage);
