
const rootURL = document.getElementById("indexUrl").getAttribute("data-url");

export default {
    index: rootURL,
    admin: rootURL + "admin-page/",
    about: rootURL + "about/",
    archetype: rootURL + "archetypes/",
    hero: (hero) => rootURL + "hero/" + hero,
    playerHistory: (player) => rootURL + player + "/history",
    playerHero: (player, hero) => rootURL + player + "/hero/" + hero,
    playerDash: (player) => rootURL + player,
}

