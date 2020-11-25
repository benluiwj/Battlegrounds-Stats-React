import moment from "moment";
import {gql} from "apollo-boost";
import {useQuery} from "@apollo/react-hooks";

export const dateTimeFormatter = format => item => moment(item).format(format);

export function sortRecordsByDate(a, b) {
    return moment(a.dateTime) - moment(b.dateTime);
}

export function compareDate(a,b){
    return moment(a) - moment(b);
}

export function playerFromUrl(player) {
    return player.replace("-", "#");
}

export function getQueryResult(fields, query, queryParams) {
    let paramString = "";
    for (let [field, sub] of Object.entries(fields)) {
        paramString += field;

        if (sub && sub.length !== 0) {
            paramString += "{" + sub.join("\n") + "}";
        }
        paramString += "\n";
    }

    let queryString = gql`{${query}(${queryParams}){${paramString}}}`;

    return useQuery(queryString);
}