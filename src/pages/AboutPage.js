import {Layout} from "antd";
import {Row, Col, Divider} from 'antd';
import Header from "../header/Header";
import React from "react";
import {withRouter} from "react-router";

const AboutPage = () =>
    <Layout style={{height: "100%"}}>
        <Header/>
        <Layout.Content className="layout" style={{padding: '0 50px'}}>
            <div className="site-layout-content" style={{fontSize: "1.3em"}}>
                <p><b>Battlegrounds Stats</b> is an online dashboard that automatically tracks your match history and
                    statistics for Hearthstone Battlegrounds.
                    This is achieved by installing a plugin (Windows only) for the Hearthstone Deck
                    Tracker.
                </p>
                <Divider />
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <h4>Plugin</h4>
                        <p> Follow the instructions <a
                            href="https://github.com/benluiwj/Battlegrounds-Match-Data">here</a> to download
                            and install the plugin.</p>
                        <p>Please file issues at the <a
                            href="https://github.com/benluiwj/Battlegrounds-Match-Data/issues">plugin issue tracker</a>.</p>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <h4>Dashboard</h4>
                        <p>The dashboard source code is available at <a
                            href="https://github.com/jawslouis/Battlegrounds-Stats-React">GitHub</a>.</p>
                        <p>Please file issues for the dashboard at the <a
                            href="https://github.com/jawslouis/Battlegrounds-Stats-React/issues">dashboard issue tracker</a>.</p>
                    </Col>
                </Row>
            </div>
        </Layout.Content>
    </Layout>;


export default withRouter(AboutPage);
