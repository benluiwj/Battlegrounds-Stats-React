import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import {
    BrowserRouter as Router, Switch, Route
} from "react-router-dom";

import DashboardPage from "./dashboard/DashboardPage";
import HeroPage from "./pages/HeroPage";
import HistoryPage from "./history/HistoryPage";
import routes from "./utilities/routes";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import ArchetypePage from "./pages/ArchetypePage";

ReactDOM.render(
    <Router>
        <App>
            <Switch>
                <Route key="index" exact path={routes.index} component={DashboardPage}/>
                <Route key="admin" exact path={routes.admin} component={AdminPage}/>
                <Route key="about" exact path={routes.about} component={AboutPage}/>
                <Route key="archetype" exact path={routes.archetype} component={ArchetypePage}/>
                <Route key="hero" exact path={routes.hero(":hero")} component={HeroPage}/>
                <Route key="history" exact path={routes.playerHistory(":player")} component={HistoryPage}/>
                <Route key="playerHero" exact path={routes.playerHero(":player", ":hero")} component={HeroPage}/>
                <Route key="playerDash" exact path={routes.playerDash(":player")} component={DashboardPage}/>
            </Switch>
        </App>
    </Router>
    , document.getElementById("root")
);

