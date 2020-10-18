export function processMinionString(text) {

    let matches = text.matchAll(/([\w ']+)\((\d+\/\d+)([^)]*)\),?/g);

    let minions = [],
        stats = [],
        attributes = [];

    for (const match of matches) {
        minions.push(match[1]);
        stats.push(match[2]);
        attributes = [...attributes, ...match[3].split(',')];
    }

    return {
        minions: minions.filter(m => m !== "").map(m => m.trim()),
        stats: stats.filter(m => m !== "").map(m => m.trim()),
        attributes: attributes.filter(m => m !== "").map(m => m.trim()),
    };

}

/* Input: A list of strings ["Atk/Health", ...]
*  Returns: {avgAtk, avgHealth}
* */
export function averageStats(statsList) {

    let totalAtk = 0., totalHealth = 0.;
    for (const stats of statsList) {
        let [atk, health] = stats.split('/');
        totalAtk += parseFloat(atk);
        totalHealth += parseFloat(health);
    }

    return {
        avgAtk: totalAtk / statsList.length,
        avgHealth: totalHealth / statsList.length,
    }

}