import {gql} from "apollo-boost";
import {sortRecordsByDate} from "../../utilities/utilities";
import {Menu} from "antd";
import React from "react";


function average(nums) {
    return nums.reduce((a, b) => (a + b)) / nums.length;
}

const processMmrData = (state) => (data) => {

    let {showMovingAvg, showWeightedAvg} = state;

    let series = data.allGameRecords
        .sort(sortRecordsByDate)
        .map((item) => {
            return {'x': item.dateTime, 'mmr': item.mmr, 'pos': item.position}
        });

    let history = [];
    let expAvg = series.length > 0 ? series[0].pos : 0;
    const factor = 0.12424;


    series.forEach((d) => {
        if (showWeightedAvg) {
            expAvg = d.pos * factor + expAvg * (1 - factor);
            d.weightedAvg = expAvg.toFixed(2);
        }

        if (showMovingAvg) {
            history.push(d.pos);
            if (history.length > 20) history.shift();
            d.avg = average(history).toFixed(2);
        }
    });

    let lowestPos = 1;

    if (showWeightedAvg) {
        lowestPos = Math.max(lowestPos, Math.max(...series.map((item) => item.weightedAvg)));
    }

    if (showMovingAvg) {
        lowestPos = Math.max(lowestPos, Math.max(...series.map((item) => item.avg)));
    }

    let seriesNames = [{
        key: 'mmr',
        title: 'MMR',
        axis: "mmr"
    }];

    if (showWeightedAvg) {
        seriesNames.push({
            key: 'weightedAvg',
            title: 'Exponential Moving Average',
            axis: "position"
        });
    }

    if (showMovingAvg) {
        seriesNames.push({
            key: 'avg',
            title: 'Moving Average',
            axis: "position"
        });
    }

    return {
        data: series,
        seriesNames: seriesNames,
        minData: Math.min(...data.allGameRecords.map((item) => item.mmr)) - 100,
        lowestPos: lowestPos,
        leftAxisLabel: "MMR",
        xAxisFormat: "LLL",
    }
};

function createMenu(state, setState) {

    let showMvgAvg = "showMovingAvg" in state && state.showMovingAvg;
    let showWghtAvg = "showWeightedAvg" in state && state.showWeightedAvg;

    return <Menu>
        <Menu.Item onClick={() => setState({showMovingAvg: !showMvgAvg})}>
            {showMvgAvg ? "Hide" : "Show"} Finishing Position (Moving Average)
        </Menu.Item>
        <Menu.Item onClick={() => setState({showWeightedAvg: !showWghtAvg})}>
            {showWghtAvg ? "Hide" : "Show"} Finishing Position (Exponential Moving Average)
        </Menu.Item>
    </Menu>;
}

const MmrOverTime = {
    "id": "mmrOverTime",
    "layout": {"x": 0, "y": 0, "w": 12, "h": 8},
    "query": "allGameRecords",
    "queryFields": {
        mmr: null,
        dateTime: null,
        position: null,
    },
    "vizState": {
        "chartType": "line",
        createProcess: processMmrData
    },
    "name": "MMR Over Time",
    "menu": createMenu,
    "__typename": "DashboardItem"
};

export default MmrOverTime;