import React from "react";
import {Link, useParams} from "react-router-dom";
import {withRouter} from "react-router";
import {Layout, Menu} from "antd";
import routes from "../utilities/routes";

const Header = ({children}) => {

    let {player} = useParams();

    return (
        <Layout.Header style={{padding: "0 32px"}}>
            <div style={{float: "left"}}>
                <h2 style={{
                    color: "#fff",
                    margin: 0,
                    marginRight: "1em",
                    display: "inline",
                    width: 100,
                    lineHeight: "54px"
                }}>
                    <Link to={routes.index} style={{color:"white"}}>Battlegrounds Stats</Link>
                </h2>
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                style={{
                    lineHeight: "64px"
                }}>

                {player ?
                    <Menu.Item key={routes.playerDash(player)}>
                        <Link to={routes.playerDash(player)}>Dashboard</Link>
                    </Menu.Item>
                    :
                    <Menu.Item key={routes.index}>
                        <Link to={routes.index}>Dashboard</Link>
                    </Menu.Item>
                }

                {player &&
                <Menu.Item key={routes.playerHistory(player)}>
                    <Link to={routes.playerHistory(player)}>Match History</Link>
                </Menu.Item>}

                <Menu.Item key={routes.about}>
                    <Link to={routes.about}>About</Link>
                </Menu.Item>

                <div style={{float: "right"}}>{children}</div>
            </Menu>

        </Layout.Header>
    )
};

export default withRouter(Header);
