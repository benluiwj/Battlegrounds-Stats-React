import {Layout} from "antd";
import Header from "../components/Header";
import React from "react";
import {withRouter} from "react-router";

const AboutPage = () =>
    <Layout style={{height: "100%"}}>
        <Header/>
        <Layout.Content className="layout" style={{padding: '0 50px'}}>
            <div className="site-layout-content" style={{fontSize:"1.3em"}}>
                <p><b>Battlegrounds Stats</b> is an online dashboard that automatically tracks your match history and statistics for Hearthstone Battlegrounds.
                    This is achieved by installing a plugin (Windows only) for the Hearthstone Deck
                    Tracker.
                </p>

                <p> Follow the instructions <a
                    href="https://github.com/jawslouis/Battlegrounds-Match-Data">here</a> to download
                    and install the plugin.</p>

                <p>Please file issues for the plugin or the dashboard at the <a href="https://github.com/jawslouis/Battlegrounds-Match-Data/issues">issue tracker</a>.</p>
            </div>
        </Layout.Content>
    </Layout>;


export default withRouter(AboutPage);