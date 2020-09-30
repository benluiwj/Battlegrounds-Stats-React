import {gql} from "apollo-boost";


import moment from "moment";


const processGameData = (data) => {

    let gameHistory = {};

    let mmrRanges = [];

    data.allGameRecords.forEach((item) => {
        let date = moment(item.dateTime).format("LL");
        if (!(date in gameHistory)) gameHistory[date] = {};

        let mmrRange = Math.floor(item.mmr / 1000) * 1000;

        if (!(mmrRange in gameHistory[date])) {
            gameHistory[date][mmrRange] = 0;
            if (!(mmrRanges.includes(mmrRange))) mmrRanges.push(mmrRange);
        }
        gameHistory[date][mmrRange]++;
    });

    let mmrDefaultCount = {};
    for (let m of mmrRanges) {
        mmrDefaultCount[m] = 0;
    }

    let series = Object.entries(gameHistory)
        .sort((a, b) => {
            return moment(a[0]).diff(moment(b[0]));
        }).map((item) => ({
                date: item[0],
                // ...mmrDefaultCount,
                ...item[1],
            }
        ));

    let seriesNames = [];
    mmrRanges.sort((a,b)=> parseInt(a) - parseInt(b));
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
        unit: "Games",
    }

};


const GamesOverTime = {
    "id": "gamesOverTime",
    "layout": {"x": 0, "y": 0, "w": 12, "h": 8},
    "query": "allGameRecords",
    "queryFields": {
        dateTime: null,
        mmr: null,
    },
    "vizState": {
        chartType: "area",
        processData: processGameData,
    },
    "name": "Games Over Time (by MMR)",
    "__typename": "DashboardItem"
};


export default GamesOverTime;