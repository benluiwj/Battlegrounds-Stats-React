import minionType from "../../utilities/minionType";


const archetypeTests = [
    {
        name: "Divine Shields",
        optional: ["Divine Shield", "Drakonid Enforcer", "Selfless Hero"],
        optionalCount: 4,
    }, {
        name: "Murlocs",
        optional: ["MURLOC"],
        optionalCount: 4,
    }, {
        name: "Mechs",
        optional: ["MECHANICAL"],
        optionalCount: 4,
    }, {
        name: "Pirates",
        optional: ["PIRATE"],
        optionalCount: 4,
    }, {
        name: "Beasts",
        optional: ["BEAST"],
        optionalCount: 4,
    }, {
        name: "Elementals",
        optional: ["ELEMENTAL", "Nomi, Kitchen Nightmare", "Majordomo Executus"],
        optionalCount: 4,
    }, {
        name: "Demons",
        optional: ["DEMON", "Wrath Weaver"],
        optionalCount: 4,
    }, {
        name: "Dragons",
        optional: ["DRAGON", "Nadina the Red"],
        optionalCount: 4,
    }, {
        name: "Brann",
        required: {
            "Brann Bronzebeard": 1,
        },
        optional: null
    }, {
        name: "Lightfang",
        required: {
            "Lightfang Enforcer": 1,
        },
        optional: null
    }
];

export function minionsToArchetype(minions) {
    let minionList = minions.split(/\([^)]*\),?/)
        .filter(m => m !== "")
        .map(m => m.trim());

    let attributeList = minions.split(/,|(?:^|\),)(?:.*?\/\d+)?|\)/)
        .filter(m => m !== "")
        .map(m => m.trim());

    let combined = [...minionList, ...attributeList];
    minionList.forEach(m => {
        let type = minionType[m];
        combined.push(type);
    });

    let archetype = "Others";


    for (const test of archetypeTests) {

        let pass = true;

        if ('required' in test) {
            for (const [key, value] of Object.entries(test.required)) {
                if (combined.filter(m => key === m).length < value) {
                    pass = false;
                }
            }
        }

        if (test.optional !== null) {
            let optionalCount = 0;
            test.optional.forEach(opt => {
                optionalCount += combined.filter(m => opt === m).length;
            });

            if (optionalCount < test.optionalCount) {
                pass = false;
            }
        }
        if (pass) {
            archetype = test.name;
            break;
        }
    }

    return archetype;
}


const processArchetypeData = (data) => {
    let archetypes = {};
    data.allGameRecords.forEach((item) => {
        if (item.finalBoard == null) return;

        let archetype = minionsToArchetype(item.finalBoard.minions);

        if (!(archetype in archetypes))
            archetypes[archetype] = {
                count: 0,
                totalPos: 0,
            };

        archetypes[archetype].count++;
        archetypes[archetype].totalPos += item.position;
    });

    let result = Object.entries(archetypes).map((data) => {
            return {
                'archetype': data[0],
                'count': data[1].count,
                'avg_position': (data[1].totalPos / data[1].count).toFixed(2)
            }
        }
    );

    result.sort((a, b) => a.avg_position - b.avg_position);

    return result;
};

export const archetypeItem = {
    "id": "archetypes",
    "layout": {"x": 4, "y": 8, "w": 4, "h": 10, "minW": 3},
    "query": "allGameRecords",
    "queryFields": {
        position: null,
        finalBoard: ["minions"],
    },
    "vizState": {
        "chartType": "table",
        processData: (data) => {
            return {
                columns: [
                    {
                        title: 'Archetype',
                        dataIndex: 'archetype',
                    }, {
                        title: 'Average Position',
                        dataIndex: 'avg_position',
                    }, {
                        title: 'Count',
                        dataIndex: 'count',
                    }
                ],
                data: processArchetypeData(data),
                key: 'archetype',
            }
        }
    },
    "bodyStyle": {padding: 0},
    "name": "Top Archetypes",
    "__typename": "DashboardItem"
};