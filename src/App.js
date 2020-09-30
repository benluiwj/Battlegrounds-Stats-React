import React from "react";
import "./App.css";
import "./body.css";
import {ApolloProvider} from "@apollo/react-hooks";

import client from "./graphql/client";


const App = ({children}) => (
    <ApolloProvider client={client}>
        {children}
    </ApolloProvider>
);


export default App;
