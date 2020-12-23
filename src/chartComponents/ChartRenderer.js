import React from "react";
import {useQuery} from "@apollo/react-hooks";
import {Col, Row, Spin, Statistic} from "antd";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {ExpandableRow, ExpandableTable} from "../history/ExpandableTable";
import moment from "moment";
import {compareDate, dateTimeFormatter} from "../utilities/utilities";
import DashWrapper from "../dashboard/DashWrapper";
import "./label.css";
import {TooltipContent} from "./ChartDisplay";

function dateIsAfter(a, b) {
    return compareDate(a, b) > 0;
}

function dateIsOnOrAfter(a, b) {
    return compareDate(a, b) >= 0;
}

function dateIsSame(a, b) {
    return compareDate(a, b) == 0;
}

const dateFormatter = item => {
    return moment(item).format("MMM DD, YYYY")
};

const xAxisFormatter = (item) => {
    if (moment(item).isValid()) {
        return dateFormatter(item)
    } else {
        return item;
    }
};

const toPercent = (decimal, fixed = 0) => `${decimal.toFixed(fixed)}%`;


const CartesianChart = ({resultSet, children, ChartComponent}) => (
    <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={resultSet.data}>
            <XAxis dataKey="x" tickFormatter={xAxisFormatter} minTickGap={20}/>
            <YAxis yAxisId="mmr" type="number" domain={[resultSet.minData, 'auto']} allowDataOverflow={true}
                   label={{value: resultSet.leftAxisLabel, angle: -90, position: 'insideLeft'}}/>

            {resultSet.seriesNames.length > 1 &&
            <YAxis yAxisId="position" type="number" domain={['auto', resultSet.lowestPos]} orientation="right"
                   reversed={true}
                   allowDataOverflow={true} label={{value: 'Position', angle: 90, position: 'insideRight'}}/>
            }
            <CartesianGrid/>
            {children}
            <Legend/>
            <Tooltip labelFormatter={dateTimeFormatter(resultSet.xAxisFormat)}/>
        </ChartComponent>
    </ResponsiveContainer>
);

const colors = [
    "#FF6492", "#141446", "#7A77FF",
    "#5dcdf8", "#506C64", "#77CBB9",
];

const patches = [
    ["Patch 19.2", "December 15, 2020", "https://playhearthstone.com/en-us/news/23584141/19-2-patch-notes"],
    ["Patch 19.0", "November 12, 2020", "https://playhearthstone.com/en-us/news/23557139/19-0-patch-notes"],
    ["Patch 18.6.1", "November 5, 2020", "https://playhearthstone.com/en-us/news/23554838/18-6-1-patch-notes"],
    ["Patch 18.6.0", "October 22, 2020", "https://playhearthstone.com/en-us/news/23534413/18-6-patch-notes"],
];

const CustomizedLabel = (props) => {
    const {viewBox, link, patch} = props;
    return <foreignObject className="label-wrapper" x={viewBox.x} y="0">
        <div xmlns="http://www.w3.org/1999/xhtml" className="custom-label">
            <a href={link}>{patch}</a>
        </div>
    </foreignObject>;

};


function createPatches(resultSet, dateField = 'date') {
    let patchesToDisplay = [];

    // add in date lines if necc

    patches.forEach(patch => {
        let patchDate = patch[1];
        let resultDateStart = resultSet.data[0][dateField];
        if (dateIsAfter(patchDate, resultDateStart)) {
            // patch date is after results period.
            patchesToDisplay.push(patch);
            let matchingDataIdx = resultSet.data.findIndex(d => dateIsOnOrAfter(d[dateField], patchDate));

            if (matchingDataIdx < 0) {

                matchingDataIdx = resultSet.data.length;
            } else {
                let matchingData = resultSet.data[matchingDataIdx];
                if (dateIsSame(matchingData[dateField], patchDate)) {
                    return; // no need to add for this patch
                }
            }
            resultSet.data.splice(matchingDataIdx, 0, {[dateField]: patchDate, 0: 0});
        }
    });

    let patchesByDate = {};
    patchesToDisplay.forEach(patch => {
        patchesByDate[patch[1]] = [patch[0], patch[2]];
    });
    return [patchesByDate, patchesToDisplay];
}

const TypeToChartComponent = {
    line: ({resultSet}) => {

        let [patchesByDate, patchesToDisplay] = createPatches(resultSet, 'x');

        return <ResponsiveContainer width="100%" height={350}>
            <LineChart data={resultSet.data} margin={{top: 20}}>
                <XAxis dataKey="x" tickFormatter={xAxisFormatter} minTickGap={20}/>
                <YAxis yAxisId="mmr" type="number" domain={[resultSet.minData, 'auto']} allowDataOverflow={true}
                       label={{value: resultSet.leftAxisLabel, angle: -90, position: 'insideLeft'}}/>
                {resultSet.seriesNames.length > 1 &&
                <YAxis yAxisId="position" type="number" domain={['auto', resultSet.lowestPos]} orientation="right"
                       reversed={true}
                       allowDataOverflow={true} label={{value: 'Position', angle: 90, position: 'insideRight'}}/>
                }
                <CartesianGrid/>
                {patchesToDisplay.map(patch => <ReferenceLine key={patch[0]} x={patch[1]} stroke="black"
                                                              label={<CustomizedLabel link={patch[2]}
                                                                                      patch={patch[0]}/>}
                                                              strokeDasharray="3 3" yAxisId="mmr"/>
                )}
                {resultSet.seriesNames.map((series, i) => (
                    <Line
                        yAxisId={series.axis}
                        key={series.key}
                        dataKey={series.key}
                        name={series.title}
                        stroke={colors[i]}
                    />
                ))}
                <Legend/>
                <Tooltip labelFormatter={dateTimeFormatter(resultSet.xAxisFormat)}/>

            </LineChart>
        </ResponsiveContainer>;
    },
    bar: ({resultSet}) => (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={resultSet.data}>
                <CartesianGrid/>
                <XAxis dataKey="turn"/>
                <YAxis tickFormatter={toPercent}/>
                <Tooltip formatter={(item) => item.toFixed(0) + "%"} content={<TooltipContent/>} unit="Games"
                         useTotalProp/>
                <Legend/>
                {resultSet.seriesNames.map((series, i) => (
                    <Bar
                        key={series.key}
                        stackId="a"
                        dataKey={series.key}
                        name={series.title}
                        fill={colors[i]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    ),
    area: ({resultSet}) => {

        let [patchesByDate, patchesToDisplay] = createPatches(resultSet);

        return <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={resultSet.data} margin={{top: 20}}>
                <CartesianGrid/>
                <XAxis dataKey="date"/>
                <YAxis/>
                <Tooltip content={<TooltipContent unit={resultSet.unit} patches={patchesByDate}/>}/>
                <Legend/>
                {patchesToDisplay.map(patch => <ReferenceLine key={patch[0]} x={patch[1]} stroke="black"
                                                              label={<CustomizedLabel link={patch[2]}
                                                                                      patch={patch[0]}/>}
                                                              strokeDasharray="3 3"/>
                )}


                {resultSet.seriesNames.map((series, i) => (
                    <Area
                        key={series.key}
                        stackId="a"
                        dataKey={series.key}
                        name={series.title}
                        stroke={colors[i % 6]}
                        fill={colors[i % 6]}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>;
    },
    pie: ({resultSet}) => (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    isAnimationActive={false}
                    data={resultSet.chartPivot()}
                    nameKey="x"
                    dataKey={resultSet.seriesNames()[0].key}
                    fill="#8884d8"
                >
                    {resultSet.chartPivot().map((e, index) => (
                        <Cell key={index} fill={colors[index % colors.length]}/>
                    ))}
                </Pie>
                <Legend/>
                <Tooltip/>
            </PieChart>
        </ResponsiveContainer>
    ),
    number: ({resultSet}) => (
        <Row
            type="flex"
            justify="center"
            align="middle"
            style={{
                height: "100%"
            }}
        >
            <Col>
                {resultSet.seriesNames().map(s => (
                    <Statistic value={resultSet.totalRow()[s.key]}/>
                ))}
            </Col>
        </Row>
    ),
    table: ({resultSet, layoutCallback}) => {
        return (
            <DashWrapper layoutCallback={layoutCallback}
                         pagination={false}
                         columns={resultSet.columns}
                         dataSource={resultSet.data}
                         rowKey={resultSet.key}
                         size="small"
            />
        );
    },
    expandableTable: ExpandableTable,
    expandableRow: ({resultSet}) => (
        <ExpandableRow
            columns={resultSet.columns}
            data={resultSet.data}
            keyField={resultSet.keyField}
            index={resultSet.index}
        />
    )
};


const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
    .map(key => ({
        [key]: React.memo(TypeToChartComponent[key])
    }))
    .reduce((a, b) => ({...a, ...b}));


const renderChart = Component => ({loading, error, data}) => (process, layoutCallback) => {

    if (loading) return <Spin style={{marginTop: "20px", display: "table", marginLeft: "auto", marginRight: "auto"}}/>;

    if (!data && error) return error.toString();

    if (data) {
        let result = process(data);
        if (result.data.length > 0)
            return <Component resultSet={result} layoutCallback={layoutCallback}/>;
        else {
            return <div style={{textAlign: "center", marginTop: "1rem"}}>No data available
            </div>
        }
    }
};

const ChartRenderer = ({item, layoutCallback, queryResult}) => {
    const {chartType, processData} = item.vizState;
    const component = TypeToMemoChartComponent[chartType];
    let renderProps = queryResult;
    if ("rawQuery" in item) renderProps = useQuery(item.rawQuery);

    let process = processData ? processData : (d) => d;
    return component && renderChart(component)(renderProps)(process, layoutCallback);
};

export default ChartRenderer;
