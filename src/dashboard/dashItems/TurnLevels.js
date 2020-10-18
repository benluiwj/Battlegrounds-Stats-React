const processTurnLevelData = (data) => {

    let turns = [];

    data.allGameRecords.forEach((item) => {

        while (turns.length < item.endTurn) {
            turns.push({
                turn: turns.length + 1,
                t1: 0,
                t2: 0,
                t3: 0,
                t4: 0,
                t5: 0,
                t6: 0,
            });
        }

        for (let t = 0; t < item.endTurn; t++) {
            if (!item.t2 || t + 1 < item.t2) turns[t].t1 += 1;
            else if (!item.t3 || t + 1 < item.t3) turns[t].t2 += 1;
            else if (!item.t4 || t + 1 < item.t4) turns[t].t3 += 1;
            else if (!item.t5 || t + 1 < item.t5) turns[t].t4 += 1;
            else if (!item.t6 || t + 1 < item.t6) turns[t].t5 += 1;
            else turns[t].t6 += 1;
        }
    });

    let series = turns.map(turn => {

        let total = turn.t1 + turn.t2 + turn.t3 + turn.t4 + turn.t5 + turn.t6;

        return {
            turn: "Turn " + turn.turn,
            totalCount: total,
            t1: turn.t1 * 100 / total,
            t2: turn.t2 * 100 / total,
            t3: turn.t3 * 100 / total,
            t4: turn.t4 * 100 / total,
            t5: turn.t5 * 100 / total,
            t6: turn.t6 * 100 / total,
        }
    });


    let seriesNames = [];
    for (let t = 1; t < 7; t++) {
        seriesNames.push({
            key: 't' + t,
            title: 'Tier ' + t,
        });
    }


    return {
        data: series,
        seriesNames: seriesNames,
    }
};

export const TurnLevels = {
    "id": "leveling",
    "layout": {"x": 0, "y": 0, "w": 12, "h": 8},
    "query": "allGameRecords",
    "queryFields": {
        t2: null,
        t3: null,
        t4: null,
        t5: null,
        t6: null,
        endTurn: null,
    },
    "vizState": {
        "chartType": "bar",
        processData: processTurnLevelData,
    },
    "name": `Tavern Tiers Each Turn`,
    "__typename": "DashboardItem"
};