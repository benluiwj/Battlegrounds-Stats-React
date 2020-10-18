import {gql} from "apollo-boost";
import {averageStats, processMinionString} from "../../utilities/minions";

const processTurnData = (data) => {
    let turns = {};
    data.allBoards.forEach((item) => {
        let turn = item.turn;
        if (!(turn in turns))
            turns[turn] = {
                count: 0,
                totalHealth: 0,
                totalAttack: 0,
            };

        const {stats} = processMinionString(item.minions);

        if (stats.length === 0) return;
        const {avgAtk, avgHealth} = averageStats(stats);
        turns[turn].count++;
        turns[turn].totalHealth += avgHealth;
        turns[turn].totalAttack += avgAtk;
    });

    let result = Object.entries(turns).map((data) => {
            let attack = (data[1].totalAttack / data[1].count).toFixed(1);
            let health = (data[1].totalHealth / data[1].count).toFixed(1);
            return {
                'turn': data[0],
                'count': data[1].count,
                'avgStats': `${attack} / ${health}`
            }
        }
    );

    result.sort((a, b) => a.turn - b.turn);

    return result;
};


const TurnStatistics = (queryParams) => ({
    "id": "turnStats",
    "layout": {"x": 8, "y": 8, "w": 4, "h": 10, "minW": 3},
    "rawQuery": gql`{
                    allBoards(${queryParams}) {
                        turn
                        minions
                    }
                }`,
    "vizState": {
        "chartType": "table",
        processData: (data) => {
            return {
                columns: [
                    {
                        title: 'Turn',
                        dataIndex: 'turn',
                    }, {
                        title: 'Average Minion Stats',
                        dataIndex: 'avgStats',
                    },
                    {
                        title: 'Count',
                        dataIndex: 'count',
                    }
                ],
                data: processTurnData(data),
                key: 'turn',
            }
        }
    },
    "bodyStyle": {padding: 0},
    "name": "Turn Statistics",
    "__typename": "DashboardItem"
});

export default TurnStatistics;